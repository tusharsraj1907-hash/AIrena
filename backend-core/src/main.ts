import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Validate required environment variables
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!configService.get<string>(varName)) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (jwtSecret && jwtSecret.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long.');
  }

  const databaseUrl = configService.get<string>('DATABASE_URL');
  if (databaseUrl) {
    console.log('✅ Database URL configured');
  }

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Increase body size limit (100MB)
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 🔥 IMPORTANT FOR RENDER
  const port =
    process.env.PORT ||
    configService.get<number>('PORT') ||
    3000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on port ${port}`);
  console.log(`📌 API Prefix: /${apiPrefix}`);
}

bootstrap();
