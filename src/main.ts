import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable logging
  app.useLogger(Logger);
  app.enableCors(); // Enable CORS

  await app.listen(3333);
}
bootstrap();
