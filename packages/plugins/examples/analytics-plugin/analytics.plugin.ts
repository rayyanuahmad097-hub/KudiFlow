import {
  BasePlugin,
  PluginMetadata,
  PluginCapability,
  PluginState,
} from '@kudiflow/plugins-core';

/**
 * Analytics Plugin Example
 * Demonstrates plugin lifecycle, hooks, and command execution
 */
export class AnalyticsPlugin extends BasePlugin {
  private metricsStore: Map<string, number> = new Map();

  readonly metadata: PluginMetadata = {
    id: 'analytics-plugin',
    name: 'Analytics Plugin',
    version: '1.0.0',
    description: 'Tracks bridge execution metrics and events',
    author: 'KudiFlow Team',
    tags: ['analytics', 'monitoring', 'metrics'],
  };

  readonly capabilities: PluginCapability[] = [
    {
      name: 'metrics',
      version: '1.0.0',
      description: 'Track and retrieve metrics',
      operations: ['recordMetric', 'getMetric', 'getAllMetrics', 'clearMetrics'],
    },
    {
      name: 'events',
      version: '1.0.0',
      description: 'Track bridge execution events',
    },
  ];

  /**
   * Initialize the plugin
   */
  async onLoad(): Promise<void> {
    console.log('[Analytics] Plugin loaded');
    this.metricsStore.clear();
  }

  /**
   * Enable the plugin
   */
  async onEnable(config?: Record<string, unknown>): Promise<void> {
    console.log('[Analytics] Plugin enabled with config:', config);
    // Initialize analytics service
  }

  /**
   * Disable the plugin
   */
  async onDisable(): Promise<void> {
    console.log('[Analytics] Plugin disabled');
    // Clean up analytics resources
  }

  /**
   * Bridge execution hooks
   */
  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void> {
    this.recordMetric(`bridge.${bridgeName}.${operation}.calls`);
    console.log(`[Analytics] Before executing: ${bridgeName}.${operation}`);
  }

  async onAfterBridgeExecute(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void> {
    this.recordMetric(`bridge.${bridgeName}.${operation}.success`);
    console.log(`[Analytics] After executing: ${bridgeName}.${operation}`);
  }

  async onBridgeExecuteError(
    bridgeName: string,
    operation: string,
    error: Error,
  ): Promise<void> {
    this.recordMetric(`bridge.${bridgeName}.${operation}.error`);
    console.error(
      `[Analytics] Error executing: ${bridgeName}.${operation}:`,
      error.message,
    );
  }

  /**
   * Execute plugin commands
   */
  async execute<T = unknown, R = unknown>(
    command: string,
    payload: T,
  ): Promise<R> {
    this.recordExecution();

    switch (command) {
      case 'recordMetric':
        return this.recordMetric(payload as string) as any;

      case 'getMetric':
        return this.getMetric(payload as string) as any;

      case 'getAllMetrics':
        return this.getAllMetrics() as any;

      case 'clearMetrics':
        return this.clearMetrics() as any;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  /**
   * Helper methods
   */
  private recordMetric(key: string): void {
    const current = this.metricsStore.get(key) ?? 0;
    this.metricsStore.set(key, current + 1);
  }

  private getMetric(key: string): number | undefined {
    return this.metricsStore.get(key);
  }

  private getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metricsStore.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private clearMetrics(): void {
    this.metricsStore.clear();
  }
}

export default new AnalyticsPlugin();
