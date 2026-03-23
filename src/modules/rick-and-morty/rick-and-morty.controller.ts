import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RickAndMortyService } from './rick-and-morty.service';
import { EpisodeWithCharactersResponse } from './dto/episode.dto';

@Controller('rick-and-morty')
export class RickAndMortyController {
  constructor(private readonly rickAndMortyService: RickAndMortyService) {}

  @Get('episode/:idEpisode')
  async findEpisode(@Param('idEpisode') idEpisode: string) {
    try {
      const response = await this.rickAndMortyService.fetchEpisode(+idEpisode);
      if (!response) {
        throw new HttpException('No episode found', HttpStatus.NOT_FOUND);
      }
      return response;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch episode: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('character/details/:id')
  async findCharacterDetails(@Param('id') id: string) {
    try {
      const response = await this.rickAndMortyService.getCharacterDetails(+id);
      if (!response) {
        throw new HttpException('No character found', HttpStatus.NOT_FOUND);
      }
      return response;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch character: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('episode/with-characters/:id')
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
    } catch (error) {
      throw new HttpException(
        `Failed to fetch episode with characters: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
