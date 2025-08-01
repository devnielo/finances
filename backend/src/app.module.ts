import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { AppController } from './app.controller';

// Common modules
import { DatabaseModule } from './common/database/database.module';
import { CommonModule } from './common/common.module';

// Feature modules
import { UsersModule } from './users/users.module';

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

    // Database module
    DatabaseModule,

    // Common utilities
    CommonModule,

    // Feature modules
    UsersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}