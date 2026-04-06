import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // --- CORS ---
  // In production, set CORS_ORIGIN to your deployed frontend URL.
  const corsOrigin = config.get<string>('corsOrigin');
  app.enableCors({ origin: corsOrigin, methods: ['GET', 'HEAD', 'OPTIONS'] });

  // --- Global middleware ---
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // --- Swagger / OpenAPI ---
  // Available at /api in development: http://localhost:3001/api
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription(
      'REST API that provides current weather conditions and 5-day forecasts ' +
      'with heat index, wind chill, and comfort-level insights powered by OpenWeather.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3001', 'Local development')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // --- Health check ---
  // Simple endpoint outside the weather module — no dependency on any service.
  app.use('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = config.get<number>('port');
  await app.listen(port);
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/api`);
}

bootstrap();
