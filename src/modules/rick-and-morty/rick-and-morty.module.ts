import { Module } from '@nestjs/common';
import { RickAndMortyService } from './rick-and-morty.service';
import { RickAndMortyController } from './rick-and-morty.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from 'src/core/common/service/cacheInMemory/cache.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [RickAndMortyController],
  providers: [RickAndMortyService],
  imports: [HttpModule, CacheModule, ConfigModule],
})
export class RickAndMortyModule {}
