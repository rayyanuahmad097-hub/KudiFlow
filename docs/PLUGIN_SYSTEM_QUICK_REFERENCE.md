# Plugin System - Quick Reference

## 📦 Installation

```bash
npm install @kudiflow/plugins-core
```

## 🚀 Create a Plugin in 30 Seconds

```typescript
import { BasePlugin, PluginMetadata, PluginCapability } from '@kudiflow/plugins-core';

export class MyPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  };

  readonly capabilities: PluginCapability[] = [
    { name: 'myfeature', version: '1.0.0' },
  ];

  async execute<T, R>(command: string, payload: T): Promise<R> {
    console.log(`Executing: ${command}`, payload);
    return { success: true } as any;
  }
}

export default new MyPlugin();
```

## 🎮 Plugin Manager Usage

```typescript
import { PluginManager } from '@kudiflow/plugins-core';

// Initialize
const manager = new PluginManager({ pluginsDir: './plugins' });
await manager.initialize();

// Load plugin
const plugin = await manager.loadPlugin('./my-plugin.ts');

// Register
await manager.registerPlugin(plugin);

// Lifecycle
await manager.initializePlugin('my-plugin', { config: 'value' });
await manager.enablePlugin('my-plugin');

// Query
const allPlugins = manager.getAllPlugins();
const enabled = manager.getEnabledPlugins();
const byCapability = manager.getPluginsByCapability('myfeature');
const byTag = manager.getPluginsByTag('analytics');

// Execute
const result = await manager.executePlugin('my-plugin', 'mycommand', payload);

// Clean up
await manager.disablePlugin('my-plugin');
await manager.unregisterPlugin('my-plugin');
await manager.shutdown();
```

## 🔗 Plugin Lifecycle

```typescript
export class MyPlugin extends BasePlugin {
  // Called on load
  async onLoad(): Promise<void> { }

  // Called on enable
  async onEnable(config?: Record<string, unknown>): Promise<void> { }

  // Called on disable
  async onDisable(): Promise<void> { }

  // Called before unload
  async onBeforeUnload(): Promise<void> { }

  // Called when config changes
  async onConfigChange(newConfig: Record<string, unknown>): Promise<void> { }

  // Called for health checks
  async onHealthCheck(): Promise<boolean> { return true; }
}
```

## 🌉 Bridge Hooks

```typescript
export class MyPlugin extends BasePlugin {
  // Before bridge execution - can return cached result
  async onBeforeBridgeExecute(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown> {
    // Return value to use as result, undefined to continue
  }

  // After bridge execution
  async onAfterBridgeExecute(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void> { }

  // On bridge execution error
  async onBridgeExecuteError(
    bridgeName: string,
    operation: string,
    error: Error,
  ): Promise<void> { }

  // When bridge is registered
  async onBridgeRegistered(
    bridgeName: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> { }
}
```

## 📋 Plugin Metadata

```typescript
readonly metadata: PluginMetadata = {
  id: 'unique-id',           // Required
  name: 'Display Name',       // Required
  version: '1.0.0',           // Required - semver
  description: 'What it does',
  author: 'Author Name',
  license: 'MIT',
  repository: 'https://github.com/...',
  tags: ['category', 'feature'],
  minKudiFlowVersion: '1.0.0',
};
```

## 🎯 Capabilities

```typescript
readonly capabilities: PluginCapability[] = [
  {
    name: 'myfeature',      // Required
    version: '1.0.0',        // Required
    description: 'Does X',
    operations: ['cmd1', 'cmd2', 'cmd3'],
  },
];
```

## 🔗 Dependencies

```typescript
export class MyPlugin extends BasePlugin {
  dependencies = [
    {
      id: 'cache-plugin',
      version: '1.0.0',
      optional: false,  // Required dependency
    },
    {
      id: 'logger-plugin',
      optional: true,   // Optional dependency
    },
  ];
}
```

## ⚙️ Configuration Schema

```typescript
export class MyPlugin extends BasePlugin {
  configSchema = {
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string' },
        timeout: { type: 'number', minimum: 1000 },
        retries: { type: 'integer', minimum: 0 },
      },
      required: ['apiKey'],
    },
    defaults: {
      timeout: 30000,
      retries: 3,
    },
    validate: async (config) => {
      return config.apiKey && config.apiKey.length > 10;
    },
  };
}
```

## 📊 Query Methods

```typescript
// Get for specific plugin
const plugin = manager.getPlugin('my-plugin');

// Try get (no error if missing)
const plugin = manager.tryGetPlugin('my-plugin');

// Get all plugins
const all = manager.getAllPlugins();

// Get enabled plugins
const enabled = manager.getEnabledPlugins();

// Get by capability
const plugins = manager.getPluginsByCapability('metrics');

// Get by tag
const plugins = manager.getPluginsByTag('analytics');

// Get statistics
const stats = manager.getStatistics();
// { total: 5, enabled: 3, disabled: 1, error: 1, byState: {...} }

// Get detailed info
const info = manager.getPluginInfo();
```

## 🚨 Error Handling

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
  await manager.registerPlugin(plugin);
} catch (error) {
  if (error instanceof PluginValidationError) {
    console.error('Validation failed:', error.validationErrors);
  } else if (error instanceof PluginDependencyError) {
    console.error('Missing:', error.missingDependency);
  } else if (error instanceof PluginLoadError) {
    console.error('Load failed:', error.filePath);
  } else if (error instanceof PluginNotFoundError) {
    console.error('Not found:', error.pluginId);
  }
}
```

## 🔍 Plugin Status

```typescript
const status = plugin.getStatus();
// {
//   metadata: { id, name, version, ... },
//   state: PluginState.ENABLED,
//   isHealthy: true,
//   error: undefined,
//   loadedAt: Date,
//   enabledAt: Date,
//   stats: {
//     executedCommands: 42,
//     lastExecution: Date,
//     errorCount: 0,
//   }
// }

// Check state
console.log(plugin.state); // 'enabled'
console.log(plugin.isEnabled()); // true
console.log(plugin.isInitialized()); // true
```

## 🔧 Configuration

```typescript
const config: PluginManagerConfig = {
  // Discovery settings
  discovery: {
    directories: ['./plugins', './custom'],
    recursive: true,
    pattern: /\.plugin\.(ts|js)$/,
    timeout: 30000,
  },

  // Registry settings
  registry: {
    allowOverwrite: true,
    autoInitialize: false,
    autoEnable: false,
    resolveDependencies: true,
    sandboxing: false,
  },

  // Manager settings
  pluginsDir: './plugins',
  maxConcurrency: 5,
  debug: false,
};

const manager = new PluginManager(config);
```

## 📡 REST API Endpoints

```bash
# List all plugins
GET /api/plugins

# Get enabled plugins
GET /api/plugins/enabled

# Get capabilities
GET /api/plugins/capabilities

# Get plugin details
GET /api/plugins/:pluginId

# Enable plugin
POST /api/plugins/:pluginId/enable

# Disable plugin
POST /api/plugins/:pluginId/disable

# Execute command
POST /api/plugins/:pluginId/execute
{
  "command": "recordMetric",
  "payload": { "key": "value" }
}

# Unregister plugin
DELETE /api/plugins/:pluginId

# Discover plugins
POST /api/plugins/discover
{
  "directories": ["./plugins"]
}
```

## 🧪 Testing

```typescript
import { PluginManager } from '@kudiflow/plugins-core';

describe('MyPlugin', () => {
  let manager: PluginManager;
  let plugin: MyPlugin;

  beforeEach(async () => {
    manager = new PluginManager();
    plugin = new MyPlugin();
    await manager.registerPlugin(plugin);
  });

  afterEach(async () => {
    await manager.shutdown();
  });

  it('should initialize', async () => {
    await manager.initializePlugin(plugin.metadata.id);
    expect(plugin.isInitialized()).toBe(true);
  });

  it('should enable', async () => {
    await manager.initializePlugin(plugin.metadata.id);
    await manager.enablePlugin(plugin.metadata.id);
    expect(plugin.isEnabled()).toBe(true);
  });

  it('should execute command', async () => {
    await manager.initializePlugin(plugin.metadata.id);
    await manager.enablePlugin(plugin.metadata.id);
    const result = await manager.executePlugin(
      plugin.metadata.id,
      'execute',
      { test: 'payload' },
    );
    expect(result).toBeDefined();
  });
});
```

## 📚 Resources

- [Plugin System Documentation](./PLUGIN_SYSTEM.md)
- [Integration Guide](./PLUGIN_INTEGRATION_GUIDE.md)
- [Example Plugins](../packages/plugins/examples/)
- [API Reference](../packages/plugins/core/src/plugin.interface.ts)

## 💡 Common Patterns

### Analytics Plugin
```typescript
async onBeforeBridgeExecute(bridgeName, operation) {
  this.recordMetric(`${bridgeName}.${operation}.calls`);
}

async onAfterBridgeExecute(bridgeName, operation, result) {
  this.recordMetric(`${bridgeName}.${operation}.success`);
}
```

### Caching Plugin
```typescript
async onBeforeBridgeExecute(bridgeName, operation, payload) {
  const cached = this.cache.get(this.getKey(bridgeName, operation, payload));
  if (cached) return cached; // Skip execution
}

async onAfterBridgeExecute(bridgeName, operation, result) {
  this.cache.set(this.getKey(bridgeName, operation, result), result);
}
```

### Logging Plugin
```typescript
async onBeforeBridgeExecute(bridgeName, operation, payload) {
  this.logger.log(`Executing ${bridgeName}.${operation}`, payload);
}

async onBridgeExecuteError(bridgeName, operation, error) {
  this.logger.error(`Failed ${bridgeName}.${operation}`, error);
}
```

### Rate Limiting Plugin
```typescript
async onBeforeBridgeExecute(bridgeName, operation, payload) {
  const allowed = await this.checkRateLimit(bridgeName);
  if (!allowed) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

**For more details, see**:
- Full documentation: `docs/PLUGIN_SYSTEM.md`
- Integration guide: `docs/PLUGIN_INTEGRATION_GUIDE.md`
- Examples: `packages/plugins/examples/`
