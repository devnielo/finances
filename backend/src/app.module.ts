import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { AppController } from './app.controller';

// Configuration
import databaseConfig from './common/config/database.config';
import authConfig from './common/config/auth.config';
import appConfig from './common/config/app.config';
import cacheConfig from './common/config/cache.config';

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig, authConfig, cacheConfig],
      validationSchema: null, // We'll add Joi validation later
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}