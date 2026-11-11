import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { parseAllowedOrigins } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Configura middlewares defensivos, CORS restrito, pipes, filtros e interceptors
 * compartilhados entre o bootstrap HTTP real e os testes E2E de integração.
 */
export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const allowedOrigins = parseAllowedOrigins(
    configService.getOrThrow<string>('FRONTEND_URL'),
  );

  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
}

