import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { RequestValidationMiddleware } from './common/middleware/request-validation.middleware';
import { RateLimitingMiddleware } from './common/middleware/rate-limiting.middleware';
import { SecurityLoggingMiddleware } from './common/middleware/security-logging.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const nodeEnv = configService.get<string>('app.environment') || 'development';
  
  // Security middleware - aplicar primero
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));
  
  // Compression middleware
  app.use(compression());
  
  // Security logging middleware
  app.use(new SecurityLoggingMiddleware(configService).use.bind(new SecurityLoggingMiddleware(configService)));
  
  // Request validation middleware
  app.use(new RequestValidationMiddleware().use.bind(new RequestValidationMiddleware()));
  
  // Rate limiting middleware
  app.use(new RateLimitingMiddleware(configService).use.bind(new RateLimitingMiddleware(configService)));
  
  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
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

  // Enhanced CORS configuration
  app.enableCors({
    origin: nodeEnv === 'production'
      ? configService.get<string>('app.frontend.url')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    maxAge: 86400, // 24 hours preflight cache
  });

  // Swagger/OpenAPI Documentation
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Firefly III Clone API')
      .setDescription(`
        **API completa para gestión financiera personal - Clone de Firefly III**
        
        Esta API proporciona todas las funcionalidades necesarias para crear una aplicación
        de gestión financiera personal moderna, incluyendo:
        
        ## 🔐 Autenticación y Seguridad
        - Registro y login de usuarios
        - Autenticación JWT
        - Two-Factor Authentication (2FA) con TOTP
        - Códigos de backup para recuperación
        
        ## 💰 Gestión de Cuentas
        - Múltiples tipos de cuenta (Asset, Expense, Revenue, Liability)
        - Validación de IBAN y números de cuenta
        - Cálculo automático de balances
        - Gestión de metadatos y monedas
        
        ## 💸 Transacciones
        - Tipos de transacción (withdrawal, deposit, transfer)
        - Split transactions (transacciones divididas)
        - Soporte para múltiples monedas
        - Sistema de reconciliación bancaria
        - Filtrado y búsqueda avanzada
        
        ## 📊 Reportes y Análisis
        - Resúmenes financieros
        - Estadísticas de transacciones
        - Balances por cuenta
        - Métricas de ingresos y gastos
        
        ## 🛡️ Seguridad
        - Todos los endpoints protegidos por JWT por defecto
        - Validación de datos con class-validator
        - Transacciones atómicas en base de datos
        - Aislamiento de datos por usuario
        
        ## 📝 Uso de la API
        1. **Registro**: POST /auth/register
        2. **Login**: POST /auth/login
        3. **Obtener token JWT** del login
        4. **Usar token** en header Authorization: Bearer <token>
        5. **Crear cuentas**: POST /accounts
        6. **Crear transacciones**: POST /transactions
        
        **Nota**: Los endpoints marcados con 🔓 son públicos, el resto requieren autenticación.
      `)
      .setVersion('1.0.0')
      .setContact(
        'Firefly III Clone API',
        'https://github.com/firefly-iii/firefly-iii',
        'support@firefly-iii.org'
      )
      .setLicense('AGPL-3.0', 'https://www.gnu.org/licenses/agpl-3.0.html')
      .addServer(`http://localhost:${port}/api/v1`, 'Development Server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addTag('auth', '🔐 Autenticación y registro de usuarios')
      .addTag('users', '👥 Gestión de usuarios')
      .addTag('accounts', '💰 Gestión de cuentas financieras')
      .addTag('transactions', '💸 Gestión de transacciones')
      .addTag('categories', '🗂️ Gestión de categorías')
      .addTag('dashboard', '📊 Dashboard y análisis financiero')
      .addTag('Health', '🏥 Health checks y monitoreo del sistema')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          theme: 'agate'
        },
      },
      customSiteTitle: 'Firefly III Clone API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  
  logger.log(` Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Environment: ${nodeEnv}`);
  if (nodeEnv === 'development') {
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});