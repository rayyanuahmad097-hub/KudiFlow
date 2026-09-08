import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { SdkDebugInterceptor } from '../src/sdk-debug.interceptor';
import { SdkDebugService } from '../src/sdk-debug.service';
import { SDK_DEBUG_TRACE_ID_HEADER } from '../src/sdk-debug.constants';

function mockHttpContext(
  method = 'GET',
  url = '/test',
  headers: Record<string, string> = {},
): ExecutionContext {
  const req = {
    method,
    url,
    headers: { 'user-agent': 'jest', ...headers },
    query: {},
    body: {},
    ip: '127.0.0.1',
  };
  const res = {
    statusCode: 200,
    setHeader: jest.fn(),
  };
  return {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
}

function mockRpcContext(): ExecutionContext {
  return {
    getType: () => 'rpc',
  } as unknown as ExecutionContext;
}

describe('SdkDebugInterceptor', () => {
  let interceptor: SdkDebugInterceptor;
  let debugService: jest.Mocked<SdkDebugService>;

  beforeEach(() => {
    debugService = {
      isEnabled: true,
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<SdkDebugService>;

    interceptor = new SdkDebugInterceptor(debugService);
  });

  describe('HTTP context', () => {
    it('logs request start', (done) => {
      const ctx = mockHttpContext('GET', '/users');
      const handler: CallHandler = { handle: () => of({ users: [] }) };

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(debugService.debug).toHaveBeenCalledWith(
            expect.stringContaining('request'),
            expect.stringContaining('GET'),
            expect.objectContaining({ method: 'GET', url: '/users' }),
          );
          done();
        },
      });
    });

    it('logs request end on success', (done) => {
      const ctx = mockHttpContext('POST', '/payments');
      const handler: CallHandler = { handle: () => of({ id: 'pay-1' }) };

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          // Should have 2 debug calls: start + end
          expect(debugService.debug).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });

    it('logs error on failure', (done) => {
      const ctx = mockHttpContext('DELETE', '/resource/1');
      const err = new Error('not found');
      const handler: CallHandler = { handle: () => throwError(() => err) };

      interceptor.intercept(ctx, handler).subscribe({
        error: () => {
          expect(debugService.error).toHaveBeenCalledWith(
            expect.stringContaining('error'),
            expect.any(String),
            err,
            expect.objectContaining({ url: '/resource/1' }),
          );
          done();
        },
      });
    });

    it('sets trace/request ID headers on response', (done) => {
      const ctx = mockHttpContext();
      const res = ctx.switchToHttp().getResponse() as { setHeader: jest.Mock };
      const handler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(res.setHeader).toHaveBeenCalledWith(
            SDK_DEBUG_TRACE_ID_HEADER,
            expect.any(String),
          );
          done();
        },
      });
    });

    it('does not re-generate trace ID when header already present', (done) => {
      const existingTrace = 'existing-trace-id';
      const ctx = mockHttpContext('GET', '/ping', {
        [SDK_DEBUG_TRACE_ID_HEADER]: existingTrace,
      });
      const res = ctx.switchToHttp().getResponse() as { setHeader: jest.Mock };
      const handler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          expect(res.setHeader).toHaveBeenCalledWith(
            SDK_DEBUG_TRACE_ID_HEADER,
            existingTrace,
          );
          done();
        },
      });
    });

    it('does not include Authorization in logged headers', (done) => {
      const ctx = mockHttpContext('GET', '/secure', {
        authorization: 'Bearer secret-token',
      });
      const handler: CallHandler = { handle: () => of({}) };

      interceptor.intercept(ctx, handler).subscribe({
        complete: () => {
          const startCall = (debugService.debug as jest.Mock).mock.calls[0];
          const meta = startCall[2] as Record<string, unknown>;
          const headers = meta.headers as Record<string, unknown>;
          expect(headers).not.toHaveProperty('authorization');
          expect(headers).not.toHaveProperty('Authorization');
          done();
        },
      });
    });
  });

  describe('Non-HTTP context', () => {
    it('passes through RPC calls without logging', (done) => {
      const ctx = mockRpcContext();
      const handler: CallHandler = { handle: () => of({ rpcResult: true }) };

      interceptor.intercept(ctx, handler).subscribe({
        next: (val) => {
          expect(val).toEqual({ rpcResult: true });
          expect(debugService.debug).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('when disabled', () => {
    it('passes through without logging', (done) => {
      (debugService as { isEnabled: boolean }).isEnabled = false;
      const ctx = mockHttpContext();
      const handler: CallHandler = { handle: () => of({ data: 1 }) };

      interceptor.intercept(ctx, handler).subscribe({
        next: (val) => {
          expect(val).toEqual({ data: 1 });
          expect(debugService.debug).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
