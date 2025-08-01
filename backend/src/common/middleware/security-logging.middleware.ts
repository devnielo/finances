import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface SecurityEvent {
  timestamp: Date;
  type: 'SUSPICIOUS_REQUEST' | 'FAILED_AUTH' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'ACCESS_DENIED';
  ip: string;
  userAgent: string;
  userId?: string;
  endpoint: string;
  details: any;
}

@Injectable()
export class SecurityLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityLoggingMiddleware.name);
  private readonly securityEvents: SecurityEvent[] = [];
  private readonly suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const ip = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Detectar requests sospechosos
    this.detectSuspiciousActivity(req, ip, userAgent);
    
    // Log de request entrante
    this.logRequest(req, ip, userAgent);
    
    // Interceptar response para logging
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log de response
      this.logResponse(req, res, duration, ip);
      
      return originalSend.call(this, data);
    }.bind(this);

    next();
  }

  private detectSuspiciousActivity(req: Request, ip: string, userAgent: string): void {
    const suspiciousPatterns = [
      // SQL Injection patterns
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bDROP\b)/i,
      // XSS patterns
      /<script|javascript:|vbscript:|onload=|onerror=/i,
      // Path traversal
      /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i,
      // Command injection
      /(\;|\||\&|\$\(|\`)/,
    ];

    const requestContent = JSON.stringify({
      url: req.url,
      body: req.body,
      query: req.query,
      headers: req.headers
    });

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(requestContent)
    );

    if (isSuspicious) {
      this.logSecurityEvent({
        timestamp: new Date(),
        type: 'SUSPICIOUS_REQUEST',
        ip,
        userAgent,
        userId: req.user?.['id'],
        endpoint: `${req.method} ${req.path}`,
        details: {
          body: req.body,
          query: req.query,
          headers: this.sanitizeHeaders(req.headers)
        }
      });

      // Marcar IP como sospechosa
      this.markSuspiciousIP(ip);
    }

    // Detectar múltiples requests desde la misma IP
    this.checkIPFrequency(ip);

    // Detectar user agents sospechosos
    this.checkSuspiciousUserAgent(userAgent, ip);
  }

  private markSuspiciousIP(ip: string): void {
    const current = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date() };
    current.count++;
    current.lastSeen = new Date();
    this.suspiciousIPs.set(ip, current);

    if (current.count > 5) {
      this.logger.warn(`IP ${ip} marked as highly suspicious (${current.count} incidents)`);
    }
  }

  private checkIPFrequency(ip: string): void {
    // Esta lógica sería mejor implementada con Redis en producción
    // Por ahora usamos memoria local
  }

  private checkSuspiciousUserAgent(userAgent: string, ip: string): void {
    const suspiciousAgents = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /curl/i,
      /wget/i,
      /python/i,
      /^$/
    ];

    const isSuspicious = suspiciousAgents.some(pattern => 
      pattern.test(userAgent)
    );

    if (isSuspicious && !userAgent.includes('googlebot')) {
      this.logSecurityEvent({
        timestamp: new Date(),
        type: 'SUSPICIOUS_REQUEST',
        ip,
        userAgent,
        endpoint: 'USER_AGENT_CHECK',
        details: { reason: 'Suspicious user agent detected' }
      });
    }
  }

  private logRequest(req: Request, ip: string, userAgent: string): void {
    const shouldLogDetails = this.shouldLogRequestDetails(req);
    
    if (shouldLogDetails) {
      this.logger.log(`${req.method} ${req.path} - IP: ${ip} - User: ${req.user?.['id'] || 'anonymous'}`);
    }

    // Log requests a endpoints sensibles siempre
    if (this.isSensitiveEndpoint(req.path)) {
      this.logger.warn(`Sensitive endpoint accessed: ${req.method} ${req.path} - IP: ${ip} - User: ${req.user?.['id'] || 'anonymous'}`);
    }
  }

  private logResponse(req: Request, res: Response, duration: number, ip: string): void {
    const statusCode = res.statusCode;
    
    // Log responses con errores
    if (statusCode >= 400) {
      this.logger.warn(`${req.method} ${req.path} - ${statusCode} - ${duration}ms - IP: ${ip}`);
      
      if (statusCode === 401 || statusCode === 403) {
        this.logSecurityEvent({
          timestamp: new Date(),
          type: 'ACCESS_DENIED',
          ip,
          userAgent: req.headers['user-agent'] || 'unknown',
          userId: req.user?.['id'],
          endpoint: `${req.method} ${req.path}`,
          details: { statusCode, duration }
        });
      }
    }

    // Log requests lentos
    if (duration > 5000) {
      this.logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms - IP: ${ip}`);
    }
  }

  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    
    // Mantener solo los últimos 1000 eventos
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }

    this.logger.warn(`Security Event: ${event.type}`, {
      ...event,
      details: this.sanitizeDetails(event.details)
    });
  }

  private shouldLogRequestDetails(req: Request): boolean {
    // No log para health checks y requests frecuentes
    const skipPaths = ['/health', '/metrics', '/favicon.ico'];
    return !skipPaths.some(path => req.path.includes(path));
  }

  private isSensitiveEndpoint(path: string): boolean {
    const sensitivePatterns = [
      '/auth/login',
      '/auth/register',
      '/auth/reset-password',
      '/users/profile',
      '/transactions',
      '/accounts'
    ];
    
    return sensitivePatterns.some(pattern => path.includes(pattern));
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remover headers sensibles
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    
    return sanitized;
  }

  private sanitizeDetails(details: any): any {
    if (!details || typeof details !== 'object') {
      return details;
    }

    const sanitized = { ...details };
    
    // Remover información sensible
    const sensitiveFields = ['password', 'token', 'authorization', 'secret', 'key'];
    
    function recursiveSanitize(obj: any): any {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const result: any = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          result[key] = recursiveSanitize(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      
      return result;
    }

    return recursiveSanitize(sanitized);
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

  // Método para obtener eventos de seguridad (para dashboards de admin)
  getSecurityEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  // Método para obtener IPs sospechosas
  getSuspiciousIPs(): Array<{ ip: string; count: number; lastSeen: Date }> {
    return Array.from(this.suspiciousIPs.entries()).map(([ip, data]) => ({
      ip,
      ...data
    }));
  }
}