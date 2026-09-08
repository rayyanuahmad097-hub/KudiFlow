import { SdkDebugMiddleware } from '../src/sdk-debug.middleware';
import {
  SDK_DEBUG_REQUEST_ID_HEADER,
  SDK_DEBUG_TRACE_ID_HEADER,
} from '../src/sdk-debug.constants';
import { Request, Response, NextFunction } from 'express';

function buildReq(
  headers: Record<string, string> = {},
): Partial<Request> & { headers: Record<string, string> } {
  return { headers };
}

function buildRes(): Partial<Response> & { setHeader: jest.Mock } {
  return { setHeader: jest.fn() };
}

describe('SdkDebugMiddleware', () => {
  let middleware: SdkDebugMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new SdkDebugMiddleware();
    next = jest.fn();
  });

  it('calls next()', () => {
    const req = buildReq();
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a traceId when header is absent', () => {
    const req = buildReq();
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(req.headers[SDK_DEBUG_TRACE_ID_HEADER]).toBeDefined();
    expect(typeof req.headers[SDK_DEBUG_TRACE_ID_HEADER]).toBe('string');
    expect((req.headers[SDK_DEBUG_TRACE_ID_HEADER] as string).length).toBeGreaterThan(0);
  });

  it('generates a requestId when header is absent', () => {
    const req = buildReq();
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(req.headers[SDK_DEBUG_REQUEST_ID_HEADER]).toBeDefined();
  });

  it('preserves an existing traceId', () => {
    const existingId = 'my-custom-trace';
    const req = buildReq({ [SDK_DEBUG_TRACE_ID_HEADER]: existingId });
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(req.headers[SDK_DEBUG_TRACE_ID_HEADER]).toBe(existingId);
  });

  it('preserves an existing requestId', () => {
    const existingReqId = 'my-custom-req-id';
    const req = buildReq({ [SDK_DEBUG_REQUEST_ID_HEADER]: existingReqId });
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(req.headers[SDK_DEBUG_REQUEST_ID_HEADER]).toBe(existingReqId);
  });

  it('echoes traceId onto response headers', () => {
    const req = buildReq();
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      SDK_DEBUG_TRACE_ID_HEADER,
      req.headers[SDK_DEBUG_TRACE_ID_HEADER],
    );
  });

  it('echoes requestId onto response headers', () => {
    const req = buildReq();
    const res = buildRes();
    middleware.use(req as Request, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      SDK_DEBUG_REQUEST_ID_HEADER,
      req.headers[SDK_DEBUG_REQUEST_ID_HEADER],
    );
  });

  it('generates unique ids on every call', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const req = buildReq();
      const res = buildRes();
      middleware.use(req as Request, res as Response, next);
      ids.add(req.headers[SDK_DEBUG_TRACE_ID_HEADER]);
    }
    expect(ids.size).toBe(50);
  });
});
