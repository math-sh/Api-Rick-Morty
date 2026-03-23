import { Test, TestingModule } from '@nestjs/testing';
import { RickAndMortyService } from './rick-and-morty.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../core/common/service/cacheInMemory/cache.service';
import { of, throwError } from 'rxjs';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('RickAndMortyService', () => {
  let service: RickAndMortyService;
  let httpService: HttpService;
  let cacheService: CacheService;

  const mockApiUrl = 'https://rickandmortyapi.com/api';

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(mockApiUrl),
  };

  const mockCacheService = {
    getFromCache: jest.fn(),
    saveToCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RickAndMortyService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<RickAndMortyService>(RickAndMortyService);
    httpService = module.get<HttpService>(HttpService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchEpisode', () => {
    it('should throw BadRequestException if idEpisode is missing', async () => {
      await expect(service.fetchEpisode(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return cached data if available', async () => {
      const cachedData = { id: 1, name: 'Pilot' };
      mockCacheService.getFromCache.mockReturnValue(cachedData);

      const result = await service.fetchEpisode(1);
      expect(result).toEqual(cachedData);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from API, cache and return data if not cached', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);
      const apiResponse: AxiosResponse = {
        data: {
          id: 1,
          name: 'Pilot',
          episode: 'S01E01',
          characters: [],
          air_date: '2013-12-02',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };
      mockHttpService.get.mockReturnValue(of(apiResponse));

      const result = await service.fetchEpisode(1);

      expect(result).toEqual({
        id: 1,
        name: 'Pilot',
        code: 'S01E01',
        characters: [],
        air_date: '2013-12-02',
      });
      expect(cacheService.saveToCache).toHaveBeenCalledWith(
        'episode-1',
        expect.anything(),
      );
    });

    it('should throw InternalServerErrorException on API error', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      await expect(service.fetchEpisode(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getCharacterDetails', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(service.getCharacterDetails(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return cached data if available', async () => {
      const cachedData = { name: 'Rick' };
      mockCacheService.getFromCache.mockReturnValue(cachedData);

      const result = await service.getCharacterDetails(1);
      expect(result).toEqual(cachedData);
    });

    it('should fetch character and episodes from API correctly', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);

      // Mock first call (character)
      const characterResponse: AxiosResponse = {
        data: {
          id: 1,
          name: 'Rick',
          status: 'Alive',
          episode: ['url/1', 'url/2'],
          image: 'img.jpg',
          species: 'Human',
          gender: 'Male',
          type: '',
          origin: { name: 'Earth' },
          location: { name: 'Earth' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      // Mock second call (episodes)
      const episodesResponse: AxiosResponse = {
        data: [{ episode: 'S01E01' }, { episode: 'S01E02' }],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      mockHttpService.get
        .mockReturnValueOnce(of(characterResponse))
        .mockReturnValueOnce(of(episodesResponse));

      const result = await service.getCharacterDetails(1);

      expect(result).toEqual({
        name: 'Rick',
        status: 'Alive',
        origin: 'Earth',
        episodesCount: 2,
        firstEpisode: 'S01E01',
        image: 'img.jpg',
        location: 'Earth',
        species: 'Human',
        gender: 'Male',
        type: '',
      });
    });
  });

  describe('getEpisodeWithCharacters', () => {
    it('should throw BadRequestException if idEpisode is missing', async () => {
      await expect(service.getEpisodeWithCharacters(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return cached data', async () => {
      const result = { episode: {}, characters: [] };
      mockCacheService.getFromCache.mockReturnValue(result);

      const response = await service.getEpisodeWithCharacters(1);
      expect(response).toBe(result);
    });

    it('should fetch episode and characters successfully', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);

      const episodeResponse: AxiosResponse = {
        data: {
          id: 1,
          characters: ['url/10', 'url/20'],
          // ...outros campos
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      const charactersResponse: AxiosResponse = {
        data: [
          { id: 10, name: 'Char1', origin: {}, location: {} },
          { id: 20, name: 'Char2', origin: {}, location: {} },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      mockHttpService.get
        .mockReturnValueOnce(of(episodeResponse))
        .mockReturnValueOnce(of(charactersResponse));

      const result = await service.getEpisodeWithCharacters(1);

      expect(result.characters).toHaveLength(2);
      expect(result.totalCharacters).toBe(2);
      expect(cacheService.saveToCache).toHaveBeenCalled();
    });

    it('should handle single character result from API (API returns object, not array)', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);

      const episodeResponse: AxiosResponse = {
        data: { id: 1, characters: ['url/10'] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      const singleCharacterResponse: AxiosResponse = {
        data: { id: 10, name: 'Char1', origin: {}, location: {} }, // Objeto único, não array
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };

      mockHttpService.get
        .mockReturnValueOnce(of(episodeResponse))
        .mockReturnValueOnce(of(singleCharacterResponse));

      const result = await service.getEpisodeWithCharacters(1);

      expect(result.characters).toHaveLength(1);
      expect(result.totalCharacters).toBe(1);
    });

    it('should throw BadRequestException on 404', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);
      const error = { response: { status: 404 } };
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getEpisodeWithCharacters(999)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllEpisodes', () => {
    it('should return cached list', async () => {
      mockCacheService.getFromCache.mockReturnValue([]);
      await service.getAllEpisodes();
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and transform episodes', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);
      const apiResponse: AxiosResponse = {
        data: {
          results: [{ id: 1, name: 'Ep1', episode: 'S01', air_date: 'date' }],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };
      mockHttpService.get.mockReturnValue(of(apiResponse));

      const result = await service.getAllEpisodes();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('code', 'S01');
      expect(cacheService.saveToCache).toHaveBeenCalled();
    });
  });

  describe('getAllCharacters', () => {
    it('should fetch and transform characters', async () => {
      mockCacheService.getFromCache.mockReturnValue(null);
      const apiResponse: AxiosResponse = {
        data: {
          results: [{ id: 1, name: 'Char1', status: 'Alive' }],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      };
      mockHttpService.get.mockReturnValue(of(apiResponse));

      const result = await service.getAllCharacters();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Char1');
      expect(cacheService.saveToCache).toHaveBeenCalled();
    });
  });
});
