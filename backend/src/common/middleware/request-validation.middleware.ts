import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitizar entrada para prevenir XSS
    this.sanitizeRequest(req);
    
    // Validar tamaño del payload
    this.validatePayloadSize(req);
    
    // Validar headers requeridos
    this.validateHeaders(req);
    
    next();
  }

  private sanitizeRequest(req: Request): void {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj.trim());
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remover tags HTML básicos para prevenir XSS
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onclick\s*=/gi, '');
  }

  private validatePayloadSize(req: Request): void {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSizeInBytes) {
      throw new BadRequestException('Payload too large');
    }
  }

  private validateHeaders(req: Request): void {
    // Validar Content-Type para requests POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestException('Content-Type must be application/json');
      }
    }

    // Validar User-Agent para detectar requests automatizados sospechosos
    const userAgent = req.headers['user-agent'];
    if (!userAgent || userAgent.length < 10) {
      req.headers['x-suspicious-request'] = 'true';
    }
  }
}