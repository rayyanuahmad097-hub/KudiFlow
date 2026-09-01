# Plugin System Integration Guide

This guide shows how to integrate the new plugin system with the existing KudiFlow API architecture.

## Overview

The plugin system is designed to work alongside the existing `BridgeService`, `BridgeRegistry`, and `BridgeLoader`. It provides:

- Dynamic provider loading without core code changes
- Plugin lifecycle management
- Bridge execution hooks
- Provider capabilities discovery

## Architecture Integration

```
┌─────────────────────────────────────────────────────┐
│              KudiFlow API Layer                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │          BridgeService (Existing)            │  │
│  │  - Executes bridge operations                │  │
│  │  - Manages bridge lifecycle                  │  │
│  └──────────────────────────────────────────────┘  │
│                        ▲                            │
│                        │ Uses                       │
│  ┌──────────────────────┴──────────────────────┐   │
│  │                                              │   │
│  │  ┌──────────────────┐  ┌──────────────────┐ │   │
│  │  │ BridgeRegistry   │  │ PluginManager    │ │   │
│  │  │ (Existing)       │  │ (New)            │ │   │
│  │  │                  │  │                  │ │   │
│  │  │ - Manages        │  │ - Discovers      │ │   │
│  │  │   adapters       │  │   plugins        │ │   │
│  │  │ - Resolves by    │  │ - Registers      │ │   │
│  │  │   capability     │  │   plugins        │ │   │
│  │  │                  │  │ - Manages        │ │   │
│  │  │                  │  │   lifecycle      │ │   │
│  │  │                  │  │ - Calls hooks    │ │   │
│  │  └──────────────────┘  └──────────────────┘ │   │
│  │                                              │   │
│  └──────────────────────┬─────────────────────┘   │
│                         │                         │
│                         ▼                         │
│  ┌──────────────────────────────────────────────┐  │
│  │    BridgeLoader (Enhanced)                   │  │
│  │    - Loads plugins dynamically               │  │
│  │    - Validates plugin structure              │  │
│  │    - Initializes plugins                     │  │
│  └──────────────────────────────────────────────┘  │
│                         ▲                          │
│                         │                          │
│                         ▼                          │
│  ┌──────────────────────────────────────────────┐  │
│  │         Plugin Registry / Filesystem         │  │
│  │         - Plugin modules                     │  │
│  │         - Custom providers                   │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Integration Steps

### 1. Update BridgeModule Configuration

```typescript
// apps/api/src/dynamic-bridge-discovery/bridge.module.ts

import { Module, OnModuleInit } from '@nestjs/common';
import { BridgeService } from './bridge.service';
import { BridgeRegistry } from './bridge.registry';
import { BridgeLoader } from './bridge.loader';
import { PluginManager } from '@kudiflow/plugins-core';

@Module({
  providers: [
    BridgeService,
    BridgeRegistry,
    BridgeLoader,
    {
      provide: PluginManager,
      useFactory: async () => {
        const manager = new PluginManager({
          pluginsDir: './plugins',
          discovery: {
            directories: ['./plugins', './src/plugins'],
            recursive: true,
          },
          registry: {
            autoInitialize: false,
            autoEnable: true,
            resolveDependencies: true,
          },
          debug: process.env.PLUGIN_DEBUG === 'true',
        });

        await manager.initialize();
        return manager;
      },
    },
  ],
  exports: [BridgeService, BridgeRegistry, PluginManager],
})
export class BridgeModule {}
```

### 2. Integrate PluginManager with BridgeService

```typescript
// apps/api/src/dynamic-bridge-discovery/bridge.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { BridgeRegistry } from './bridge.registry';
import { BridgeLoader } from './bridge.loader';
import { PluginManager } from '@kudiflow/plugins-core';

@Injectable()
export class BridgeService {
  private readonly logger = new Logger(BridgeService.name);

  constructor(
    private readonly registry: BridgeRegistry,
    private readonly loader: BridgeLoader,
    private readonly pluginManager: PluginManager,
  ) {}

  /**
   * Execute an operation on a named bridge
   */
  async execute<T = unknown, R = unknown>(
    bridgeName: string,
    operation: string,
    payload: T,
  ): Promise<R> {
    // Call plugin hooks before execution
    const plugins = this.pluginManager.getEnabledPlugins();
    let modifiedPayload = payload;

    for (const plugin of plugins) {
      const result = await plugin.onBeforeBridgeExecute?.(
        bridgeName,
        operation,
        modifiedPayload,
      );

      // If plugin returns a cached result, use it
      if (result !== undefined) {
        this.logger.debug(`[${plugin.metadata.id}] Returning cached result for ${bridgeName}.${operation}`);
        return result as R;
      }
    }

    try {
      const adapter = this.registry.get(bridgeName);
      const result = await adapter.execute<T, R>(operation, modifiedPayload);

      // Call plugin hooks after execution
      for (const plugin of plugins) {
        await plugin.onAfterBridgeExecute?.(
          bridgeName,
          operation,
          result,
        );
      }

      return result;
    } catch (error) {
      // Call plugin error hooks
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

  /**
   * Register a bridge adapter - notify plugins
   */
  async registerBridge(
    adapter: any,
    options?: Record<string, unknown>,
  ): Promise<void> {
    await this.loader.registerAdapter(adapter, options);

    // Notify plugins of new bridge
    const plugins = this.pluginManager.getEnabledPlugins();
    for (const plugin of plugins) {
      await plugin.onBridgeRegistered?.(adapter.name, options);
    }
  }

  /**
   * Get all enabled plugins
   */
  getPlugins() {
    return this.pluginManager.getEnabledPlugins();
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capability: string) {
    return this.pluginManager.getPluginsByCapability(capability);
  }
}
```

### 3. Add REST API for Plugin Management

```typescript
// apps/api/src/dynamic-bridge-discovery/plugin.controller.ts

import { Controller, Get, Post, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { PluginManager } from '@kudiflow/plugins-core';

@Controller('api/plugins')
export class PluginController {
  constructor(private readonly pluginManager: PluginManager) {}

  @Get()
  async listPlugins() {
    return {
      plugins: this.pluginManager.getPluginInfo(),
      stats: this.pluginManager.getStatistics(),
    };
  }

  @Get('enabled')
  async getEnabledPlugins() {
    const plugins = this.pluginManager.getEnabledPlugins();
    return {
      enabled: plugins.map((p) => ({
        id: p.metadata.id,
        name: p.metadata.name,
        version: p.metadata.version,
        capabilities: p.capabilities,
      })),
    };
  }

  @Get('capabilities')
  async getCapabilities() {
    const plugins = this.pluginManager.getEnabledPlugins();
    const capabilities = new Map<string, any>();

    plugins.forEach((plugin) => {
      plugin.capabilities.forEach((cap) => {
        capabilities.set(cap.name, {
          version: cap.version,
          description: cap.description,
          operations: cap.operations,
          provider: plugin.metadata.id,
        });
      });
    });

    return Object.fromEntries(capabilities);
  }

  @Get(':pluginId')
  async getPlugin(@Param('pluginId') pluginId: string) {
    const plugin = this.pluginManager.getPlugin(pluginId);
    return {
      metadata: plugin.metadata,
      capabilities: plugin.capabilities,
      status: plugin.getStatus(),
      isEnabled: plugin.isEnabled(),
      isInitialized: plugin.isInitialized(),
    };
  }

  @Post(':pluginId/enable')
  @HttpCode(200)
  async enablePlugin(@Param('pluginId') pluginId: string) {
    await this.pluginManager.enablePlugin(pluginId);
    return { message: `Plugin "${pluginId}" enabled` };
  }

  @Post(':pluginId/disable')
  @HttpCode(200)
  async disablePlugin(@Param('pluginId') pluginId: string) {
    await this.pluginManager.disablePlugin(pluginId);
    return { message: `Plugin "${pluginId}" disabled` };
  }

  @Post(':pluginId/execute')
  async executePlugin(
    @Param('pluginId') pluginId: string,
    @Body() body: { command: string; payload: any },
  ) {
    const result = await this.pluginManager.executePlugin(
      pluginId,
      body.command,
      body.payload,
    );
    return { result };
  }

  @Delete(':pluginId')
  @HttpCode(204)
  async unregisterPlugin(@Param('pluginId') pluginId: string) {
    await this.pluginManager.unregisterPlugin(pluginId);
  }
}
```

### 4. Update BridgeModule to Export Plugin Controller

```typescript
@Module({
  providers: [BridgeService, BridgeRegistry, BridgeLoader, PluginManager],
  controllers: [BridgeController, PluginController],
  exports: [BridgeService, BridgeRegistry, PluginManager],
})
export class BridgeModule {}
```

### 5. Add Plugin Discovery Endpoint

```typescript
@Post('discover')
async discoverPlugins(
  @Body() body: { directories: string[] },
) {
  const discovered = await this.pluginManager.discoverPlugins({
    directories: body.directories,
  });
  return { discovered };
}
```

## Configuration

Add plugin configuration to environment or config file:

```typescript
// apps/api/src/config/plugin.config.ts

export const pluginConfig = {
  enabled: process.env.PLUGINS_ENABLED !== 'false',
  pluginsDir: process.env.PLUGINS_DIR || './plugins',
  autoDiscover: process.env.PLUGINS_AUTO_DISCOVER !== 'false',
  autoEnable: process.env.PLUGINS_AUTO_ENABLE === 'true',
  debug: process.env.PLUGINS_DEBUG === 'true',
  directories: (process.env.PLUGIN_DIRECTORIES || './plugins').split(','),
};
```

## Migration from Old System

If migrating from the old hardcoded provider system:

### Old Way
```typescript
// Hardcoded providers
const providers = [
  new LifiProvider(),
  new StargateProvider(),
  new SquidProvider(),
];

providers.forEach(provider => {
  bridgeRegistry.register(provider);
});
```

### New Way
```typescript
// Dynamic plugin loading
const manager = new PluginManager();
const discovered = await manager.discoverPlugins({
  directories: ['./plugins'],
});
discovered.forEach(async (metadata) => {
  const plugin = await manager.loadPlugin(metadata.id);
  await manager.registerPlugin(plugin);
});
```

## Provider Plugin Example

Create a plugin that registers multiple bridges:

```typescript
// plugins/lifi-provider.plugin.ts

import { BasePlugin, PluginMetadata, PluginCapability } from '@kudiflow/plugins-core';
import { LifiAdapter, StargateAdapter } from './adapters';

export class LifiProviderPlugin extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'lifi-provider',
    name: 'LiFi Bridge Provider',
    version: '2.0.0',
    description: 'Multi-chain bridge provider using LiFi protocol',
    tags: ['bridge', 'provider', 'multichain'],
  };

  readonly capabilities: PluginCapability[] = [
    { name: 'swap', version: '1.0.0', operations: ['estimate', 'execute'] },
    { name: 'bridge', version: '1.0.0', operations: ['quote', 'bridge'] },
  ];

  private adapters = [new LifiAdapter(), new StargateAdapter()];

  async onEnable(): Promise<void> {
    // Register all adapters with BridgeRegistry
    this.adapters.forEach((adapter) => {
      // bridgeRegistry.register(adapter);
    });
  }

  async execute<T, R>(command: string, payload: T): Promise<R> {
    // Handle provider-specific commands
    return {} as R;
  }
}

export default new LifiProviderPlugin();
```

## Testing

```typescript
// Test plugin integration
describe('Plugin System Integration', () => {
  let bridgeService: BridgeService;
  let pluginManager: PluginManager;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [BridgeModule],
    }).compile();

    bridgeService = module.get<BridgeService>(BridgeService);
    pluginManager = module.get<PluginManager>(PluginManager);
  });

  it('should execute bridge with plugin hooks', async () => {
    const plugin = new TestPlugin();
    await pluginManager.registerPlugin(plugin);

    const result = await bridgeService.execute('test-bridge', 'test-op', {});

    expect(plugin.beforeExecuted).toBe(true);
    expect(plugin.afterExecuted).toBe(true);
  });
});
```

## Deployment

### Docker Support

Add plugins to Docker build:

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy plugins
COPY plugins/ ./plugins/
COPY packages/plugins/ ./packages/plugins/

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Environment Variables

```bash
# Enable/disable plugin system
PLUGINS_ENABLED=true

# Plugin discovery directories
PLUGIN_DIRECTORIES=./plugins,./custom-plugins

# Auto-discovery on startup
PLUGINS_AUTO_DISCOVER=true

# Auto-enable on registration
PLUGINS_AUTO_ENABLE=true

# Debug logging
PLUGINS_DEBUG=false
```

## Acceptance Criteria

✅ Plugins load dynamically without core code changes
✅ Full lifecycle management (load, initialize, enable, disable, unload)
✅ REST API for plugin management
✅ Bridge execution hooks in all plugin instances
✅ Capability discovery and filtering
✅ Error propagation and handling
✅ Statistics and monitoring
✅ Configuration and validation

## Next Steps

1. Implement plugin discovery UI in admin dashboard
2. Create plugin marketplace
3. Add plugin versioning support
4. Implement plugin sandboxing
5. Add performance monitoring and metrics
