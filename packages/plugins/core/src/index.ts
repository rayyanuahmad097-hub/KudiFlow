/**
 * @kudiflow/plugins-core
 * Core plugin system for KudiFlow dynamic provider loading
 */

// Interfaces
export type {
  Plugin,
  PluginMetadata,
  PluginCapability,
  PluginConfigSchema,
  PluginDependency,
  PluginLifecycleHooks,
  PluginBridgeHooks,
  PluginStatus,
  PluginProvider,
  PluginDiscoveryOptions,
  PluginRegistryOptions,
  PluginManagerConfig,
  PluginConstructor,
  PluginManager as IPluginManager,
} from './plugin.interface';

export { PluginState } from './plugin.interface';

// Base classes
export { BasePlugin } from './base-plugin';
export { PluginRegistry, type PluginRegistryEntry } from './plugin-registry';
export { PluginManager, PluginDiscovery } from './plugin-manager';

// Utilities
export { PluginValidator } from './plugin-validator';
export { PluginError, PluginLoadError, PluginValidationError } from './plugin-errors';
