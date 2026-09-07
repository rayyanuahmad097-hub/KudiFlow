import {
  BasePlugin,
  PluginMetadata,
  PluginCapability,
} from '@kudiflow/plugins-core';

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

/**
 * Cache Plugin Example
 * Demonstrates caching bridge execution results
 */
export class CachePlugin extends BasePlugin {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number = 60000; // 1 minute default

  readonly metadata: PluginMetadata = {
    id: 'cache-plugin',
    name: 'Cache Plugin',
    version: '1.0.0',
    description: 'Caches bridge execution results',
    author: 'KudiFlow Team',
    tags: ['cache', 'performance', 'optimization'],
  };

  readonly capabilities: PluginCapability[] = [
    {
      name: 'caching',
      version: '1.0.0',
      description: 'Cache bridge execution results',
      operations: ['set', 'get', 'clear', 'delete'],
    },
  ];

  /**
   * Lifecycle hooks
   */
  async onLoad(): Promise<void> {
    console.log('[Cache] Plugin loaded');
  }

  async onEnable(config?: Record<string, unknown>): Promise<void> {
    console.log('[Cache] Plugin enabled');
    
    // Configure TTL if provided
    if (config?.ttlMs && typeof config.ttlMs === 'number') {
      this.ttlMs = config.ttlMs;
      console.log(`[Cache] TTL set to ${this.ttlMs}ms`);
    }
  }

  async onDisable(): Promise<void> {
    console.log('[Cache] Plugin disabled');
    this.cache.clear();
  }

  /**
   * Bridge execution hooks for caching
   */
  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown> {
    const cacheKey = this.generateCacheKey(bridgeName, operation, payload);
    const cached = this.getCacheEntry(cacheKey);

    if (cached !== undefined) {
      console.log(`[Cache] Hit: ${cacheKey}`);
      // Return cached result to bypass actual execution
      return cached;
    }

    console.log(`[Cache] Miss: ${cacheKey}`);
  }

  async onAfterBridgeExecute(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(bridgeName, operation, result);
    this.setCacheEntry(cacheKey, result);
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
      case 'set':
        return this.handleSet(payload as any) as any;

      case 'get':
        return this.handleGet(payload as any) as any;

      case 'clear':
        return this.handleClear() as any;

      case 'delete':
        return this.handleDelete(payload as string) as any;

      case 'stats':
        return this.handleStats() as any;

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  /**
   * Command handlers
   */
  private handleSet(payload: { key: string; value: unknown; ttl?: number }): void {
    const ttl = payload.ttl ?? this.ttlMs;
    this.setCacheEntry(payload.key, payload.value, ttl);
  }

  private handleGet(key: string): unknown {
    return this.getCacheEntry(key);
  }

  private handleClear(): number {
    const count = this.cache.size;
    this.cache.clear();
    return count;
  }

  private handleDelete(key: string): boolean {
    return this.cache.delete(key);
  }

  private handleStats() {
    return {
      size: this.cache.size,
      ttlMs: this.ttlMs,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: entry.expiresAt ? entry.expiresAt - Date.now() : 'never',
      })),
    };
  }

  /**
   * Helper methods
   */
  private generateCacheKey(
    bridgeName: string,
    operation: string,
    data: unknown,
  ): string {
    const dataHash = JSON.stringify(data).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a; // Convert to 32-bit integer
    }, 0);

    return `${bridgeName}:${operation}:${Math.abs(dataHash)}`;
  }

  private setCacheEntry(
    key: string,
    value: unknown,
    ttl: number = this.ttlMs,
  ): void {
    this.cache.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
    });
  }

  private getCacheEntry(key: string): unknown {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }
}

export default new CachePlugin();
