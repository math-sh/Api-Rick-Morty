import { Test, TestingModule } from '@nestjs/testing';
import { RickAndMortyService } from './rick-and-morty.service';

describe('RickAndMortyService', () => {
  let service: RickAndMortyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RickAndMortyService],
    }).compile();

    service = module.get<RickAndMortyService>(RickAndMortyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
