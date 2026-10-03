// Author: Mateo Garcia Carreno

// external imports
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

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
