import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

import {
  SDK_DEBUG_EVENTS,
  SDK_DEBUG_TRACE_ID_HEADER,
  SDK_DEBUG_REQUEST_ID_HEADER,
} from './sdk-debug.constants';
import { SdkDebugService } from './sdk-debug.service';
import { generateId } from './sdk-debug.utils';

@Injectable()
export class SdkDebugInterceptor implements NestInterceptor {
  constructor(private readonly debugService: SdkDebugService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.debugService.isEnabled) return next.handle();

    const type = ctx.getType<'http' | 'rpc' | 'ws'>();

    if (type === 'http') {
      return this.handleHttp(ctx, next);
    }

    // For RPC / WS just pass through
    return next.handle();
  }

  private handleHttp(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();

    const traceId =
      (req.headers[SDK_DEBUG_TRACE_ID_HEADER] as string) ??
      generateId('trace');
    const requestId =
      (req.headers[SDK_DEBUG_REQUEST_ID_HEADER] as string) ??
      generateId('req');

    // Echo trace ID back in response headers
    res.setHeader(SDK_DEBUG_TRACE_ID_HEADER, traceId);
    res.setHeader(SDK_DEBUG_REQUEST_ID_HEADER, requestId);

    const startTime = Date.now();

    this.debugService.debug(
      SDK_DEBUG_EVENTS.REQUEST_START,
      `→ ${req.method} ${req.url}`,
      {
        traceId,
        requestId,
        method: req.method,
        url: req.url,
        query: req.query,
        headers: this.safeHeaders(req.headers),
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.debugService.debug(
          SDK_DEBUG_EVENTS.REQUEST_END,
          `← ${req.method} ${req.url} [${res.statusCode}] ${duration}ms`,
          {
            traceId,
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
          },
        );
      }),
      catchError((err: Error) => {
        const duration = Date.now() - startTime;
        this.debugService.error(
          SDK_DEBUG_EVENTS.REQUEST_ERROR,
          `✖ ${req.method} ${req.url} FAILED after ${duration}ms`,
          err,
          {
            traceId,
            requestId,
            method: req.method,
            url: req.url,
            duration,
          },
        );
        return throwError(() => err);
      }),
    );
  }

  /** Strip Authorization header but keep everything else */
  private safeHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Record<string, string | string[] | undefined> {
    const { authorization, Authorization, ...rest } = headers as Record<
      string,
      string | string[] | undefined
    >;
    void authorization;
    void Authorization;
    return rest;
  }
}
