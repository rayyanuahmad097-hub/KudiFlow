import {
  Plugin,
  PluginMetadata,
  PluginCapability,
  PluginState,
  PluginStatus,
  PluginDependency,
  PluginLifecycleHooks,
} from './plugin.interface';

/**
 * Abstract base class for implementing plugins
 * Provides standard lifecycle management and state tracking
 */
export abstract class BasePlugin implements Plugin {
  protected currentState: PluginState = PluginState.UNLOADED;
  protected currentConfig?: Record<string, unknown>;
  protected loadedAt?: Date;
  protected enabledAt?: Date;
  protected executedCommands: number = 0;
  protected errorCount: number = 0;
  protected lastExecution?: Date;
  protected lastError?: Error;

  abstract readonly metadata: PluginMetadata;
  abstract readonly capabilities: PluginCapability[];

  dependencies?: PluginDependency[];

  /**
   * Get current plugin state
   */
  get state(): PluginState {
    return this.currentState;
  }

  /**
   * Get current configuration
   */
  get config(): Record<string, unknown> | undefined {
    return this.currentConfig;
  }

  /**
   * Check if plugin is initialized
   */
  isInitialized(): boolean {
    return (
      this.currentState === PluginState.INITIALIZED ||
      this.currentState === PluginState.ENABLED
    );
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(): boolean {
    return this.currentState === PluginState.ENABLED;
  }

  /**
   * Initialize the plugin
   */
  async initialize(config?: Record<string, unknown>): Promise<void> {
    if (this.currentState !== PluginState.LOADED) {
      throw new Error(
        `Cannot initialize plugin in state: ${this.currentState}`,
      );
    }

    this.currentState = PluginState.INITIALIZING;

    try {
      this.currentConfig = config;
      this.loadedAt = new Date();

      // Call validation if config schema exists
      if (this.configSchema?.validate && config) {
        const isValid = await this.configSchema.validate(config);
        if (!isValid) {
          throw new Error('Plugin configuration validation failed');
        }
      }

      // Call plugin-specific initialization
      await this.onLoad?.();
      this.currentState = PluginState.INITIALIZED;
    } catch (error) {
      this.currentState = PluginState.ERROR;
      this.lastError = error as Error;
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Enable the plugin
   */
  async enable(): Promise<void> {
    if (this.currentState === PluginState.ENABLED) {
      return; // Already enabled
    }

    if (!this.isInitialized()) {
      throw new Error(`Cannot enable uninitialized plugin`);
    }

    this.currentState = PluginState.ENABLING;

    try {
      await this.onEnable?.(this.currentConfig);
      this.enabledAt = new Date();
      this.currentState = PluginState.ENABLED;
    } catch (error) {
      this.currentState = PluginState.ERROR;
      this.lastError = error as Error;
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Disable the plugin
   */
  async disable(): Promise<void> {
    if (this.currentState !== PluginState.ENABLED) {
      return; // Not enabled, nothing to disable
    }

    this.currentState = PluginState.DISABLING;

    try {
      await this.onDisable?.();
      this.currentState = PluginState.DISABLED;
    } catch (error) {
      this.currentState = PluginState.ERROR;
      this.lastError = error as Error;
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Unload the plugin
   */
  async unload(): Promise<void> {
    try {
      // Disable if enabled
      if (this.isEnabled()) {
        await this.disable();
      }

      await this.onBeforeUnload?.();
      this.currentState = PluginState.UNLOADED;
    } catch (error) {
      this.currentState = PluginState.ERROR;
      this.lastError = error as Error;
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Get plugin status
   */
  getStatus(): PluginStatus {
    return {
      metadata: this.metadata,
      state: this.currentState,
      isHealthy: this.currentState !== PluginState.ERROR,
      error: this.lastError?.message,
      loadedAt: this.loadedAt,
      enabledAt: this.enabledAt,
      stats: {
        executedCommands: this.executedCommands,
        lastExecution: this.lastExecution,
        errorCount: this.errorCount,
      },
    };
  }

  /**
   * Default execute implementation - override in subclass
   */
  async execute<T = unknown, R = unknown>(
    _command: string,
    _payload: T,
  ): Promise<R> {
    throw new Error('Execute method not implemented');
  }

  /**
   * Optional configuration schema - override in subclass if needed
   */
  configSchema?: any;

  /**
   * Optional lifecycle hooks - override in subclass as needed
   */
  async onLoad?(): Promise<void>;
  async onEnable?(config?: Record<string, unknown>): Promise<void>;
  async onDisable?(): Promise<void>;
  async onBeforeUnload?(): Promise<void>;

  /**
   * Optional bridge hooks - override in subclass as needed
   */
  async onBridgeRegistered?(
    bridgeName: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  async onBeforeBridgeExecute?(
    bridgeName: string,
    operation: string,
    payload: unknown,
  ): Promise<void | unknown>;
  async onAfterBridgeExecute?(
    bridgeName: string,
    operation: string,
    result: unknown,
  ): Promise<void | unknown>;
  async onBridgeExecuteError?(
    bridgeName: string,
    operation: string,
    error: Error,
  ): Promise<void>;

  /**
   * Helper method to track command execution
   */
  protected recordExecution(): void {
    this.executedCommands++;
    this.lastExecution = new Date();
  }

  /**
   * Helper method to record error
   */
  protected recordError(error: Error): void {
    this.errorCount++;
    this.lastError = error;
  }
}
