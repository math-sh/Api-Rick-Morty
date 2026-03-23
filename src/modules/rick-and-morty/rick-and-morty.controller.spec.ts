import { Test, TestingModule } from '@nestjs/testing';
import { RickAndMortyController } from './rick-and-morty.controller';
import { RickAndMortyService } from './rick-and-morty.service';

describe('RickAndMortyController', () => {
  let controller: RickAndMortyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RickAndMortyController],
      providers: [RickAndMortyService],
    }).compile();

    controller = module.get<RickAndMortyController>(RickAndMortyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
