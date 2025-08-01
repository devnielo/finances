import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Firefly III Clone',
  version: process.env.APP_VERSION || '1.0.0',
  description: process.env.APP_DESCRIPTION || 'Personal Finance Management System',
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  url: process.env.APP_URL || 'http://localhost:3000',
  
  // Frontend configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  },

  // API configuration
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
    documentation: {
      enabled: process.env.API_DOCS_ENABLED !== 'false',
      path: process.env.API_DOCS_PATH || 'docs',
      title: process.env.API_DOCS_TITLE || 'Firefly III Clone API',
      description: process.env.API_DOCS_DESCRIPTION || 'Personal Finance Management API',
    },
  },

  // Security configuration
  security: {
    corsEnabled: process.env.CORS_ENABLED !== 'false',
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Pagination defaults
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 50,
    maxLimit: parseInt(process.env.MAX_PAGE_SIZE, 10) || 200,
  },

  // Timezone configuration
  timezone: process.env.DEFAULT_TIMEZONE || 'UTC',

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.LOG_PRETTY_PRINT === 'true',
  },
}));