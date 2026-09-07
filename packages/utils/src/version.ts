/**
 * KudiFlow SDK Version Information
 * 
 * This module provides version information for the KudiFlow SDK.
 * The version is synchronized with package.json and can be used for:
 * - Debugging
 * - API version tracking
 * - Client compatibility checks
 * - Analytics and monitoring
 */

// Version will be read from package.json at build time
let packageVersion = '0.1.0';

try {
  // Dynamic require for package.json (works in Node.js environments)
  const pkg = require('../package.json');
  packageVersion = pkg.version || '0.1.0';
} catch {
  // Fallback to default version if package.json not available
  packageVersion = '0.1.0';
}

export interface SDKVersion {
  /** Full version string (e.g., "1.2.3") */
  version: string;
  /** Major version number */
  major: number;
  /** Minor version number */
  minor: number;
  /** Patch version number */
  patch: number;
  /** Build timestamp (ISO 8601 format) */
  buildDate?: string;
  /** Environment (development, production) */
  environment: 'development' | 'production' | 'test';
}

/**
 * Parse version string into components
 */
function parseVersion(version: string): Omit<SDKVersion, 'buildDate' | 'environment'> {
  const [major, minor, patch] = version.split('.').map(Number);
  
  return {
    version,
    major: major || 0,
    minor: minor || 0,
    patch: patch || 0,
  };
}

/**
 * Get current SDK version information
 */
export function getSDKVersion(): SDKVersion {
  const baseVersion = parseVersion(packageVersion);
  
  return {
    ...baseVersion,
    buildDate: process.env.BUILD_DATE,
    environment: (process.env.NODE_ENV as SDKVersion['environment']) || 'development',
  };
}

/**
 * Get version string in semver format
 */
export function getVersionString(): string {
  return packageVersion;
}

/**
 * Check if current version meets minimum requirements
 * @param minVersion - Minimum required version (e.g., "1.2.0")
 * @returns true if current version >= minVersion
 */
export function satisfiesMinVersion(minVersion: string): boolean {
  const current = parseVersion(packageVersion);
  const required = parseVersion(minVersion);
  
  if (current.major > required.major) return true;
  if (current.major < required.major) return false;
  
  if (current.minor > required.minor) return true;
  if (current.minor < required.minor) return false;
  
  return current.patch >= required.patch;
}

/**
 * Compare two versions
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

/**
 * Log version information to console (useful for debugging)
 */
export function logVersionInfo(): void {
  const version = getSDKVersion();
  
  console.group?.('🔗 KudiFlow SDK');
  console.log?.(`Version: ${version.version}`);
  console.log?.(`Major: ${version.major}`);
  console.log?.(`Minor: ${version.minor}`);
  console.log?.(`Patch: ${version.patch}`);
  
  if (version.buildDate) {
    console.log?.(`Build Date: ${version.buildDate}`);
  }
  
  console.log?.(`Environment: ${version.environment}`);
  console.groupEnd?.();
}

// Export parsed version components for convenience
export const VERSION = packageVersion;
export const MAJOR_VERSION = parseVersion(packageVersion).major;
export const MINOR_VERSION = parseVersion(packageVersion).minor;
export const PATCH_VERSION = parseVersion(packageVersion).patch;
