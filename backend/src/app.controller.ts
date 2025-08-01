import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Application')
@Controller()
@Public() // Todo el controller es público
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Información básica de la API' })
  @ApiResponse({
    status: 200,
    description: 'Información de la API',
    schema: {
      example: {
        message: 'Firefly III Clone API is running!',
        version: '1.0.0',
        environment: 'development',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  getHello(): object {
    return {
      message: 'Firefly III Clone API is running!',
      version: this.configService.get<string>('app.version') || '1.0.0',
      environment: this.configService.get<string>('app.environment') || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check de la aplicación' })
  @ApiResponse({
    status: 200,
    description: 'Estado de salud de la aplicación',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        memory: {
          rss: 50000000,
          heapTotal: 30000000,
          heapUsed: 20000000,
          external: 1000000
        }
      }
    }
  })
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}