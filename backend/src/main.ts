// Author: Mateo Garcia Carreno

// external imports
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// internal imports
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) =>
    origin.trim(),
  );
  app.enableCors({
    origin: corsOrigins?.length
      ? corsOrigins
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  });

  app.setGlobalPrefix('api');

  // whitelist drops fields a DTO does not declare, so a body cannot slip a
  // stored field like `id` or a sprint's `projectId` past the service.
  // transform hands the service the validated DTO instance rather than the
  // raw body, which is what makes @Trim()'s trimmed strings stick.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
