import { Test, TestingModule } from '@nestjs/testing';
import { SdkDebugModule } from '../src/sdk-debug.module';
import { SdkDebugService } from '../src/sdk-debug.service';
import { SdkDebugInterceptor } from '../src/sdk-debug.interceptor';
import { SdkDebugMiddleware } from '../src/sdk-debug.middleware';
import { SdkDebugLogEntry, SdkDebugModuleOptions } from '../src/sdk-debug.types';
import { SDK_DEBUG_TRANSPORT } from '../src/sdk-debug.constants';

// suppress console noise
jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

describe('SdkDebugModule — integration', () => {
  let module: TestingModule;
  let service: SdkDebugService;
  const captured: SdkDebugLogEntry[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        SdkDebugModule.forRoot({
          enabled: true,
          level: 'verbose',
          namespace: 'KudiFlow-Test',
          colorize: false,
          includeSystemInfo: true,
          includeMemoryUsage: true,
          includeStackTrace: true,
          globalMeta: { env: 'test' },
          sensitiveKeys: ['password', 'apiKey'],
          transports: [
            {
              type: SDK_DEBUG_TRANSPORT.CUSTOM,
              handler: (e) => captured.push(e),
            },
          ],
        }),
      ],
    }).compile();

    service = module.get(SdkDebugService);
  });

  afterAll(() => module.close());
  afterEach(() => captured.splice(0));

  it('provides SdkDebugService', () => {
    expect(service).toBeInstanceOf(SdkDebugService);
  });

  it('provides SdkDebugInterceptor', () => {
    expect(module.get(SdkDebugInterceptor)).toBeInstanceOf(SdkDebugInterceptor);
  });

  it('provides SdkDebugMiddleware', () => {
    expect(module.get(SdkDebugMiddleware)).toBeInstanceOf(SdkDebugMiddleware);
  });

  it('writes logs to custom transport', () => {
    service.info('test.integration', 'hello from integration test');
    expect(captured).toHaveLength(1);
    expect(captured[0].namespace).toBe('KudiFlow-Test');
    expect(captured[0].event).toBe('test.integration');
  });

  it('redacts sensitive keys in integration context', () => {
    service.debug('test.auth', 'login attempt', {
      username: 'alice',
      password: 'hunter2',
    });
    expect(captured[0].meta?.password).toBe('[REDACTED]');
    expect(captured[0].meta?.username).toBe('alice');
  });

  it('attaches globalMeta to every entry', () => {
    service.debug('x', 'msg');
    expect(captured[0].meta?.env).toBe('test');
  });

  it('attaches systemInfo when configured', () => {
    service.debug('x', 'msg');
    expect(captured[0].system).toBeDefined();
    expect(captured[0].system?.pid).toBe(process.pid);
  });

  it('attaches memoryInfo when configured', () => {
    service.debug('x', 'msg');
    expect(captured[0].memory).toBeDefined();
    expect(captured[0].memory?.heapUsedMB).toBeGreaterThanOrEqual(0);
  });

  it('trace() captures success result', async () => {
    const result = await service.trace('test.trace', 'AddNumbers', async () => 1 + 1);
    expect(result).toBe(2);
    // 2 entries: start + end
    expect(captured).toHaveLength(2);
    const endEntry = captured[1];
    expect(endEntry.meta?.success).toBe(true);
  });

  it('trace() captures error and rethrows', async () => {
    await expect(
      service.trace('test.trace.fail', 'BadOp', async () => {
        throw new Error('intentional');
      }),
    ).rejects.toThrow('intentional');
    // 3 entries: start + end + error
    expect(captured.length).toBeGreaterThanOrEqual(2);
    expect(captured.some((e) => e.error !== undefined)).toBe(true);
  });

  it('getStats() aggregates across multiple calls', () => {
    service.info('a', '1');
    service.info('b', '2');
    service.error('c', '3');
    const stats = service.getStats();
    expect(stats.totalLogs).toBeGreaterThanOrEqual(3);
    expect(stats.logsByLevel.info).toBeGreaterThanOrEqual(2);
    expect(stats.logsByLevel.error).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// forRootAsync test
// ---------------------------------------------------------------------------
describe('SdkDebugModule.forRootAsync', () => {
  it('registers via useFactory', async () => {
    const mod = await Test.createTestingModule({
      imports: [
        SdkDebugModule.forRootAsync({
          useFactory: (): SdkDebugModuleOptions => ({
            enabled: true,
            level: 'info',
            namespace: 'async-test',
          }),
        }),
      ],
    }).compile();

    const svc = mod.get(SdkDebugService);
    expect(svc).toBeInstanceOf(SdkDebugService);
    expect(svc.isEnabled).toBe(true);
    await mod.close();
  });

  it('throws if no factory/class/existing provided', () => {
    expect(() =>
      SdkDebugModule.forRootAsync({} as never),
    ).toThrow();
  });
});
