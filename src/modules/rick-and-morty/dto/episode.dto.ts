import { ApiProperty } from '@nestjs/swagger';

export class EpisodeLocationDto {
  @ApiProperty({
    example: 'Earth (C-137)',
    description: 'The name of the location',
  })
  name: string;

  @ApiProperty({
    example: 'https://rickandmortyapi.com/api/location/1',
    description: "Link to the location's own endpoint",
  })
  url: string;
}

export class EpisodeCharacterDto {
  @ApiProperty({ example: 1, description: 'The id of the character' })
  id: number;

  @ApiProperty({
    example: 'Rick Sanchez',
    description: 'The name of the character',
  })
  name: string;

  @ApiProperty({
    example: 'Alive',
    description: 'The status of the character ("Alive", "Dead" or "unknown")',
  })
  status: string;

  @ApiProperty({
    example: 'Human',
    description: 'The species of the character',
  })
  species: string;

  @ApiProperty({
    example: '',
    description: 'The type or subspecies of the character',
  })
  type: string;

  @ApiProperty({ example: 'Male', description: 'The gender of the character' })
  gender: string;

  @ApiProperty({
    type: EpisodeLocationDto,
    description: "Name and link to the character's origin location",
  })
  origin: EpisodeLocationDto;

  @ApiProperty({
    type: EpisodeLocationDto,
    description:
      "Name and link to the character's last known location endpoint",
  })
  location: EpisodeLocationDto;

  @ApiProperty({
    example: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    description: "Link to the character's image",
  })
  image: string;

  @ApiProperty({
    example: '2017-11-04T18:48:46.250Z',
    description: 'Time at which the character was created in the database',
  })
  created: string;
}

export class EpisodeDto {
  @ApiProperty({ example: 1, description: 'The id of the episode' })
  id: number;

  @ApiProperty({ example: 'Pilot', description: 'The name of the episode' })
  name: string;

  @ApiProperty({
    example: 'December 2, 2013',
    description: 'The air date of the episode',
  })
  air_date: string;

  @ApiProperty({ example: 'S01E01', description: 'The code of the episode' })
  episode: string;

  @ApiProperty({
    example: 'https://rickandmortyapi.com/api/episode/1',
    description: "Link to the episode's own endpoint",
  })
  url: string;

  @ApiProperty({
    example: '2017-11-10T12:56:33.798Z',
    description: 'Time at which the episode was created in the database',
  })
  created: string;
}

export class EpisodeWithCharactersResponse {
  @ApiProperty({ type: EpisodeDto, description: 'Details of the episode' })
  episode: EpisodeDto;

  @ApiProperty({
    type: [EpisodeCharacterDto],
    description: 'List of characters in the episode',
  })
  characters: EpisodeCharacterDto[];

  @ApiProperty({
    example: 2,
    description: 'Total number of characters in the response',
  })
  totalCharacters: number;
}
