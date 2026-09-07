import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  Plugin,
  PluginManager as IPluginManager,
  PluginManagerConfig,
  PluginDiscoveryOptions,
  PluginProvider,
  PluginMetadata,
} from './plugin.interface';

/**
 * Plugin discovery and loading from filesystem
 */
export class PluginDiscovery {
  private readonly logger = new Logger(PluginDiscovery.name);

  /**
   * Discover plugins in specified directories
   */
  async discover(options: PluginDiscoveryOptions): Promise<PluginMetadata[]> {
    const directories = options.directories || [];
    const plugins: PluginMetadata[] = [];

    for (const dir of directories) {
      try {
        const discovered = await this.discoverInDirectory(dir, options);
        plugins.push(...discovered);
      } catch (error) {
        this.logger.error(`Failed to discover plugins in "${dir}":`, error);
      }
    }

    return plugins;
  }

  /**
   * Discover plugins in a single directory
   */
  private async discoverInDirectory(
    directory: string,
    options: PluginDiscoveryOptions,
  ): Promise<PluginMetadata[]> {
    const resolvedDir = path.isAbsolute(directory)
      ? directory
      : path.join(process.cwd(), directory);

    if (!fs.existsSync(resolvedDir)) {
      this.logger.warn(`Plugin directory not found: "${resolvedDir}"`);
      return [];
    }

    const patterns = this.getFilePatterns(options.pattern);
    const files = this.findFiles(resolvedDir, patterns, options.recursive ?? true);

    this.logger.log(
      `Discovered ${files.length} plugin file(s) in "${resolvedDir}"`,
    );

    return files.map((file) => ({
      id: path.basename(file, path.extname(file)),
      name: path.basename(file, path.extname(file)),
      version: '1.0.0', // Default version, should be from plugin metadata
      description: `Plugin from ${file}`,
    }));
  }

  /**
   * Get file patterns for plugin discovery
   */
  private getFilePatterns(
    pattern?: RegExp | string[],
  ): (RegExp | string)[] {
    if (pattern) {
      return Array.isArray(pattern) ? pattern : [pattern];
    }

    return [
      /\.plugin\.(ts|js)$/,
      /\.adapter\.(ts|js)$/,
      /\.provider\.(ts|js)$/,
    ];
  }

  /**
   * Find files matching patterns
   */
  private findFiles(
    dir: string,
    patterns: (RegExp | string)[],
    recursive: boolean,
  ): string[] {
    const files: string[] = [];

    const traverse = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);

      entries.forEach((entry) => {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && recursive) {
          traverse(fullPath);
        } else if (stat.isFile()) {
          if (this.matchesPattern(entry, patterns)) {
            files.push(fullPath);
          }
        }
      });
    };

    traverse(dir);
    return files;
  }

  /**
   * Check if filename matches any pattern
   */
  private matchesPattern(
    filename: string,
    patterns: (RegExp | string)[],
  ): boolean {
    return patterns.some((pattern) => {
      if (typeof pattern === 'string') {
        return filename.includes(pattern);
      }
      return pattern.test(filename);
    });
  }
}

/**
 * Plugin Manager - orchestrates plugin loading, initialization, and lifecycle
 */
@Injectable()
export class PluginManager implements IPluginManager, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PluginManager.name);
  private readonly registry: PluginRegistry;
  private readonly discovery: PluginDiscovery;
  private readonly config: Required<PluginManagerConfig>;
  private readonly customProviders: PluginProvider[];
  private initialized = false;

  constructor(config: PluginManagerConfig = {}) {
    this.config = {
      discovery: config.discovery || {},
      registry: config.registry || {},
      pluginsDir: config.pluginsDir || './plugins',
      customProviders: config.customProviders || [],
      maxConcurrency: config.maxConcurrency ?? 5,
      debug: config.debug ?? false,
    };

    this.registry = new PluginRegistry(this.config.registry);
    this.discovery = new PluginDiscovery();
    this.customProviders = this.config.customProviders;

    if (this.config.debug) {
      this.logger.debug('PluginManager initialized with config:', this.config);
    }
  }

  /**
   * Initialize plugin manager on module init
   */
  async onModuleInit(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.initialize();
      this.initialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize plugin manager:', error);
      throw error;
    }
  }

  /**
   * Destroy plugin manager on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  /**
   * Initialize plugin manager - discover and load plugins
   */
  async initialize(): Promise<void> {
    this.logger.log('Initializing PluginManager');

    // Auto-discover plugins if directory is configured
    if (this.config.pluginsDir) {
      try {
        await this.discoverPlugins({
          directories: [this.config.pluginsDir],
          ...this.config.discovery,
        });
      } catch (error) {
        this.logger.warn('Plugin auto-discovery failed:', error);
      }
    }
  }

  /**
   * Discover plugins
   */
  async discoverPlugins(
    options: PluginDiscoveryOptions,
  ): Promise<PluginMetadata[]> {
    this.logger.log('Discovering plugins...');
    return this.discovery.discover(options);
  }

  /**
   * Load a plugin
   */
  async loadPlugin(filePath: string): Promise<Plugin> {
    try {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      this.logger.debug(`Loading plugin from: "${resolvedPath}"`);

      // Dynamic import
      const module = await import(resolvedPath);
      const PluginClass = this.extractPluginClass(module);

      if (!PluginClass) {
        throw new Error(`No valid Plugin export found in "${resolvedPath}"`);
      }

      const instance = new PluginClass();

      if (this.config.debug) {
        this.logger.debug(
          `Plugin loaded: "${instance.metadata.id}" v${instance.metadata.version}`,
        );
      }

      return instance;
    } catch (error) {
      this.logger.error(`Failed to load plugin from "${filePath}":`, error);
      throw error;
    }
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: Plugin, metadata?: Record<string, unknown>): Promise<void> {
    await this.registry.register(plugin, metadata);
  }

  /**
   * Register multiple plugins
   */
  async registerPlugins(plugins: Plugin[]): Promise<void> {
    for (const plugin of plugins) {
      await this.registry.register(plugin);
    }
  }

  /**
   * Get a registered plugin
   */
  getPlugin(pluginId: string): Plugin {
    return this.registry.get(pluginId);
  }

  /**
   * Try to get a plugin without throwing
   */
  tryGetPlugin(pluginId: string): Plugin | undefined {
    return this.registry.tryGet(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): Plugin[] {
    return this.registry.getAll();
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return this.registry.getEnabled();
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capabilityName: string): Plugin[] {
    return this.registry.getByCapability(capabilityName);
  }

  /**
   * Get plugins by tag
   */
  getPluginsByTag(tag: string): Plugin[] {
    return this.registry.getByTag(tag);
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    return this.registry.unregister(pluginId);
  }

  /**
   * Initialize a plugin
   */
  async initializePlugin(
    pluginId: string,
    config?: Record<string, unknown>,
  ): Promise<void> {
    const plugin = this.registry.get(pluginId);
    await plugin.initialize(config);
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    await plugin.enable();
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    await plugin.disable();
  }

  /**
   * Execute a plugin command
   */
  async executePlugin<T = unknown, R = unknown>(
    pluginId: string,
    command: string,
    payload: T,
  ): Promise<R> {
    const plugin = this.registry.get(pluginId);
    this.recordPluginExecution(plugin);
    return plugin.execute<T, R>(command, payload);
  }

  /**
   * Shutdown plugin manager
   */
  async shutdown(): Promise<void> {
    this.logger.log('Shutting down PluginManager');
    await this.registry.clear();
    this.initialized = false;
  }

  /**
   * Get plugin statistics
   */
  getStatistics() {
    return this.registry.getStats();
  }

  /**
   * Get all plugin information
   */
  getPluginInfo() {
    return this.registry.listEntries().map((entry) => ({
      metadata: entry.plugin.metadata,
      state: entry.plugin.state,
      status: entry.plugin.getStatus(),
      registeredAt: entry.registeredAt,
    }));
  }

  /**
   * Extract plugin class from module
   */
  private extractPluginClass(
    mod: Record<string, unknown>,
  ): new () => Plugin | null {
    // Try to find a class that implements Plugin interface
    for (const key in mod) {
      const value = mod[key];
      if (
        typeof value === 'function' &&
        this.isPluginClass(value) &&
        this.implementsPluginInterface(value)
      ) {
        return value as new () => Plugin;
      }
    }
    return null;
  }

  /**
   * Check if value is a class
   */
  private isPluginClass(value: unknown): boolean {
    return typeof value === 'function' && /^class\s/.test(value.toString());
  }

  /**
   * Check if class implements Plugin interface
   */
  private implementsPluginInterface(value: unknown): boolean {
    if (typeof value !== 'function') {
      return false;
    }

    const requiredMethods = [
      'initialize',
      'enable',
      'disable',
      'unload',
      'execute',
      'getStatus',
    ];
    const prototype = (value as any).prototype;

    return requiredMethods.every((method) => typeof prototype[method] === 'function');
  }

  /**
   * Record plugin execution for statistics
   */
  private recordPluginExecution(plugin: Plugin): void {
    if (this.config.debug) {
      this.logger.debug(
        `Executing plugin: "${plugin.metadata.id}"`,
      );
    }
  }
}
