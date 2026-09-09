/**
 * useRecommendation Hook
 * 
 * React hook for getting smart bridge route recommendations.
 * Integrates with the recommendation API endpoint.
 */

import { useState, useCallback } from 'react';

/**
 * User preference types
 */
export enum UserPreference {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
  BALANCED = 'balanced',
  MOST_RELIABLE = 'most-reliable',
}

/**
 * Route input type
 */
export interface RouteInput {
  id: string;
  bridgeName: string;
  sourceChain: string;
  destinationChain: string;
  inputAmount: string;
  outputAmount: string;
  feeUsd: number;
  gasCostUsd: number;
  totalFeeUsd: number;
  estimatedTimeSeconds: number;
  reliabilityScore: number;
  slippagePercent: number;
  liquidityUsd: number;
}

/**
 * Recommendation result type
 */
export interface RecommendationResult {
  rank: number;
  bridge: string;
  score: number;
  confidence: string;
  recommendation: string;
  fee: number;
  time: number;
  reliability: number;
}

/**
 * Hook return type
 */
interface UseRecommendationReturn {
  recommendations: RecommendationResult[];
  isLoading: boolean;
  error: Error | null;
  getRecommendations: (
    routes: RouteInput[],
    preference: UserPreference,
    options?: {
      minReliability?: number;
      maxFeeUsd?: number;
      maxTimeSeconds?: number;
    },
  ) => Promise<void>;
  clearRecommendations: () => void;
}

/**
 * Use recommendation hook
 */
export function useRecommendation(): UseRecommendationReturn {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get recommendations from API
   */
  const getRecommendations = useCallback(
    async (
      routes: RouteInput[],
      preference: UserPreference,
      options?: {
        minReliability?: number;
        maxFeeUsd?: number;
        maxTimeSeconds?: number;
      },
    ) => {
      if (!routes || routes.length === 0) {
        setRecommendations([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            routes,
            preference,
            minReliability: options?.minReliability,
            maxFeeUsd: options?.maxFeeUsd,
            maxTimeSeconds: options?.maxTimeSeconds,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err as Error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Clear recommendations
   */
  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    clearRecommendations,
  };
}
