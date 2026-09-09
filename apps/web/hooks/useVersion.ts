'use client';

import { useState, useEffect } from 'react';

export interface VersionData {
  version: string;
  build?: string;
  apiVersion: string;
  environment: string;
  timestamp: string;
}

export interface UseVersionOptions {
  /** API base URL */
  apiUrl?: string;
  /** Enable auto-refresh interval in ms (0 to disable) */
  refreshInterval?: number;
  /** Enable console logging on mount */
  enableLogging?: boolean;
}

/**
 * Hook to fetch and display SDK/API version information
 */
export function useVersion(options: UseVersionOptions = {}) {
  const {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    refreshInterval = 0,
    enableLogging = false,
  } = options;

  const [version, setVersion] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersion = async () => {
    try {
      const response = await fetch(`${apiUrl}/version`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch version: ${response.statusText}`);
      }

      const data: VersionData = await response.json();
      setVersion(data);
      setError(null);

      if (enableLogging && data) {
        console.log(`🔗 KudiFlow SDK v${data.version} (${data.environment})`);
      }
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      setError(errorInstance);
      
      if (enableLogging) {
        console.error('❌ Failed to fetch SDK version:', errorInstance.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersion();

    // Auto-refresh if interval is set
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVersion, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [apiUrl, refreshInterval]);

  return {
    version,
    loading,
    error,
    refetch: fetchVersion,
  };
}

/**
 * Get local SDK version from package (no API call)
 */
export function useLocalVersion() {
  const [version, setVersion] = useState<string>('0.0.1');

  useEffect(() => {
    // Try to get version from package.json
    try {
      // This will work in bundler environments
      const pkg = require('../package.json');
      setVersion(pkg.version || '0.0.1');
    } catch {
      // Fallback to default version
      setVersion('0.0.1');
    }
  }, []);

  return version;
}
