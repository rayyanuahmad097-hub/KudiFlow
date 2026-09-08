import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  SDK_DEBUG_MODULE_OPTIONS,
} from './sdk-debug.constants';
import {
  SdkDebugModuleAsyncOptions,
  SdkDebugModuleOptions,
  SdkDebugOptionsFactory,
} from './sdk-debug.types';
import { SdkDebugService } from './sdk-debug.service';
import { SdkDebugInterceptor } from './sdk-debug.interceptor';
import { SdkDebugMiddleware } from './sdk-debug.middleware';

@Global()
@Module({})
export class SdkDebugModule {
  /**
   * Synchronous registration.
   *
   * @example
   * SdkDebugModule.forRoot({
   *   enabled: process.env.NODE_ENV !== 'production',
   *   level: 'debug',
   *   namespace: 'KudiFlow',
   *   colorize: true,
   *   prettyPrint: true,
   *   includeStackTrace: true,
   * })
   */
  static forRoot(options: SdkDebugModuleOptions): DynamicModule {
    return {
      module: SdkDebugModule,
      providers: [
        { provide: SDK_DEBUG_MODULE_OPTIONS, useValue: options },
        SdkDebugService,
        SdkDebugInterceptor,
        SdkDebugMiddleware,
      ],
      exports: [SdkDebugService, SdkDebugInterceptor, SdkDebugMiddleware],
    };
  }

  /**
   * Async registration — use when options come from ConfigService or env.
   *
   * @example
   * SdkDebugModule.forRootAsync({
   *   imports: [ConfigModule],
   *   useFactory: (cfg: ConfigService) => ({
   *     enabled: cfg.get<boolean>('SDK_DEBUG_ENABLED', false),
   *     level: cfg.get('SDK_DEBUG_LEVEL', 'debug'),
   *     namespace: cfg.get('SDK_DEBUG_NAMESPACE', 'KudiFlow'),
   *   }),
   *   inject: [ConfigService],
   * })
   */
  static forRootAsync(options: SdkDebugModuleAsyncOptions): DynamicModule {
    const asyncProviders = SdkDebugModule.createAsyncProviders(options);

    return {
      module: SdkDebugModule,
      imports: options.imports ?? [],
      providers: [
        ...asyncProviders,
        SdkDebugService,
        SdkDebugInterceptor,
        SdkDebugMiddleware,
      ],
      exports: [SdkDebugService, SdkDebugInterceptor, SdkDebugMiddleware],
    };
  }

  private static createAsyncProviders(
    options: SdkDebugModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: SDK_DEBUG_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: (options.inject ?? []) as never[],
        },
      ];
    }

    const useClass = options.useClass ?? options.useExisting;

    if (useClass) {
      const providers: Provider[] = [
        {
          provide: SDK_DEBUG_MODULE_OPTIONS,
          useFactory: async (factory: SdkDebugOptionsFactory) =>
            factory.createSdkDebugOptions(),
          inject: [useClass],
        },
      ];

      if (options.useClass) {
        providers.push({
          provide: useClass as Type<SdkDebugOptionsFactory>,
          useClass: useClass as Type<SdkDebugOptionsFactory>,
        });
      }

      return providers;
    }

    throw new Error(
      'SdkDebugModule: provide useFactory, useClass, or useExisting',
    );
  }
}
