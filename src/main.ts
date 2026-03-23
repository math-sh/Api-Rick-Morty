import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  } as CorsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
  const document = new DocumentBuilder()
    .setTitle('Rick And Morty Teste')
    .setDescription('Api desenvolvida para teste Frente')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('api', app, documentFactory);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('APP_PORT') || 3000;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
