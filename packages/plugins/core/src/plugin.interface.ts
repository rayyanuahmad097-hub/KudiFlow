/**
 * Plugin System Core Interfaces
 * Provides standardized interfaces for dynamic plugin loading and management
 */

/**
 * Plugin metadata for identification and discovery
 */
export interface PluginMetadata {
  /** Unique plugin identifier */
  id: string;

  /** Human-readable plugin name */
  name: string;

  /** Plugin version following semantic versioning */
  version: string;

  /** Plugin description */
  description?: string;

  /** Plugin author/organization */
  author?: string;

  /** License type */
  license?: string;

  /** URL to plugin repository */
  repository?: string;

  /** Minimum required KudiFlow version */
  minKudiFlowVersion?: string;

  /** Array of tags for categorization */
  tags?: string[];

  /** Additional metadata */
  [key: string]: unknown;
}

/**
 * Plugin dependencies specification
 */
export interface PluginDependency {
  /** Plugin ID or name */
  id: string;

  /** Required version range */
  version?: string;

  /** Whether this dependency is optional */
  optional?: boolean;
}

/**
 * Plugin capabilities - what this plugin provides
 */
export interface PluginCapability {
  /** Capability identifier */
  name: string;

  /** Capability version */
  version: string;

  /** Capability description */
  description?: string;

  /** Supported operations - Method names this capability provides */
  operations?: string[];
}

/**
 * Plugin configuration schema
 */
export interface PluginConfigSchema {
  /** Configuration schema in JSON Schema format */
  schema: Record<string, unknown>;

  /** Default configuration values */
  defaults?: Record<string, unknown>;

  /** Whether configuration is required for plugin initialization */
  required?: boolean;

  /** Validation rules */
  validate?: (config: Record<string, unknown>) => boolean | Promise<boolean>;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycleHooks {
  /** Called when plugin is loaded */
  onLoad?(): Promise<void>;

  /** Called when plugin is enabled */
  onEnable?(config?: Record<string, unknown>): Promise<void>;

  /** Called when plugin is disabled */
  onDisable?(): Promise<void>;

  /** Called before plugin is unloaded */
  onBeforeUnload?(): Promise<void>;

  /** Called for periodic health checks */
  onHealthCheck?(): Promise<boolean>;

  /** Called when configuration changes */
  onConfigChange?(newConfig: Record<string, unknown>): Promise<void>;
}

/**
 * Plugin hooks for extending bridge functionality
 */
export interface PluginBridgeHooks {
  /** Called when a bridge provider is registered */
  onBridgeRegistered?(bridgeName: string, metadata?: Record<string, unknown>): Promise<void>;

  /** Called before bridge execution */
  onBeforeBridgeExecute?(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown>;

  /** Called after bridge execution */
  onAfterBridgeExecute?(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void | unknown>;

  /** Called when bridge execution fails */
  onBridgeExecuteError?(
    bridgeName: string,
    operation: string,
    error: Error,
  ): Promise<void>;
}

/**
 * Core Plugin interface
 * All plugins must implement this interface
 */
export interface Plugin extends PluginLifecycleHooks, PluginBridgeHooks {
  /** Plugin metadata */
  readonly metadata: PluginMetadata;

  /** Plugin capabilities - what this plugin provides */
  readonly capabilities: PluginCapability[];

  /** Plugins this plugin depends on */
  dependencies?: PluginDependency[];

  /** Configuration schema and validation */
  configSchema?: PluginConfigSchema;

  /** Current plugin state */
  readonly state: PluginState;

  /** Current plugin configuration */
  readonly config?: Record<string, unknown>;

  /** Check if plugin is initialized */
  isInitialized(): boolean;

  /** Check if plugin is enabled */
  isEnabled(): boolean;

  /** Initialize the plugin */
  initialize(config?: Record<string, unknown>): Promise<void>;

  /** Enable the plugin */
  enable(): Promise<void>;

  /** Disable the plugin */
  disable(): Promise<void>;

  /** Unload the plugin */
  unload(): Promise<void>;

  /** Get plugin status and diagnostic info */
  getStatus(): PluginStatus;

  /** Execute a plugin-specific command */
  execute<T = unknown, R = unknown>(command: string, payload: T): Promise<R>;
}

/**
 * Plugin state enum
 */
export enum PluginState {
  UNLOADED = 'unloaded',
  LOADED = 'loaded',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ENABLING = 'enabling',
  ENABLED = 'enabled',
  DISABLING = 'disabling',
  DISABLED = 'disabled',
  ERROR = 'error',
}

/**
 * Plugin status information
 */
export interface PluginStatus {
  /** Plugin metadata */
  metadata: PluginMetadata;

  /** Current state */
  state: PluginState;

  /** Whether plugin is healthy */
  isHealthy: boolean;

  /** Error message if state is ERROR */
  error?: string;

  /** When plugin was loaded */
  loadedAt?: Date;

  /** When plugin was enabled */
  enabledAt?: Date;

  /** Plugin statistics */
  stats?: {
    /** Number of executed commands */
    executedCommands?: number;

    /** Last execution timestamp */
    lastExecution?: Date;

    /** Number of errors encountered */
    errorCount?: number;

    [key: string]: unknown;
  };
}

/**
 * Plugin Constructor - for instantiating plugins
 */
export interface PluginConstructor {
  new (): Plugin;
}

/**
 * Plugin provider - source of plugins
 */
export interface PluginProvider {
  /** Get available plugins */
  getAvailablePlugins(): Promise<PluginMetadata[]>;

  /** Load a plugin by ID */
  loadPlugin(pluginId: string): Promise<Plugin>;

  /** Check if provider has a plugin */
  hasPlugin(pluginId: string): Promise<boolean>;
}

/**
 * Plugin discovery options
 */
export interface PluginDiscoveryOptions {
  /** Directories to scan for plugins */
  directories?: string[];

  /** Include test files in discovery */
  includeTests?: boolean;

  /** Recursive discovery in subdirectories */
  recursive?: boolean;

  /** File pattern to match */
  pattern?: RegExp | string[];

  /** Maximum discovery time in milliseconds */
  timeout?: number;
}

/**
 * Plugin registry options
 */
export interface PluginRegistryOptions {
  /** Allow overwriting existing plugins */
  allowOverwrite?: boolean;

  /** Auto-initialize plugins on registration */
  autoInitialize?: boolean;

  /** Auto-enable plugins after initialization */
  autoEnable?: boolean;

  /** Enable dependency resolution */
  resolveDependencies?: boolean;

  /** Enable plugin sandboxing */
  sandboxing?: boolean;
}

/**
 * Plugin manager configuration
 */
export interface PluginManagerConfig {
  /** Plugin discovery options */
  discovery?: PluginDiscoveryOptions;

  /** Plugin registry options */
  registry?: PluginRegistryOptions;

  /** Plugins directory */
  pluginsDir?: string;

  /** Custom plugin providers */
  customProviders?: PluginProvider[];

  /** Maximum concurrent plugin operations */
  maxConcurrency?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Plugin Manager interface
 */
export interface PluginManager {
  initialize(): Promise<void>;
  discoverPlugins(options: PluginDiscoveryOptions): Promise<PluginMetadata[]>;
  loadPlugin(filePath: string): Promise<Plugin>;
  registerPlugin(plugin: Plugin, metadata?: Record<string, unknown>): Promise<void>;
  registerPlugins(plugins: Plugin[]): Promise<void>;
  getPlugin(pluginId: string): Plugin;
  tryGetPlugin(pluginId: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  getEnabledPlugins(): Plugin[];
  getPluginsByCapability(capabilityName: string): Plugin[];
  getPluginsByTag(tag: string): Plugin[];
  unregisterPlugin(pluginId: string): Promise<boolean>;
  initializePlugin(pluginId: string, config?: Record<string, unknown>): Promise<void>;
  enablePlugin(pluginId: string): Promise<void>;
  disablePlugin(pluginId: string): Promise<void>;
  executePlugin<T = unknown, R = unknown>(pluginId: string, command: string, payload: T): Promise<R>;
  shutdown(): Promise<void>;
  getStatistics(): any;
  getPluginInfo(): any;
}
