import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        ssl: configService.get<any>('database.ssl'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        autoLoadEntities: configService.get<boolean>('database.autoLoadEntities'),
        retryAttempts: configService.get<number>('database.retryAttempts'),
        retryDelay: configService.get<number>('database.retryDelay'),
        extra: configService.get<any>('database.extra'),
        cache: configService.get<any>('database.cache'),
        
        // Entities will be auto-loaded
        entities: [],
        
        // Migrations
        migrations: configService.get<string[]>('database.migrations'),
        migrationsTableName: configService.get<string>('database.migrationsTableName'),
        migrationsRun: configService.get<boolean>('database.migrationsRun'),
        
        // Additional TypeORM options
        maxQueryExecutionTime: configService.get<number>('database.query.maxQueryExecutionTime'),
        
        // Connection pool settings
        poolSize: configService.get<number>('database.extra.max'),
        
        // Query timeout
        acquireTimeout: configService.get<number>('database.query.timeout'),
        timeout: configService.get<number>('database.query.timeout'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}