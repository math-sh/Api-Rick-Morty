import { Module } from '@nestjs/common';
import { RickAndMortyModule } from './modules/rick-and-morty/rick-and-morty.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './core/config/configuration';
import { CacheModule } from './core/common/service/cacheInMemory/cache.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CacheModule,
    RickAndMortyModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
