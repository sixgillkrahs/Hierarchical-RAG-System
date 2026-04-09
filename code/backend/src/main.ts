import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const allowedOrigins =
    configService
      .get<string>('FRONTEND_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const appName =
    configService.get<string>('APP_NAME') ?? 'Hierarchical RAG API';
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appName)
    .setDescription('NestJS backend scaffold for a hierarchical RAG system.')
    .setVersion('0.1.0')
    .addCookieAuth(
      configService.get<string>('AUTH_COOKIE_NAME') ?? 'access_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  Logger.log(
    `HTTP server listening on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger available at http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

void bootstrap();
