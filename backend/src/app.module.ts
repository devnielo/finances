import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Controllers
import { AppController } from './app.controller';

// Common modules
import { DatabaseModule } from './common/database/database.module';
import { CommonModule } from './common/common.module';

// Feature modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

// Guards
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    CategoriesModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT guard - all endpoints protected by default
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}