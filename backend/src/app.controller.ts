import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHello(): object {
    return {
      message: 'Firefly III Clone API is running!',
      version: this.configService.get<string>('app.version') || '1.0.0',
      environment: this.configService.get<string>('app.environment') || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}