import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  SDK_DEBUG_REQUEST_ID_HEADER,
  SDK_DEBUG_TRACE_ID_HEADER,
} from './sdk-debug.constants';
import { generateId } from './sdk-debug.utils';

/**
 * Middleware that ensures every incoming request has a traceId and requestId.
 * Apply globally in AppModule or selectively per route group.
 *
 * @example
 * // app.module.ts
 * configure(consumer: MiddlewareConsumer) {
 *   consumer.apply(SdkDebugMiddleware).forRoutes('*');
 * }
 */
@Injectable()
export class SdkDebugMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (!req.headers[SDK_DEBUG_TRACE_ID_HEADER]) {
      req.headers[SDK_DEBUG_TRACE_ID_HEADER] = generateId('trace');
    }
    if (!req.headers[SDK_DEBUG_REQUEST_ID_HEADER]) {
      req.headers[SDK_DEBUG_REQUEST_ID_HEADER] = generateId('req');
    }

    // Expose on res headers too
    res.setHeader(
      SDK_DEBUG_TRACE_ID_HEADER,
      req.headers[SDK_DEBUG_TRACE_ID_HEADER] as string,
    );
    res.setHeader(
      SDK_DEBUG_REQUEST_ID_HEADER,
      req.headers[SDK_DEBUG_REQUEST_ID_HEADER] as string,
    );

    next();
  }
}
