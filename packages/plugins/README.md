# KudiFlow Plugins

Extensible plugin system for KudiFlow to dynamically load and manage bridge providers.

## Structure

```
plugins/
├── core/                    # Core plugin system (@kudiflow/plugins-core)
│   └── src/
│       ├── plugin.interface.ts      # Plugin interfaces & types
│       ├── base-plugin.ts           # Base Plugin class
│       ├── plugin-registry.ts       # Plugin registry & storage
│       ├── plugin-manager.ts        # Plugin lifecycle manager
│       ├── plugin-validator.ts      # Plugin validation
│       ├── plugin-errors.ts         # Error types
│       └── index.ts                 # Exports
│
└── examples/                # Example plugin implementations
    ├── analytics-plugin/    # Analytics & metrics plugin
    ├── cache-plugin/        # Result caching plugin
    └── README.md           # Example documentation
```

## Packages

### @kudiflow/plugins-core

Core plugin system providing:
- Plugin interfaces and base classes
- Plugin registry and lifecycle management
- Plugin discovery and loading
- Validation and error handling
- NestJS integration

**Package**: `packages/plugins/core`

**Exports**:
- `Plugin` - Core plugin interface
- `BasePlugin` - Base class for plugins
- `PluginManager` - Plugin lifecycle manager
- `PluginRegistry` - Plugin storage & management
- `PluginValidator` - Plugin validation
- `PluginState`, `PluginMetadata`, `PluginCapability` - Types

**Usage**:
```typescript
import { BasePlugin, PluginMetadata } from '@kudiflow/plugins-core';
```

## Quick Start

### 1. Create a Plugin

```typescript
import { BasePlugin, PluginMetadata, PluginCapability } from '@kudiflow/plugins-core';

export class MyPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
  };

  readonly capabilities: PluginCapability[] = [
    {
      name: 'feature',
      version: '1.0.0',
      operations: ['execute'],
    },
  ];

  async execute<T, R>(command: string, payload: T): Promise<R> {
    return { success: true } as any;
  }
}

export default new MyPlugin();
```

### 2. Register Plugin

```typescript
import { PluginManager } from '@kudiflow/plugins-core';

const manager = new PluginManager({
  pluginsDir: './plugins',
});

await manager.initialize();
const plugin = await manager.loadPlugin('./my-plugin.ts');
await manager.registerPlugin(plugin);
await manager.initializePlugin(plugin.metadata.id);
await manager.enablePlugin(plugin.metadata.id);
```

### 3. Use in Service

```typescript
@Injectable()
export class MyService {
  constructor(private pluginManager: PluginManager) {}

  async doSomething() {
    const plugins = this.pluginManager.getEnabledPlugins();
    for (const plugin of plugins) {
      await plugin.onBeforeBridgeExecute?.('bridge', 'op', {});
    }
  }
}
```

## Examples

See [examples](./examples) directory for:

- **Analytics Plugin** - Track metrics and events
- **Cache Plugin** - Cache execution results
- **Custom Provider Plugin** - Implement a custom bridge provider

## Plugin Lifecycle

Plugins go through the following states:

```
UNLOADED
  ↓
LOADED (after discovery/import)
  ↓
INITIALIZING → INITIALIZED (after initialize())
  ↓
ENABLING → ENABLED (after enable())
  ↓
DISABLING → DISABLED (after disable())
  ↓
UNLOADED (after unload())

ERROR (at any point on exception)
```

## Plugin Capabilities

Plugins expose capabilities that describe what they provide:

```typescript
readonly capabilities: PluginCapability[] = [
  {
    name: 'metrics',
    version: '1.0.0',
    description: 'Track metrics',
    operations: ['record', 'get', 'clear'],
  },
];
```

Query plugins by capability:

```typescript
const analyticsPlugins = manager.getPluginsByCapability('metrics');
```

## Plugin Hooks

Plugins can hook into bridge execution:

```typescript
export class MyPlugin extends BasePlugin {
  // Called before bridge execution
  async onBeforeBridgeExecute(bridgeName, operation, payload) {
    // Can return cached result
    return undefined;
  }

  // Called after bridge execution
  async onAfterBridgeExecute(bridgeName, operation, result) {
    // Process result
  }

  // Called on execution error
  async onBridgeExecuteError(bridgeName, operation, error) {
    // Handle error
  }
}
```

## Configuration

```typescript
const config: PluginManagerConfig = {
  // Discovery
  discovery: {
    directories: ['./plugins'],
    recursive: true,
    pattern: /\.plugin\.(ts|js)$/,
  },

  // Registry
  registry: {
    allowOverwrite: true,
    autoInitialize: false,
    autoEnable: true,
    resolveDependencies: true,
  },

  // General
  pluginsDir: './plugins',
  debug: false,
};

const manager = new PluginManager(config);
```

## REST API

With the integration guide, plugins are exposed via REST:

```bash
# List all plugins
GET /api/plugins

# Get plugin details
GET /api/plugins/:pluginId

# Enable plugin
POST /api/plugins/:pluginId/enable

# Disable plugin
POST /api/plugins/:pluginId/disable

# Execute plugin command
POST /api/plugins/:pluginId/execute
{
  "command": "recordMetric",
  "payload": { "metric": "value" }
}

# Unregister plugin
DELETE /api/plugins/:pluginId
```

## Error Handling

```typescript
import {
  PluginError,
  PluginLoadError,
  PluginValidationError,
  PluginDependencyError,
} from '@kudiflow/plugins-core';

try {
  await manager.registerPlugin(plugin);
} catch (error) {
  if (error instanceof PluginValidationError) {
    console.error('Validation errors:', error.validationErrors);
  } else if (error instanceof PluginDependencyError) {
    console.error('Missing:', error.missingDependency);
  }
}
```

## Plugin Dependencies

Declare dependencies:

```typescript
export class MyPlugin extends BasePlugin {
  dependencies = [
    {
      id: 'cache-plugin',
      version: '1.0.0',
      optional: false,
    },
  ];
}
```

Dependencies are automatically resolved when enabled.

## Testing

```typescript
describe('MyPlugin', () => {
  let manager: PluginManager;
  let plugin: MyPlugin;

  beforeEach(async () => {
    manager = new PluginManager();
    plugin = new MyPlugin();
    await manager.registerPlugin(plugin);
  });

  it('should execute command', async () => {
    await manager.initializePlugin(plugin.metadata.id);
    const result = await manager.executePlugin(
      plugin.metadata.id,
      'execute',
      {},
    );
    expect(result).toBeDefined();
  });
});
```

## Performance Considerations

- **Lazy Loading** - Plugins are loaded on-demand, not all at startup
- **Caching** - Plugin instances are cached after first load
- **Concurrency** - Configure `maxConcurrency` for large plugin systems
- **Sandboxing** - Optional plugin sandboxing for security

## Contributing

To contribute a plugin:

1. Create a new directory in `packages/plugins/examples/`
2. Implement `BasePlugin`
3. Add comprehensive documentation
4. Include tests
5. Submit PR with examples

## Resources

- [Plugin System Documentation](../../docs/PLUGIN_SYSTEM.md)
- [Integration Guide](../../docs/PLUGIN_INTEGRATION_GUIDE.md)
- [Examples](./examples)
- [API Reference](./core/src/plugin.interface.ts)

## License

MIT
