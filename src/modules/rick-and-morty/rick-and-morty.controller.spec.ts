import { Test, TestingModule } from '@nestjs/testing';
import { RickAndMortyController } from './rick-and-morty.controller';
import { RickAndMortyService } from './rick-and-morty.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EpisodeWithCharactersResponse } from './dto/episode.dto';

describe('RickAndMortyController', () => {
  let controller: RickAndMortyController;
  let service: RickAndMortyService;

  const mockRickAndMortyService = {
    fetchEpisode: jest.fn(),
    getCharacterDetails: jest.fn(),
    getEpisodeWithCharacters: jest.fn(),
    getAllEpisodes: jest.fn(),
    getAllCharacters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RickAndMortyController],
      providers: [
        {
          provide: RickAndMortyService,
          useValue: mockRickAndMortyService,
        },
      ],
    }).compile();

    controller = module.get<RickAndMortyController>(RickAndMortyController);
    service = module.get<RickAndMortyService>(RickAndMortyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findEpisode', () => {
    it('should return an episode successfully', async () => {
      const result = { id: 1, name: 'Pilot', episode: 'S01E01' };
      mockRickAndMortyService.fetchEpisode.mockResolvedValue(result);

      const response = await controller.findEpisode('1');

      expect(response).toEqual(result);
      expect(service.fetchEpisode).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException with NOT_FOUND when episode is not found', async () => {
      mockRickAndMortyService.fetchEpisode.mockResolvedValue(null);

      await expect(controller.findEpisode('999')).rejects.toThrow(
        new HttpException('No episode found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on service failure', async () => {
      mockRickAndMortyService.fetchEpisode.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findEpisode('1')).rejects.toThrow(
        new HttpException(
          'Failed to fetch episode: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findCharacterDetails', () => {
    it('should return character details successfully', async () => {
      const result = { id: 1, name: 'Rick Sanchez', status: 'Alive' };
      mockRickAndMortyService.getCharacterDetails.mockResolvedValue(result);

      const response = await controller.findCharacterDetails('1');

      expect(response).toEqual(result);
      expect(service.getCharacterDetails).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException with NOT_FOUND when character is not found', async () => {
      mockRickAndMortyService.getCharacterDetails.mockResolvedValue(null);

      await expect(controller.findCharacterDetails('999')).rejects.toThrow(
        new HttpException('No character found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on service failure', async () => {
      mockRickAndMortyService.getCharacterDetails.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findCharacterDetails('1')).rejects.toThrow(
        new HttpException(
          'Failed to fetch character: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getEpisodeWithCharacters', () => {
    it('should return episode with characters successfully', async () => {
      const result: EpisodeWithCharactersResponse = {
        episode: {
          id: 1,
          name: 'Pilot',
          episode: 'S01E01',
          air_date: 'December 2, 2013',
          url: 'http://test.com',
          created: 'date',
        },
        characters: [],
        totalCharacters: 0,
      };
      mockRickAndMortyService.getEpisodeWithCharacters.mockResolvedValue(
        result,
      );

      const response = await controller.getEpisodeWithCharacters('1');

      expect(response).toEqual(result);
      expect(service.getEpisodeWithCharacters).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException with NOT_FOUND when episode is not found', async () => {
      mockRickAndMortyService.getEpisodeWithCharacters.mockResolvedValue(null);

      await expect(controller.getEpisodeWithCharacters('999')).rejects.toThrow(
        new HttpException('No episode found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on service failure', async () => {
      mockRickAndMortyService.getEpisodeWithCharacters.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.getEpisodeWithCharacters('1')).rejects.toThrow(
        new HttpException(
          'Failed to fetch episode with characters: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getAllEpisodes', () => {
    it('should return all episodes successfully', async () => {
      const result = [{ id: 1, name: 'Pilot' }];
      mockRickAndMortyService.getAllEpisodes.mockResolvedValue(result);

      const response = await controller.getAllEpisodes();

      expect(response).toEqual(result);
      expect(service.getAllEpisodes).toHaveBeenCalled();
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on service failure', async () => {
      mockRickAndMortyService.getAllEpisodes.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.getAllEpisodes()).rejects.toThrow(
        new HttpException(
          'Failed to fetch all episodes: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getAllCharacters', () => {
    it('should return all characters successfully', async () => {
      const result = [{ id: 1, name: 'Rick Sanchez' }];
      mockRickAndMortyService.getAllCharacters.mockResolvedValue(result);

      const response = await controller.getAllCharacters();

      expect(response).toEqual(result);
      expect(service.getAllCharacters).toHaveBeenCalled();
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR on service failure', async () => {
      mockRickAndMortyService.getAllCharacters.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.getAllCharacters()).rejects.toThrow(
        new HttpException(
          'Failed to fetch all characters: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
