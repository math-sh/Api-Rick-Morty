import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../core/common/service/cacheInMemory/cache.service';
import { EpisodeWithCharactersResponse } from './dto/episode.dto';

interface ApiEpisode {
  id: number;
  name: string;
  episode: string;
  characters: string[];
  air_date: string;
  url: string;
  created: string;
}

interface ApiCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  episode: string[];
  created: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
}

interface ApiListResponse<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}

@Injectable()
export class RickAndMortyService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.apiUrl = this.configService.get<string>('rickApi.baseUrl', '');
  }

  async fetchEpisode(idEpisode: number) {
    if (!idEpisode) {
      throw new BadRequestException('idEpisode is required');
    }

    const cacheKey = `episode-${idEpisode}`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await firstValueFrom(
        this.httpService.get<ApiEpisode>(`${this.apiUrl}/episode/${idEpisode}`),
      );

      const data = {
        id: response.data.id,
        name: response.data.name,
        code: response.data.episode,
        characters: response.data.characters,
        air_date: response.data.air_date,
      };

      this.cacheService.saveToCache(cacheKey, data);

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch episode: ${message}`,
      );
    }
  }

  async getCharacterDetails(id: number) {
    if (!id) {
      throw new BadRequestException('Character id is required');
    }

    const cacheKey = `character-${id}`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const characterResponse = await firstValueFrom(
        this.httpService.get<ApiCharacter>(`${this.apiUrl}/character/${id}`),
      );

      const character = characterResponse.data;

      const episodeIds = character.episode
        .map((url: string) => url.split('/').pop())
        .join(',');

      let episodeList: ApiEpisode[] = [];
      if (episodeIds) {
        const episodesResponse = await firstValueFrom(
          this.httpService.get<ApiEpisode | ApiEpisode[]>(
            `${this.apiUrl}/episode/${episodeIds}`,
          ),
        );
        const data = episodesResponse.data;
        episodeList = Array.isArray(data) ? data : [data];
      }

      const result = {
        name: character.name,
        status: character.status,
        origin: character?.origin?.name,
        episodesCount: episodeList.length,
        firstEpisode: episodeList[0]?.episode,
        image: character.image,
        location: character?.location?.name,
        species: character.species,
        gender: character.gender,
        type: character.type,
      };

      this.cacheService.saveToCache(cacheKey, result);

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch character details: ${message}`,
      );
    }
  }

  async getEpisodeWithCharacters(
    idEpisode: number,
  ): Promise<EpisodeWithCharactersResponse> {
    if (!idEpisode) {
      throw new BadRequestException('Episode ID is required');
    }

    const cacheKey = `episode-with-characters-${idEpisode}`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached as EpisodeWithCharactersResponse;

    try {
      const episodeResponse = await firstValueFrom(
        this.httpService.get<ApiEpisode>(`${this.apiUrl}/episode/${idEpisode}`),
      );

      const episode = episodeResponse.data;

      const characterIds = episode.characters
        .map((url: string) => url.split('/').pop())
        .join(',');

      let characters: ApiCharacter[] = [];
      if (characterIds) {
        const charactersResponse = await firstValueFrom(
          this.httpService.get<ApiCharacter | ApiCharacter[]>(
            `${this.apiUrl}/character/${characterIds}`,
          ),
        );
        const data = charactersResponse.data;
        characters = Array.isArray(data) ? data : [data];
      }

      const formattedCharacters = characters.map((char) => ({
        id: char.id,
        name: char.name,
        status: char.status,
        species: char.species,
        type: char.type,
        gender: char.gender,
        origin: {
          name: char.origin.name,
          url: char.origin.url,
        },
        location: {
          name: char.location.name,
          url: char.location.url,
        },
        image: char.image,
        created: char.created,
      }));

      const result: EpisodeWithCharactersResponse = {
        episode: {
          id: episode.id,
          name: episode.name,
          air_date: episode.air_date,
          episode: episode.episode,
          url: episode.url,
          created: episode.created,
        },
        characters: formattedCharacters,
        totalCharacters: formattedCharacters.length,
      };

      this.cacheService.saveToCache(cacheKey, result, 300000);

      return result;
    } catch (error: unknown) {
      const anyError = error as any; // Cast temporário para verificar status
      if (anyError.response?.status === 404) {
        throw new BadRequestException('Episode not found');
      }
      throw new InternalServerErrorException(
        'Failed to fetch episode with characters',
      );
    }
  }

  async getAllEpisodes() {
    const cacheKey = `all-episodes`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await firstValueFrom(
        this.httpService.get<ApiListResponse<ApiEpisode>>(
          `${this.apiUrl}/episode`,
        ),
      );

      const episodes = response.data.results.map((ep) => ({
        id: ep.id,
        name: ep.name,
        code: ep.episode,
        air_date: ep.air_date,
      }));

      this.cacheService.saveToCache(cacheKey, episodes, 300000);

      return episodes;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch all episodes: ${message}`,
      );
    }
  }

  async getAllCharacters() {
    const cacheKey = `all-characters`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await firstValueFrom(
        this.httpService.get<ApiListResponse<ApiCharacter>>(
          `${this.apiUrl}/character`,
        ),
      );

      const characters = response.data.results.map((char) => ({
        id: char.id,
        name: char.name,
        status: char.status,
        species: char.species,
        type: char.type,
        gender: char.gender,
        image: char.image,
      }));

      this.cacheService.saveToCache(cacheKey, characters, 300000);

      return characters;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to fetch all characters: ${message}`,
      );
    }
  }
}
