import { useState, useEffect, useCallback } from 'react';

export interface BridgeStatusInfo {
  bridgeId: string;
  name: string;
  status: 'active' | 'degraded' | 'offline';
  uptime: number;
  lastUpdated: string;
  errorMessage?: string;
}

export function useBridgeStatus(bridgeId?: string) {
  const [status, setStatus] = useState<BridgeStatusInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!bridgeId) return;

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/bridge-compare/status/${bridgeId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data: BridgeStatusInfo = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [bridgeId]);

  useEffect(() => {
    fetchStatus();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useBridgeStatuses(bridgeIds?: string[]) {
  const [statuses, setStatuses] = useState<BridgeStatusInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/bridge-compare/status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch statuses: ${response.statusText}`);
      }

      const data: BridgeStatusInfo[] = await response.json();

      // Filter by bridgeIds if provided
      const filtered = bridgeIds
        ? data.filter((s) => bridgeIds.includes(s.bridgeId))
        : data;

      setStatuses(filtered);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeIds]);

  useEffect(() => {
    fetchStatuses();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, [fetchStatuses]);

  return { statuses, loading, error, refetch: fetchStatuses };
}

export function useOfflineBridges() {
  const { statuses, loading, error, refetch } = useBridgeStatuses();

  const offlineBridges = statuses.filter((s) => s.status === 'offline');
  const degradedBridges = statuses.filter((s) => s.status === 'degraded');

  return {
    offlineBridges,
    degradedBridges,
    unavailableBridges: [...offlineBridges, ...degradedBridges],
    allStatuses: statuses,
    loading,
    error,
    refetch,
  };
}
