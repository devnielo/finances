import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Handle different response types
        if (this.isAlreadyFormatted(data)) {
          return data;
        }

        // Handle paginated responses
        if (this.isPaginatedResponse(data)) {
          return {
            data: data.items || data.data,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              statusCode: response.statusCode,
              pagination: {
                page: data.page || 1,
                limit: data.limit || data.size || 50,
                total: data.total || data.totalItems || 0,
                totalPages: data.totalPages || Math.ceil((data.total || 0) / (data.limit || data.size || 50)),
                hasNext: data.hasNext || false,
                hasPrev: data.hasPrev || false,
              },
            },
          };
        }

        // Handle array responses (assume they might need pagination info)
        if (Array.isArray(data)) {
          return {
            data,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              statusCode: response.statusCode,
            },
          };
        }

        // Handle single object responses
        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            statusCode: response.statusCode,
          },
        };
      }),
    );
  }

  private isAlreadyFormatted(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data
    );
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      (
        'items' in data ||
        'data' in data ||
        'page' in data ||
        'total' in data ||
        'totalItems' in data ||
        'totalPages' in data ||
        'limit' in data ||
        'size' in data
      )
    );
  }
}