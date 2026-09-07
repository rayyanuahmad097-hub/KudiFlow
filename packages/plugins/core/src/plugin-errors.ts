/**
 * Plugin system error classes
 */

/**
 * Base plugin error
 */
export class PluginError extends Error {
  constructor(message: string, public readonly code: string = 'PLUGIN_ERROR') {
    super(message);
    this.name = 'PluginError';
    Object.setPrototypeOf(this, PluginError.prototype);
  }
}

/**
 * Error thrown when plugin fails to load
 */
export class PluginLoadError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId?: string,
    public readonly filePath?: string,
  ) {
    super(message, 'PLUGIN_LOAD_ERROR');
    this.name = 'PluginLoadError';
    Object.setPrototypeOf(this, PluginLoadError.prototype);
  }
}

/**
 * Error thrown when plugin validation fails
 */
export class PluginValidationError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId?: string,
    public readonly validationErrors?: string[],
  ) {
    super(message, 'PLUGIN_VALIDATION_ERROR');
    this.name = 'PluginValidationError';
    Object.setPrototypeOf(this, PluginValidationError.prototype);
  }
}

/**
 * Error thrown when plugin initialization fails
 */
export class PluginInitializationError extends PluginError {
  constructor(message: string, public readonly pluginId?: string) {
    super(message, 'PLUGIN_INITIALIZATION_ERROR');
    this.name = 'PluginInitializationError';
    Object.setPrototypeOf(this, PluginInitializationError.prototype);
  }
}

/**
 * Error thrown when plugin dependency is not found
 */
export class PluginDependencyError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId?: string,
    public readonly missingDependency?: string,
  ) {
    super(message, 'PLUGIN_DEPENDENCY_ERROR');
    this.name = 'PluginDependencyError';
    Object.setPrototypeOf(this, PluginDependencyError.prototype);
  }
}

/**
 * Error thrown when plugin is not found
 */
export class PluginNotFoundError extends PluginError {
  constructor(public readonly pluginId: string) {
    super(`Plugin not found: "${pluginId}"`, 'PLUGIN_NOT_FOUND');
    this.name = 'PluginNotFoundError';
    Object.setPrototypeOf(this, PluginNotFoundError.prototype);
  }
}

/**
 * Error thrown when plugin is in invalid state
 */
export class PluginStateError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId?: string,
    public readonly currentState?: string,
  ) {
    super(message, 'PLUGIN_STATE_ERROR');
    this.name = 'PluginStateError';
    Object.setPrototypeOf(this, PluginStateError.prototype);
  }
}
