# KudiFlow Plugin System

A comprehensive, extensible plugin system for dynamically loading and managing bridge providers in KudiFlow.

## Overview

The plugin system provides:

- **Dynamic Loading**: Load plugins from filesystem or custom providers
- **Lifecycle Management**: Initialize, enable, disable, and unload plugins
- **Dependency Resolution**: Automatic plugin dependency management
- **Bridge Hooks**: Integrate with bridge execution lifecycle
- **Validation**: Built-in plugin validation and metadata checking
- **Hot Reload**: Load and unload plugins at runtime without core changes

## Quick Start

### 1. Create a Plugin

Extend `BasePlugin` and implement required methods:

```typescript
import { BasePlugin, PluginMetadata, PluginCapability } from '@kudiflow/plugins-core';

export class MyPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'My awesome plugin',
  };

  readonly capabilities: PluginCapability[] = [
    {
      name: 'my-feature',
      version: '1.0.0',
      description: 'Does something awesome',
      operations: ['execute', 'analyze'],
    },
  ];

  async execute<T = unknown, R = unknown>(
    command: string,
    payload: T,
  ): Promise<R> {
    switch (command) {
      case 'execute':
        return this.handleExecute(payload) as any;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private async handleExecute(payload: unknown): Promise<void> {
    console.log('Executing with payload:', payload);
  }
}

export default new MyPlugin();
```

### 2. Register Plugin with NestJS

```typescript
import { Module } from '@nestjs/common';
import { PluginManager } from '@kudiflow/plugins-core';

@Module({
  providers: [
    {
      provide: PluginManager,
      useFactory: async (pluginManager: PluginManager) => {
        await pluginManager.initialize();
        return pluginManager;
      },
      inject: [],
    },
  ],
})
export class PluginModule {}
```

### 3. Use Plugins in Your Service

```typescript
import { Injectable } from '@nestjs/common';
import { PluginManager } from '@kudiflow/plugins-core';

@Injectable()
export class BridgeService {
  constructor(private readonly pluginManager: PluginManager) {}

  async executeBridge(bridgeName: string, operation: string, payload: unknown) {
    // Execute bridge
    const result = await this.executeBridgeOperation(bridgeName, operation, payload);
    
    // Plugins can intercept and modify
    return result;
  }

  private async executeBridgeOperation(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<unknown> {
    // Get all enabled plugins
    const plugins = this.pluginManager.getEnabledPlugins();

    // Call bridge hooks
    for (const plugin of plugins) {
      await plugin.onBeforeBridgeExecute?.(bridgeName, operation, payload);
    }

    try {
      // Execute operation
      const result = await this.actualBridgeExecution(bridgeName, operation, payload);
      
      // After execution hooks
      for (const plugin of plugins) {
        await plugin.onAfterBridgeExecute?.(bridgeName, operation, result);
      }

      return result;
    } catch (error) {
      // Error hooks
      for (const plugin of plugins) {
        await plugin.onBridgeExecuteError?.(
          bridgeName,
          operation,
          error as Error,
        );
      }
      throw error;
    }
  }

  private async actualBridgeExecution(
    _bridgeName: string,
    _operation: string,
    _payload: unknown,
  ): Promise<unknown> {
    // Actual bridge execution
    return { success: true };
  }
}
```

## Plugin Structure

### Plugin Lifecycle

Plugins go through the following states:

```
UNLOADED -> LOADING -> LOADED -> INITIALIZING -> INITIALIZED 
         -> ENABLING -> ENABLED
         -> DISABLING -> DISABLED
         -> UNLOADING -> UNLOADED
         -> ERROR (at any point)
```

### Metadata

Every plugin must define metadata:

```typescript
readonly metadata: PluginMetadata = {
  id: 'unique-plugin-id',           // Required: unique identifier
  name: 'Human Readable Name',       // Required: display name
  version: '1.0.0',                  // Required: semantic version
  description: 'What it does',       // Optional: description
  author: 'Author Name',             // Optional: author
  license: 'MIT',                    // Optional: license
  tags: ['analytics', 'monitoring'], // Optional: categorization
};
```

### Capabilities

Define what your plugin provides:

```typescript
readonly capabilities: PluginCapability[] = [
  {
    name: 'metrics',
    version: '1.0.0',
    description: 'Track metrics',
    operations: ['record', 'get', 'clear'],
  },
  {
    name: 'events',
    version: '1.0.0',
    description: 'Track events',
  },
];
```

### Lifecycle Hooks

Implement optional lifecycle methods:

```typescript
export class MyPlugin extends BasePlugin {
  // Called when plugin is loaded
  async onLoad(): Promise<void> {
    console.log('Plugin loaded');
  }

  // Called when plugin is enabled
  async onEnable(config?: Record<string, unknown>): Promise<void> {
    console.log('Plugin enabled with config:', config);
  }

  // Called when plugin is disabled
  async onDisable(): Promise<void> {
    console.log('Plugin disabled');
  }

  // Called before plugin is unloaded
  async onBeforeUnload(): Promise<void> {
    console.log('Plugin unloading');
  }

  // Called for health checks
  async onHealthCheck(): Promise<boolean> {
    return true;
  }

  // Called when configuration changes
  async onConfigChange(newConfig: Record<string, unknown>): Promise<void> {
    console.log('Config changed:', newConfig);
  }
}
```

### Bridge Hooks

Integrate with bridge execution:

```typescript
export class MyPlugin extends BasePlugin {
  // Called when a bridge is registered
  async onBridgeRegistered(
    bridgeName: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    console.log('Bridge registered:', bridgeName);
  }

  // Called before bridge execution
  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown> {
    console.log(`Executing: ${bridgeName}.${operation}`);
    // Can return modified payload or cached result
  }

  // Called after bridge execution
  async onAfterBridgeExecute(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void | unknown> {
    console.log(`Completed: ${bridgeName}.${operation}`);
  }

  // Called on execution error
  async onBridgeExecuteError(
    bridgeName: string,
    operation: string,
    error: Error,
  ): Promise<void> {
    console.error(`Error in: ${bridgeName}.${operation}`, error);
  }
}
```

## Plugin Manager API

### Discovery

```typescript
// Discover plugins in directories
const discovered = await pluginManager.discoverPlugins({
  directories: ['./plugins'],
  recursive: true,
  pattern: /\.plugin\.(ts|js)$/,
});
```

### Registration

```typescript
// Register a plugin instance
await pluginManager.registerPlugin(myPlugin);

// Register multiple plugins
await pluginManager.registerPlugins([plugin1, plugin2, plugin3]);
```

### Retrieval

```typescript
// Get a plugin by ID
const plugin = pluginManager.getPlugin('my-plugin');

// Get all plugins
const allPlugins = pluginManager.getAllPlugins();

// Get enabled plugins
const enabledPlugins = pluginManager.getEnabledPlugins();

// Get plugins by capability
const analyticsPlugins = pluginManager.getPluginsByCapability('metrics');

// Get plugins by tag
const monitoringPlugins = pluginManager.getPluginsByTag('monitoring');
```

### Lifecycle Management

```typescript
// Initialize a plugin
await pluginManager.initializePlugin('my-plugin', { setting: 'value' });

// Enable a plugin
await pluginManager.enablePlugin('my-plugin');

// Disable a plugin
await pluginManager.disablePlugin('my-plugin');

// Unregister a plugin
await pluginManager.unregisterPlugin('my-plugin');
```

### Execution

```typescript
// Execute a plugin command
const result = await pluginManager.executePlugin(
  'my-plugin',
  'recordMetric',
  { metric: 'value' }
);
```

### Statistics

```typescript
// Get statistics
const stats = pluginManager.getStatistics();
// { total: 5, enabled: 3, disabled: 1, error: 1, byState: {...} }

// Get detailed plugin info
const info = pluginManager.getPluginInfo();
```

## Configuration

### Plugin Manager Configuration

```typescript
const config: PluginManagerConfig = {
  // Discovery options
  discovery: {
    directories: ['./plugins', './custom-plugins'],
    recursive: true,
    pattern: /\.plugin\.(ts|js)$/,
    timeout: 30000,
  },

  // Registry options
  registry: {
    allowOverwrite: true,
    autoInitialize: false,
    autoEnable: false,
    resolveDependencies: true,
    sandboxing: false,
  },

  // General options
  pluginsDir: './plugins',
  maxConcurrency: 5,
  debug: false,
};

const manager = new PluginManager(config);
```

### Plugin Configuration Schema

```typescript
export class MyPlugin extends BasePlugin {
  configSchema = {
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string' },
        timeout: { type: 'number' },
        enabled: { type: 'boolean' },
      },
      required: ['apiKey'],
    },
    defaults: {
      timeout: 30000,
      enabled: true,
    },
    validate: async (config: Record<string, unknown>) => {
      return config.apiKey && typeof config.apiKey === 'string';
    },
  };
}
```

## Plugin Dependencies

Plugins can declare dependencies on other plugins:

```typescript
export class MyPlugin extends BasePlugin {
  dependencies = [
    {
      id: 'cache-plugin',
      version: '1.0.0',
      optional: false,
    },
    {
      id: 'analytics-plugin',
      optional: true, // Optional dependency
    },
  ];
}
```

Dependencies are automatically resolved when enabled.

## Error Handling

The plugin system provides specific error types:

```typescript
import {
  PluginError,
  PluginLoadError,
  PluginValidationError,
  PluginDependencyError,
  PluginNotFoundError,
  PluginStateError,
} from '@kudiflow/plugins-core';

try {
  await pluginManager.registerPlugin(plugin);
} catch (error) {
  if (error instanceof PluginValidationError) {
    console.error('Plugin validation failed:', error.validationErrors);
  } else if (error instanceof PluginDependencyError) {
    console.error('Missing dependency:', error.missingDependency);
  }
}
```

## Examples

### Analytics Plugin

Track bridge execution metrics:

```typescript
import { BasePlugin, PluginMetadata, PluginCapability } from '@kudiflow/plugins-core';

export class AnalyticsPlugin extends BasePlugin {
  private metrics = new Map<string, number>();

  readonly metadata: PluginMetadata = {
    id: 'analytics',
    name: 'Analytics Plugin',
    version: '1.0.0',
    tags: ['analytics', 'monitoring'],
  };

  readonly capabilities: PluginCapability[] = [
    {
      name: 'metrics',
      version: '1.0.0',
      operations: ['record', 'get', 'getAll'],
    },
  ];

  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
  ): Promise<void> {
    this.recordMetric(`${bridgeName}.${operation}.calls`);
  }

  async execute<T, R>(command: string, payload: T): Promise<R> {
    switch (command) {
      case 'record':
        this.metrics.set(payload as string, (this.metrics.get(payload as string) ?? 0) + 1);
        return undefined as R;
      case 'get':
        return this.metrics.get(payload as string) as R;
      case 'getAll':
        return Object.fromEntries(this.metrics) as R;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  private recordMetric(key: string): void {
    this.metrics.set(key, (this.metrics.get(key) ?? 0) + 1);
  }
}
```

### Cache Plugin

Cache bridge results:

```typescript
export class CachePlugin extends BasePlugin {
  private cache = new Map<string, any>();

  // ... metadata and capabilities ...

  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown> {
    const key = `${bridgeName}:${operation}:${JSON.stringify(payload)}`;
    if (this.cache.has(key)) {
      return this.cache.get(key); // Return cached result
    }
  }

  async onAfterBridgeExecute(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void> {
    const key = `${bridgeName}:${operation}:${JSON.stringify(result)}`;
    this.cache.set(key, result);
  }
}
```

## Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PluginManager } from '@kudiflow/plugins-core';
import { MyPlugin } from './my.plugin';

describe('MyPlugin', () => {
  let pluginManager: PluginManager;
  let plugin: MyPlugin;

  beforeEach(async () => {
    pluginManager = new PluginManager();
    plugin = new MyPlugin();
    await pluginManager.registerPlugin(plugin);
  });

  it('should initialize plugin', async () => {
    await pluginManager.initializePlugin(plugin.metadata.id);
    expect(plugin.isInitialized()).toBe(true);
  });

  it('should execute plugin command', async () => {
    await pluginManager.initializePlugin(plugin.metadata.id);
    const result = await pluginManager.executePlugin(
      plugin.metadata.id,
      'execute',
      { test: 'payload' },
    );
    expect(result).toBeDefined();
  });
});
```

## File Structure

```
packages/plugins/
├── core/                          # Core plugin system
│   └── src/
│       ├── index.ts
│       ├── plugin.interface.ts     # Plugin interfaces
│       ├── base-plugin.ts          # Base class for plugins
│       ├── plugin-registry.ts      # Plugin registry
│       ├── plugin-manager.ts       # Plugin manager
│       ├── plugin-validator.ts     # Plugin validation
│       └── plugin-errors.ts        # Error types
└── examples/
    ├── analytics-plugin/           # Analytics plugin example
    ├── cache-plugin/               # Cache plugin example
    └── custom-provider-plugin/     # Custom provider example
```

## Acceptance Criteria

✅ **Plugins load dynamically** - Plugins can be loaded from filesystem or custom providers at runtime without restarting

✅ **Plugin interface defined** - Clear interface with metadata, capabilities, lifecycle hooks, and bridge hooks

✅ **Dynamic provider registration** - Providers can be dynamically added via `registerPlugin()` without core code changes

✅ **Configuration support** - Plugins can be configured with schemas and runtime config validation

✅ **Dependency management** - Plugins can declare and resolve dependencies automatically

✅ **Lifecycle management** - Full control over plugin states: load, initialize, enable, disable, unload

✅ **Bridge integration** - Plugins can hook into bridge registration and execution lifecycle

✅ **Error handling** - Specific error types for validation, loading, dependencies, and state errors

✅ **Statistics and monitoring** - Track plugin execution, capabilities, and health

## Next Steps

1. **Integrate with existing bridge system** - Connect plugin system to `BridgeService` and `BridgeRegistry`

2. **Create plugin marketplace** - Build discovery mechanism for public plugins

3. **Plugin versioning** - Support multiple versions of same plugin

4. **Sandboxing** - Implement plugin sandboxing for security

5. **Plugin marketplace UI** - Add admin interface for plugin management

## Support

For issues, questions, or contributions, please open an issue in the repository.
