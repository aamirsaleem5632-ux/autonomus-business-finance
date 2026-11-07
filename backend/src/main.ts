import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  const rawCors = configService.get<string>('corsOrigin') ?? 'http://localhost:5173';
  const allowedOrigins = rawCors.split(',').map((o) => o.trim());

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend applications
  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!requestOrigin || (allowedOrigins as string[]).includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global filters and interceptors
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  logger.log(
    `Autonomous Business Finance Platform Backend running at http://localhost:${port}/api`,
  );
  logger.log(`Health Check endpoint: http://localhost:${port}/api/health`);
}

await bootstrap();