import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/core/common/service/cacheInMemory/cache.service';
import { EpisodeWithCharactersResponse } from './dto/episode.dto';

@Injectable()
export class RickAndMortyService {
  private readonly apiUrl: any;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.apiUrl = this.configService.get('rickApi.baseUrl');
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
        this.httpService.get(`${this.apiUrl}/episode/${idEpisode}`),
      );

      const data = {
        id: response.data.id,
        name: response.data.name,
        code: response.data.episode,
      };

      this.cacheService.saveToCache(cacheKey, data);

      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch episode: ${error.message}`,
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
        this.httpService.get(`${this.apiUrl}/character/${id}`),
      );

      const character = characterResponse.data;

      const episodeIds = character.episode
        .map((url: string) => url.split('/').pop())
        .join(',');

      const episodesResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/episode/${episodeIds}`),
      );

      const episodes = episodesResponse.data;
      const episodeList = Array.isArray(episodes) ? episodes : [episodes];

      const result = {
        name: character.name,
        status: character.status,
        origin: character?.origin?.name,
        episodesCount: episodeList.length,
        firstEpisode: episodeList[0]?.episode,
      };

      this.cacheService.saveToCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch character details: ${error.message}`,
      );
    }
  }

  // ✅ NOVO MÉTODO
  async getEpisodeWithCharacters(
    idEpisode: number,
  ): Promise<EpisodeWithCharactersResponse> {
    if (!idEpisode) {
      throw new BadRequestException('Episode ID is required');
    }

    const cacheKey = `episode-with-characters-${idEpisode}`;
    const cached = this.cacheService.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // 1. Buscar dados do episódio
      const episodeResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/episode/${idEpisode}`),
      );

      const episode = episodeResponse.data;

      // 2. Extrair IDs dos personagens das URLs
      const characterIds = episode.characters
        .map((url: string) => url.split('/').pop())
        .join(',');

      // 3. Buscar dados completos dos personagens
      const charactersResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/character/${characterIds}`),
      );

      const characters = Array.isArray(charactersResponse.data)
        ? charactersResponse.data
        : [charactersResponse.data];

      // 4. Mapear e formatar os dados dos personagens
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

      // 5. Preparar resposta
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

      // 6. Salvar em cache com TTL de 5 minutos
      this.cacheService.saveToCache(cacheKey, result, 300000);

      return result;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException('Episode not found');
      }
      throw new InternalServerErrorException(
        'Failed to fetch episode with characters',
      );
    }
  }
}
