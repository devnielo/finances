import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  lastAttempt: number;
}

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitRecord>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    // Limpiar registros expirados cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.generateKey(req);
    const limits = this.getLimitsForEndpoint(req);
    
    const record = this.store.get(key) || {
      count: 0,
      resetTime: Date.now() + limits.windowMs,
      lastAttempt: Date.now()
    };

    // Resetear si la ventana ha expirado
    if (Date.now() > record.resetTime) {
      record.count = 0;
      record.resetTime = Date.now() + limits.windowMs;
    }

    record.count++;
    record.lastAttempt = Date.now();
    this.store.set(key, record);

    // Verificar si se excedió el límite
    if (record.count > limits.max) {
      const retryAfter = Math.ceil((record.resetTime - Date.now()) / 1000);
      
      res.set({
        'X-RateLimit-Limit': limits.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        'Retry-After': retryAfter.toString()
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
          retryAfter: retryAfter
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Agregar headers informativos
    res.set({
      'X-RateLimit-Limit': limits.max.toString(),
      'X-RateLimit-Remaining': Math.max(0, limits.max - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });

    next();
  }

  private generateKey(req: Request): string {
    // Usar IP + User ID (si está autenticado) + endpoint
    const ip = this.getClientIP(req);
    const userId = req.user?.['id'] || 'anonymous';
    const endpoint = `${req.method}:${req.route?.path || req.path}`;
    
    return `${ip}:${userId}:${endpoint}`;
  }

  private getClientIP(req: Request): string {
    return req.ip ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           (req.connection as any)?.socket?.remoteAddress ||
           req.headers['x-forwarded-for']?.toString().split(',')[0] ||
           req.headers['x-real-ip']?.toString() ||
           'unknown';
  }

  private getLimitsForEndpoint(req: Request): { max: number; windowMs: number } {
    const method = req.method;
    const path = req.route?.path || req.path;

    // Límites más estrictos para operaciones sensibles
    if (path.includes('/auth/login') || path.includes('/auth/register')) {
      return { max: 5, windowMs: 15 * 60 * 1000 }; // 5 intentos por 15 minutos
    }

    if (path.includes('/auth/forgot-password') || path.includes('/auth/reset-password')) {
      return { max: 3, windowMs: 60 * 60 * 1000 }; // 3 intentos por hora
    }

    if (path.includes('/auth/verify-2fa')) {
      return { max: 10, windowMs: 15 * 60 * 1000 }; // 10 intentos por 15 minutos
    }

    // Límites para operaciones de escritura
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return { max: 100, windowMs: 15 * 60 * 1000 }; // 100 operaciones por 15 minutos
    }

    // Límites para operaciones de lectura
    if (method === 'GET') {
      if (path.includes('/dashboard') || path.includes('/transactions/summary')) {
        return { max: 60, windowMs: 60 * 1000 }; // 60 requests por minuto para endpoints pesados
      }
      return { max: 200, windowMs: 60 * 1000 }; // 200 requests por minuto para GET normales
    }

    // Límite por defecto
    return { max: 100, windowMs: 60 * 1000 }; // 100 requests por minuto
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((record, key) => {
      // Eliminar registros que no se han usado en la última hora
      if (now - record.lastAttempt > 60 * 60 * 1000) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.store.delete(key));
    
    console.log(`Rate limit cleanup: removed ${keysToDelete.length} expired records`);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}