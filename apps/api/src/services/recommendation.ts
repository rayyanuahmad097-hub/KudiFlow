/**
 * Smart Route Recommendation Engine
 * 
 * Provides AI-lite bridge route recommendations based on user preferences.
 * Dynamically adjusts ranking weights for fastest, cheapest, or balanced routes.
 * 
 * Implementation Scope: src/services/recommendation.ts
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * User preference types for route optimization
 */
export enum UserPreference {
  FASTEST = 'fastest',
  CHEAPEST = 'cheapest',
  BALANCED = 'balanced',
  MOST_RELIABLE = 'most-reliable',
}

/**
 * Route scoring weights based on user preference
 */
export interface PreferenceWeights {
  cost: number;
  speed: number;
  reliability: number;
  slippage: number;
  liquidity: number;
}

/**
 * Bridge route input for recommendation
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
  reliabilityScore: number; // 0-100
  slippagePercent: number;
  liquidityUsd: number;
  historicalSuccessRate?: number; // 0-1
}

/**
 * Recommendation result with scoring breakdown
 */
export interface RecommendationResult {
  route: RouteInput;
  score: number; // 0-100
  rank: number;
  breakdown: {
    costScore: number;
    speedScore: number;
    reliabilityScore: number;
    slippageScore: number;
    liquidityScore: number;
  };
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
}

/**
 * Recommendation request with user preferences
 */
export interface RecommendationRequest {
  routes: RouteInput[];
  preference: UserPreference;
  minReliability?: number; // Minimum reliability score (0-100)
  maxFeeUsd?: number; // Maximum acceptable fee
  maxTimeSeconds?: number; // Maximum acceptable time
}

/**
 * Smart route recommendation service with preference-based ranking
 */
@Injectable()
export class SmartRecommendationService {
  private readonly logger = new Logger(SmartRecommendationService.name);

  /**
   * Pre-configured weight profiles for different user preferences
   */
  private readonly WEIGHT_PROFILES: Record<UserPreference, PreferenceWeights> = {
    [UserPreference.FASTEST]: {
      cost: 0.15,
      speed: 0.50,
      reliability: 0.20,
      slippage: 0.10,
      liquidity: 0.05,
    },
    [UserPreference.CHEAPEST]: {
      cost: 0.50,
      speed: 0.15,
      reliability: 0.20,
      slippage: 0.10,
      liquidity: 0.05,
    },
    [UserPreference.BALANCED]: {
      cost: 0.25,
      speed: 0.25,
      reliability: 0.30,
      slippage: 0.10,
      liquidity: 0.10,
    },
    [UserPreference.MOST_RELIABLE]: {
      cost: 0.15,
      speed: 0.15,
      reliability: 0.50,
      slippage: 0.10,
      liquidity: 0.10,
    },
  };

  /**
   * Get recommendations based on user preferences
   */
  recommend(request: RecommendationRequest): RecommendationResult[] {
    const { routes, preference, minReliability, maxFeeUsd, maxTimeSeconds } = request;

    // Validate input
    if (!routes || routes.length === 0) {
      this.logger.warn('No routes provided for recommendation');
      return [];
    }

    // Filter routes based on constraints
    let filteredRoutes = routes;

    if (minReliability !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.reliabilityScore >= minReliability);
    }

    if (maxFeeUsd !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.totalFeeUsd <= maxFeeUsd);
    }

    if (maxTimeSeconds !== undefined) {
      filteredRoutes = filteredRoutes.filter(r => r.estimatedTimeSeconds <= maxTimeSeconds);
    }

    if (filteredRoutes.length === 0) {
      this.logger.warn('No routes match the given constraints');
      return [];
    }

    // Get weights for preference
    const weights = this.WEIGHT_PROFILES[preference];

    // Calculate scores for each route
    const scored = filteredRoutes.map(route => {
      const scores = this.calculateScores(route, filteredRoutes);
      const score = this.computeWeightedScore(scores, weights);
      const confidence = this.calculateConfidence(route, filteredRoutes);
      const recommendation = this.generateRecommendation(route, preference, scores);

      return {
        route,
        score: parseFloat(score.toFixed(2)),
        rank: 0, // Will be set after sorting
        breakdown: scores,
        confidence,
        recommendation,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Assign ranks
    scored.forEach((result, index) => {
      result.rank = index + 1;
    });

    this.logger.log(
      `Generated ${scored.length} recommendations with preference: ${preference}`,
    );

    return scored;
  }

  /**
   * Normalize individual scores against the route set
   */
  private calculateScores(
    route: RouteInput,
    allRoutes: RouteInput[],
  ): {
    costScore: number;
    speedScore: number;
    reliabilityScore: number;
    slippageScore: number;
    liquidityScore: number;
  } {
    const maxFee = Math.max(...allRoutes.map(r => r.totalFeeUsd));
    const maxTime = Math.max(...allRoutes.map(r => r.estimatedTimeSeconds));
    const maxSlippage = Math.max(...allRoutes.map(r => r.slippagePercent));
    const maxLiquidity = Math.max(...allRoutes.map(r => r.liquidityUsd));

    // Cost score (lower fee = higher score)
    const costScore = maxFee > 0 ? (1 - route.totalFeeUsd / maxFee) * 100 : 100;

    // Speed score (lower time = higher score)
    const speedScore = maxTime > 0 ? (1 - route.estimatedTimeSeconds / maxTime) * 100 : 100;

    // Reliability score (already 0-100)
    const reliabilityScore = route.reliabilityScore;

    // Slippage score (lower slippage = higher score)
    const slippageScore = maxSlippage > 0 ? (1 - route.slippagePercent / maxSlippage) * 100 : 100;

    // Liquidity score (higher liquidity = higher score)
    const liquidityScore = maxLiquidity > 0 ? (route.liquidityUsd / maxLiquidity) * 100 : 50;

    return {
      costScore: parseFloat(costScore.toFixed(2)),
      speedScore: parseFloat(speedScore.toFixed(2)),
      reliabilityScore: parseFloat(reliabilityScore.toFixed(2)),
      slippageScore: parseFloat(slippageScore.toFixed(2)),
      liquidityScore: parseFloat(liquidityScore.toFixed(2)),
    };
  }

  /**
   * Compute weighted composite score
   */
  private computeWeightedScore(
    scores: {
      costScore: number;
      speedScore: number;
      reliabilityScore: number;
      slippageScore: number;
      liquidityScore: number;
    },
    weights: PreferenceWeights,
  ): number {
    const weightedSum =
      scores.costScore * weights.cost +
      scores.speedScore * weights.speed +
      scores.reliabilityScore * weights.reliability +
      scores.slippageScore * weights.slippage +
      scores.liquidityScore * weights.liquidity;

    return Math.min(100, Math.max(0, weightedSum));
  }

  /**
   * Calculate confidence level based on route metrics
   */
  private calculateConfidence(
    route: RouteInput,
    allRoutes: RouteInput[],
  ): 'high' | 'medium' | 'low' {
    const avgFee = allRoutes.reduce((sum, r) => sum + r.totalFeeUsd, 0) / allRoutes.length;
    const avgReliability = allRoutes.reduce((sum, r) => sum + r.reliabilityScore, 0) / allRoutes.length;

    // High confidence: below average fees and above average reliability
    if (route.totalFeeUsd <= avgFee * 1.1 && route.reliabilityScore >= avgReliability) {
      return 'high';
    }

    // Low confidence: significantly above average fees or below average reliability
    if (route.totalFeeUsd > avgFee * 1.5 || route.reliabilityScore < avgReliability * 0.7) {
      return 'low';
    }

    // Medium confidence: everything else
    return 'medium';
  }

  /**
   * Generate human-readable recommendation text
   */
  private generateRecommendation(
    route: RouteInput,
    preference: UserPreference,
    scores: any,
  ): string {
    switch (preference) {
      case UserPreference.FASTEST:
        return `⚡ Best speed: ${route.estimatedTimeSeconds}s estimated time with ${route.bridgeName}`;

      case UserPreference.CHEAPEST:
        return `💰 Most cost-effective: $${route.totalFeeUsd.toFixed(2)} total fees via ${route.bridgeName}`;

      case UserPreference.BALANCED:
        return `⚖️ Optimal balance of speed, cost, and reliability`;

      case UserPreference.MOST_RELIABLE:
        return `🛡️ Highest reliability: ${route.reliabilityScore}% success rate with ${route.bridgeName}`;

      default:
        return `Recommended route via ${route.bridgeName}`;
    }
  }

  /**
   * Get weight profile for a preference
   */
  getWeightProfile(preference: UserPreference): PreferenceWeights {
    return { ...this.WEIGHT_PROFILES[preference] };
  }

  /**
   * Create custom weight profile
   */
  createCustomWeights(weights: Partial<PreferenceWeights>): PreferenceWeights {
    const balanced = this.WEIGHT_PROFILES[UserPreference.BALANCED];
    const custom = { ...balanced, ...weights };

    // Normalize weights to sum to 1
    const sum = Object.values(custom).reduce((acc, val) => acc + val, 0);
    const entries = Object.entries(custom).map(([key, val]) => [key, parseFloat((val / sum).toFixed(2))]);

    return {
      cost: Number(entries.find(([k]) => k === 'cost')?.[1] || 0.25),
      speed: Number(entries.find(([k]) => k === 'speed')?.[1] || 0.25),
      reliability: Number(entries.find(([k]) => k === 'reliability')?.[1] || 0.30),
      slippage: Number(entries.find(([k]) => k === 'slippage')?.[1] || 0.10),
      liquidity: Number(entries.find(([k]) => k === 'liquidity')?.[1] || 0.10),
    };
  }

  /**
   * Compare routes across all preference profiles
   */
  compareAllPreferences(routes: RouteInput[]): {
    preference: UserPreference;
    bestRoute: RecommendationResult;
  }[] {
    const preferences = Object.values(UserPreference);

    return preferences.map(pref => {
      const results = this.recommend({ routes, preference: pref });
      return {
        preference: pref,
        bestRoute: results[0],
      };
    });
  }
}
