import { Logger } from '@nestjs/common';
import {
  Plugin,
  PluginMetadata,
  PluginDependency,
  PluginCapability,
} from './plugin.interface';
import {
  PluginValidationError,
  PluginDependencyError,
} from './plugin-errors';

/**
 * Plugin validation rules and results
 */
export interface ValidationRule {
  name: string;
  validate: (plugin: Plugin) => boolean | Promise<boolean>;
  message: (plugin: Plugin) => string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Plugin Validator - validates plugin structure and metadata
 */
export class PluginValidator {
  private readonly logger = new Logger(PluginValidator.name);
  private readonly rules: ValidationRule[] = [];

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Register default validation rules
   */
  private registerDefaultRules(): void {
    // Rule: Plugin must have metadata
    this.rules.push({
      name: 'has-metadata',
      validate: (plugin) => plugin.metadata !== undefined,
      message: (plugin) => `Plugin missing metadata`,
    });

    // Rule: Plugin metadata must have required fields
    this.rules.push({
      name: 'metadata-complete',
      validate: (plugin) =>
        this.hasRequiredMetadataFields(plugin.metadata),
      message: (plugin) =>
        `Plugin metadata missing required fields (id, name, version)`,
    });

    // Rule: Plugin must have capabilities
    this.rules.push({
      name: 'has-capabilities',
      validate: (plugin) => Array.isArray(plugin.capabilities),
      message: (plugin) => `Plugin missing capabilities array`,
    });

    // Rule: Plugin must have execute method
    this.rules.push({
      name: 'has-execute',
      validate: (plugin) => typeof plugin.execute === 'function',
      message: (plugin) => `Plugin missing execute method`,
    });

    // Rule: Plugin must have required methods
    this.rules.push({
      name: 'has-required-methods',
      validate: (plugin) => this.hasRequiredMethods(plugin),
      message: (plugin) =>
        `Plugin missing required lifecycle methods`,
    });

    // Rule: Capabilities must have name and version
    this.rules.push({
      name: 'capabilities-valid',
      validate: (plugin) => this.areCapabilitiesValid(plugin.capabilities),
      message: (plugin) =>
        `Plugin has invalid capability definitions`,
    });

    // Rule: Unique plugin ID
    this.rules.push({
      name: 'unique-id',
      validate: (plugin) => this.isValidId(plugin.metadata.id),
      message: (plugin) =>
        `Plugin has invalid or duplicate ID: "${plugin.metadata.id}"`,
    });

    // Rule: Valid version format
    this.rules.push({
      name: 'valid-version',
      validate: (plugin) =>
        this.isValidSemanticVersion(plugin.metadata.version),
      message: (plugin) =>
        `Plugin has invalid version format: "${plugin.metadata.version}"`,
    });
  }

  /**
   * Validate a plugin
   */
  async validate(plugin: Plugin): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.validate(plugin);
        if (!result) {
          errors.push(rule.message(plugin));
        }
      } catch (error) {
        this.logger.error(`Validation rule "${rule.name}" failed:`, error);
        errors.push(`Rule "${rule.name}" failed: ${error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate plugin metadata
   */
  validateMetadata(metadata: PluginMetadata): ValidationResult {
    const errors: string[] = [];

    if (!metadata.id) {
      errors.push('Plugin metadata must have an id');
    } else if (!this.isValidId(metadata.id)) {
      errors.push(`Invalid plugin id: "${metadata.id}"`);
    }

    if (!metadata.name) {
      errors.push('Plugin metadata must have a name');
    }

    if (!metadata.version) {
      errors.push('Plugin metadata must have a version');
    } else if (!this.isValidSemanticVersion(metadata.version)) {
      errors.push(`Invalid version format: "${metadata.version}"`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate plugin dependencies
   */
  validateDependencies(
    dependencies: PluginDependency[] | undefined,
  ): ValidationResult {
    const errors: string[] = [];

    if (!dependencies) {
      return { valid: true, errors, warnings: [] };
    }

    dependencies.forEach((dep, index) => {
      if (!dep.id) {
        errors.push(`Dependency at index ${index} missing id`);
      }

      if (dep.version && !this.isValidSemanticVersion(dep.version)) {
        errors.push(
          `Dependency "${dep.id}" has invalid version format: "${dep.version}"`,
        );
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Register custom validation rule
   */
  registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove validation rule by name
   */
  removeRule(ruleName: string): void {
    const index = this.rules.findIndex((r) => r.name === ruleName);
    if (index !== -1) {
      this.rules.splice(index, 1);
    }
  }

  /**
   * Private helper methods
   */

  private hasRequiredMetadataFields(metadata: PluginMetadata): boolean {
    return !!(metadata.id && metadata.name && metadata.version);
  }

  private hasRequiredMethods(plugin: Plugin): boolean {
    const requiredMethods = [
      'initialize',
      'enable',
      'disable',
      'unload',
      'isInitialized',
      'isEnabled',
      'getStatus',
    ];

    return requiredMethods.every(
      (method) => typeof (plugin as any)[method] === 'function',
    );
  }

  private areCapabilitiesValid(capabilities: PluginCapability[]): boolean {
    if (!Array.isArray(capabilities)) {
      return false;
    }

    return capabilities.every(
      (cap) => cap.name && cap.version && typeof cap.name === 'string',
    );
  }

  private isValidId(id: string): boolean {
    // ID must be a non-empty string, alphanumeric with hyphens/underscores
    return /^[a-z0-9_-]+$/.test(id) && id.length > 0;
  }

  private isValidSemanticVersion(version: string): boolean {
    // Basic semantic version validation (X.Y.Z)
    return /^\d+\.\d+\.\d+.*$/.test(version);
  }
}
