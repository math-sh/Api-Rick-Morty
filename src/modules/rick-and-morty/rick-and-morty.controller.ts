import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RickAndMortyService } from './rick-and-morty.service';
import { EpisodeWithCharactersResponse } from './dto/episode.dto';

@ApiTags('Rick and Morty')
@Controller('rick-and-morty')
export class RickAndMortyController {
  constructor(private readonly rickAndMortyService: RickAndMortyService) {}

  @Get('episode/:idEpisode')
  @ApiOperation({
    summary: 'Find episode by ID',
    description:
      'Fetches details of a specific episode from the Rick and Morty API.',
  })
  @ApiParam({
    name: 'idEpisode',
    description: 'The ID of the episode',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Episode details retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Episode not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findEpisode(@Param('idEpisode') idEpisode: string) {
    try {
      const response = await this.rickAndMortyService.fetchEpisode(+idEpisode);
      if (!response) {
        throw new HttpException('No episode found', HttpStatus.NOT_FOUND);
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch episode: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('character/details/:id')
  @ApiOperation({
    summary: 'Find character details by ID',
    description:
      'Fetches detailed information about a character including their episodes.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the character',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Character details retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Character not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findCharacterDetails(@Param('id') id: string) {
    try {
      const response = await this.rickAndMortyService.getCharacterDetails(+id);
      if (!response) {
        throw new HttpException('No character found', HttpStatus.NOT_FOUND);
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch character: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('episode/with-characters/:id')
  @ApiOperation({
    summary: 'Get episode with full character details',
    description:
      'Fetches an episode and includes full details of all characters in that episode.',
  })
  @ApiParam({ name: 'id', description: 'The ID of the episode', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Episode and characters retrieved successfully.',
    type: EpisodeWithCharactersResponse,
  })
  @ApiResponse({ status: 404, description: 'Episode not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getEpisodeWithCharacters(
    @Param('id') id: string,
  ): Promise<EpisodeWithCharactersResponse> {
    try {
      const episode =
        await this.rickAndMortyService.getEpisodeWithCharacters(+id);
      if (!episode) {
        throw new HttpException('No episode found', HttpStatus.NOT_FOUND);
      }
      return episode;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch episode with characters: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-episodes')
  @ApiOperation({
    summary: 'Get all episodes',
    description: 'Fetches a list of all episodes available.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all episodes retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAllEpisodes() {
    try {
      const episodes = await this.rickAndMortyService.getAllEpisodes();
      return episodes;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch all episodes: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-characters')
  @ApiOperation({
    summary: 'Get all characters',
    description: 'Fetches a list of all characters available.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all characters retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getAllCharacters() {
    try {
      const characters = await this.rickAndMortyService.getAllCharacters();
      return characters;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch all characters: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
