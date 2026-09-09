import { useState, useEffect, useCallback } from 'react';
import { isBrowser, ssrLocalStorage } from '../components/ui-lib/utils/ssr';

const CACHE_KEY = 'kudiflow_offline_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface OfflineCache {
  routes: unknown[];
  quotes: unknown[];
  cachedAt: number;
}

export interface UseOfflineDetectionResult {
  isOffline: boolean;
  cache: OfflineCache | null;
  saveToCache: (data: Partial<OfflineCache>) => void;
  clearCache: () => void;
}

export function useOfflineDetection(): UseOfflineDetectionResult {
  const [isOffline, setIsOffline] = useState<boolean>(
    isBrowser ? !navigator.onLine : false,
  );
  const [cache, setCache] = useState<OfflineCache | null>(() => {
    const stored = ssrLocalStorage.getItem(CACHE_KEY);
    if (!stored) return null;
    try {
      const parsed: OfflineCache = JSON.parse(stored);
      if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
        ssrLocalStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!isBrowser) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveToCache = useCallback((data: Partial<OfflineCache>) => {
    setCache((prev) => {
      const next: OfflineCache = {
        routes: data.routes ?? prev?.routes ?? [],
        quotes: data.quotes ?? prev?.quotes ?? [],
        cachedAt: Date.now(),
      };
      ssrLocalStorage.setItem(CACHE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCache = useCallback(() => {
    ssrLocalStorage.removeItem(CACHE_KEY);
    setCache(null);
  }, []);

  return { isOffline, cache, saveToCache, clearCache };
}
