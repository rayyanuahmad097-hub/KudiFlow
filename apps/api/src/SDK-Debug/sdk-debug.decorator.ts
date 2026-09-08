import { SetMetadata, applyDecorators } from '@nestjs/common';
import { SDK_DEBUG_METADATA_KEY } from './sdk-debug.constants';

export interface SdkDebugDecoratorOptions {
  event?: string;
  label?: string;
  meta?: Record<string, unknown>;
  /** Suppress this particular call from debug output */
  suppress?: boolean;
}

/**
 * @SdkDebug() — attach debug metadata to a controller or route handler.
 * The interceptor reads this metadata and enriches log entries accordingly.
 *
 * @example
 * \@SdkDebug({ event: 'sdk.payment.create', label: 'CreatePayment' })
 * \@Post('payments')
 * createPayment() { ... }
 */
export function SdkDebug(options: SdkDebugDecoratorOptions = {}) {
  return applyDecorators(SetMetadata(SDK_DEBUG_METADATA_KEY, options));
}

/**
 * @SdkDebugSuppress() — completely suppress debug output for this route.
 */
export function SdkDebugSuppress() {
  return SdkDebug({ suppress: true });
}
