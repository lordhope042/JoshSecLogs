import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
const PORT = process.env.PORT || 5000;

await app.listen(PORT);

console.log(`
=========================================
🚀 JoshSecLogs Backend Started
=========================================
Environment : ${process.env.NODE_ENV || 'development'}
Server      : http://localhost:${PORT}
API         : http://localhost:${PORT}/api/v1
=========================================
`);
}

bootstrap();