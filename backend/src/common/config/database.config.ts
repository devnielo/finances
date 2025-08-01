import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'firefly',
  password: process.env.DB_PASSWORD || 'firefly',
  database: process.env.DB_DATABASE || 'firefly_iii_clone',
  
  // Connection pool settings
  extra: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 60000,
    idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
  },

  // SSL configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY,
  } : false,

  // TypeORM settings
  synchronize: process.env.DB_SYNCHRONIZE === 'true', // Only for development
  logging: process.env.DB_LOGGING === 'true',
  autoLoadEntities: true,
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS, 10) || 3,
  retryDelay: parseInt(process.env.DB_RETRY_DELAY, 10) || 3000,

  // Migration settings
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',

  // Seed settings
  seeds: ['dist/database/seeds/*.js'],
  factories: ['dist/database/factories/*.js'],

  // Performance settings
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_CACHE_DB, 10) || 2,
    },
    duration: parseInt(process.env.DB_CACHE_DURATION, 10) || 30000, // 30 seconds
  },

  // Query optimization
  query: {
    timeout: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 30000, // 30 seconds
    maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_TIME, 10) || 1000, // 1 second for logging slow queries
  },
}));