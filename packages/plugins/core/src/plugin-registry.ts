import { Logger } from '@nestjs/common';
import {
  Plugin,
  PluginState,
  PluginDependency,
  PluginRegistryOptions,
} from './plugin.interface';

/**
 * Plugin registry entry with metadata
 */
export interface PluginRegistryEntry {
  plugin: Plugin;
  registeredAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Plugin Registry - manages plugin lifecycle and storage
 */
export class PluginRegistry {
  private readonly logger = new Logger(PluginRegistry.name);
  private readonly plugins = new Map<string, PluginRegistryEntry>();
  private readonly options: Required<PluginRegistryOptions>;

  constructor(options: PluginRegistryOptions = {}) {
    this.options = {
      allowOverwrite: options.allowOverwrite ?? false,
      autoInitialize: options.autoInitialize ?? false,
      autoEnable: options.autoEnable ?? false,
      resolveDependencies: options.resolveDependencies ?? true,
      sandboxing: options.sandboxing ?? false,
    };
  }

  /**
   * Register a plugin
   */
  async register(
    plugin: Plugin,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const pluginId = plugin.metadata.id;

    if (this.plugins.has(pluginId) && !this.options.allowOverwrite) {
      throw new Error(
        `Plugin "${pluginId}" is already registered. Set allowOverwrite=true to replace.`,
      );
    }

    if (this.plugins.has(pluginId)) {
      this.logger.warn(`Overwriting plugin: "${pluginId}"`);
      const existing = this.plugins.get(pluginId)!;
      if (existing.plugin.isEnabled()) {
        await existing.plugin.disable();
      }
      await existing.plugin.unload();
    }

    this.plugins.set(pluginId, {
      plugin,
      registeredAt: new Date(),
      metadata,
    });

    this.logger.log(
      `Plugin registered: "${pluginId}" v${plugin.metadata.version}`,
    );

    // Auto-initialize if configured
    if (this.options.autoInitialize && plugin.state === PluginState.UNLOADED) {
      try {
        await plugin.initialize();

        // Auto-enable if configured
        if (this.options.autoEnable) {
          await plugin.enable();
        }
      } catch (error) {
        this.logger.error(
          `Failed to auto-initialize plugin "${pluginId}":`,
          error,
        );
        throw error;
      }
    }
  }

  /**
   * Get a plugin by ID
   */
  get(pluginId: string): Plugin {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin not found: "${pluginId}"`);
    }
    return entry.plugin;
  }

  /**
   * Try to get a plugin without throwing
   */
  tryGet(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  /**
   * Check if a plugin is registered
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values()).map((entry) => entry.plugin);
  }

  /**
   * Get all registered plugin IDs
   */
  getAllIds(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get all enabled plugins
   */
  getEnabled(): Plugin[] {
    return this.getAll().filter((p) => p.isEnabled());
  }

  /**
   * Get plugins by capability
   */
  getByCapability(capabilityName: string): Plugin[] {
    return this.getAll().filter((plugin) =>
      plugin.capabilities.some((cap) => cap.name === capabilityName),
    );
  }

  /**
   * Get plugins by tag
   */
  getByTag(tag: string): Plugin[] {
    return this.getAll().filter((plugin) =>
      plugin.metadata.tags?.includes(tag),
    );
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<boolean> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      return false;
    }

    try {
      if (entry.plugin.isEnabled()) {
        await entry.plugin.disable();
      }
      await entry.plugin.unload();
      this.plugins.delete(pluginId);
      this.logger.log(`Plugin unregistered: "${pluginId}"`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unregister plugin "${pluginId}":`, error);
      throw error;
    }
  }

  /**
   * Get registry entries with metadata
   */
  listEntries(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Clear all plugins
   */
  async clear(): Promise<void> {
    const pluginIds = this.getAllIds();
    for (const id of pluginIds) {
      await this.unregister(id);
    }
  }

  /**
   * Get count of registered plugins
   */
  get size(): number {
    return this.plugins.size;
  }

  /**
   * Get count of enabled plugins
   */
  get enabledCount(): number {
    return this.getEnabled().length;
  }

  /**
   * Resolve plugin dependencies
   */
  resolveDependencies(plugin: Plugin): Plugin[] {
    if (!this.options.resolveDependencies || !plugin.dependencies) {
      return [];
    }

    const resolved: Plugin[] = [];
    const visited = new Set<string>();

    const resolve = (dep: PluginDependency) => {
      if (visited.has(dep.id)) {
        return;
      }

      visited.add(dep.id);

      const depPlugin = this.tryGet(dep.id);
      if (!depPlugin) {
        if (!dep.optional) {
          throw new Error(
            `Required dependency not found: "${dep.id}" for plugin "${plugin.metadata.id}"`,
          );
        }
        return;
      }

      // Recursively resolve dependencies
      if (depPlugin.dependencies) {
        depPlugin.dependencies.forEach(resolve);
      }

      resolved.push(depPlugin);
    };

    if (plugin.dependencies) {
      plugin.dependencies.forEach(resolve);
    }

    return resolved;
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    error: number;
    byState: Record<PluginState, number>;
  } {
    const stats = {
      total: this.size,
      enabled: 0,
      disabled: 0,
      error: 0,
      byState: Object.values(PluginState).reduce(
        (acc, state) => {
          acc[state] = 0;
          return acc;
        },
        {} as Record<PluginState, number>,
      ),
    };

    this.getAll().forEach((plugin) => {
      const state = plugin.state;
      stats.byState[state]++;

      if (plugin.isEnabled()) {
        stats.enabled++;
      } else if (state === PluginState.ERROR) {
        stats.error++;
      } else {
        stats.disabled++;
      }
    });

    return stats;
  }
}
