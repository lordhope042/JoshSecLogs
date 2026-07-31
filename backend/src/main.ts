import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // FIX: rawBody is required so the Paystack webhook endpoint can compute an
  // exact HMAC-SHA512 signature over the original bytes.  Without this,
  // `req.rawBody` is undefined and signature verification fails — which means
  // Paystack webhooks would either be rejected or, worse, accepted on a
  // re-serialised body that no longer matches the signature.
  const options: NestApplicationOptions = {
    rawBody: true,
  };

  const app = await NestFactory.create(AppModule, options);

  app.setGlobalPrefix('api/v1');

  // FIX: adds Strict-Transport-Security, X-Frame-Options,
  // X-Content-Type-Options, and related headers — all previously absent.
  // crossOriginResourcePolicy is explicitly set to "cross-origin" because
  // this API is deliberately called from a separate frontend origin
  // (joshseclogs.com) — helmet's stricter default would otherwise block
  // some cross-origin resource loads.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // This is a JSON API, not an HTML-rendering app, so a restrictive
      // page-level CSP has little effect here and is more relevant to
      // configure on the Next.js frontend instead (see next.config.js).
      contentSecurityPolicy: false,
    }),
  );

  // FIX: without this, @IsEmail/@MinLength/@Matches etc. on your DTOs are
  // pure decoration — NestJS only runs class-validator checks when a
  // ValidationPipe is actually registered. This is why malformed request
  // bodies (wrong types, unexpected shapes) were reaching your service and
  // Prisma layer unchecked and crashing with a 500 instead of being
  // rejected with a clean 400 here at the boundary.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips any property not declared on the DTO (e.g. a smuggled "role" field)
      forbidNonWhitelisted: true, // reject the request outright instead of silently dropping extra fields
      transform: true, // converts payloads into real DTO instances so decorators actually run against them
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: [
      // Production
      'https://www.joshseclogs.com',
      'https://joshseclogs.com',

      // Railway Preview
      'https://joshseclogs-frontend-production.up.railway.app',

      // Development
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();