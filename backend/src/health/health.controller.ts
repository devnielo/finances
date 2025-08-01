import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check general del sistema',
    description: 'Verifica el estado general de la aplicación y sus dependencias'
  })
  @ApiResponse({
    status: 200,
    description: 'Sistema saludable',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            }
          }
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Sistema no saludable'
  })
  async check() {
    try {
      // Verificar conexión a base de datos
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        info: {
          database: {
            status: 'up'
          }
        },
        error: {},
        details: {
          database: {
            status: 'up'
          }
        }
      };
    } catch (error) {
      return {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: error.message
          }
        },
        details: {
          database: {
            status: 'down',
            message: error.message
          }
        }
      };
    }
  }

  @Get('ready')
  @Public()
  @ApiOperation({ 
    summary: 'Readiness probe',
    description: 'Verifica si la aplicación está lista para recibir tráfico'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicación lista',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ready' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Tiempo en segundos desde el inicio' }
      }
    }
  })
  readiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  @Get('live')
  @Public()
  @ApiOperation({ 
    summary: 'Liveness probe',
    description: 'Verifica si la aplicación está viva y respondiendo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicación viva',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
        timestamp: { type: 'string', format: 'date-time' },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number', description: 'Memoria usada en MB' },
            total: { type: 'number', description: 'Memoria total en MB' }
          }
        }
      }
    }
  })
  liveness() {
    const memUsage = process.memoryUsage();
    
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      }
    };
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ 
    summary: 'Health check detallado',
    description: 'Información detallada del estado del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información detallada del sistema',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        uptime: { type: 'number' },
        memory: { type: 'object' },
        cpu: { type: 'object' },
        database: { type: 'object' }
      }
    }
  })
  async detailedHealth() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    try {
      // Verificar conexión a base de datos
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024), // MB
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        database: {
          status: 'up',
          connected: true
        },
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        uptime: process.uptime(),
        database: {
          status: 'down',
          connected: false
        }
      };
    }
  }
}