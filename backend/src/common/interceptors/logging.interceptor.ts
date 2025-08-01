import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Extract user information if available
    const userId = (request as any).user?.id || 'anonymous';
    const requestId = headers['x-request-id'] || this.generateRequestId();

    // Log incoming request
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent} - User: ${userId}`,
      'IncomingRequest',
    );

    // Log request body for non-GET requests (excluding sensitive data)
    if (method !== 'GET' && request.body) {
      const sanitizedBody = this.sanitizeBody(request.body);
      this.logger.debug(
        `[${requestId}] Request Body: ${JSON.stringify(sanitizedBody)}`,
        'RequestBody',
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`,
            'CompletedRequest',
          );

          // Log response for debugging (only in development)
          if (process.env.NODE_ENV === 'development' && data) {
            const sanitizedResponse = this.sanitizeResponse(data);
            this.logger.debug(
              `[${requestId}] Response: ${JSON.stringify(sanitizedResponse).substring(0, 500)}...`,
              'ResponseData',
            );
          }

          // Log slow requests
          if (duration > 1000) {
            this.logger.warn(
              `[${requestId}] Slow request detected: ${method} ${url} took ${duration}ms`,
              'SlowRequest',
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode || 500;
          
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - Error: ${error.message} - User: ${userId}`,
            error.stack,
            'ErrorRequest',
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'passwordConfirmation',
      'currentPassword',
      'newPassword',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'privateKey',
      'creditCardNumber',
      'cvv',
      'ssn',
      'pin',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // If it's an array, sanitize each item
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item));
    }

    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'privateKey',
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // If response has nested data, sanitize it too
    if (sanitized.data) {
      sanitized.data = this.sanitizeResponse(sanitized.data);
    }

    return sanitized;
  }
}