/**
 * Bridge Recommendation Controller
 * 
 * REST API endpoint for getting smart route recommendations based on user preferences.
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  SmartRecommendationService,
  RecommendationRequest,
  UserPreference,
  RecommendationResult,
} from '../services/recommendation';

/**
 * Request DTO for recommendation endpoint
 */
export class RecommendationRequestDto {
  sourceChain: string;
  destinationChain: string;
  token: string;
  amount: number;
  preference: UserPreference;
  routes: Array<{
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
  }>;
  minReliability?: number;
  maxFeeUsd?: number;
  maxTimeSeconds?: number;
}

/**
 * Response DTO for recommendation endpoint
 */
export class RecommendationResponseDto {
  success: boolean;
  count: number;
  recommendations: Array<{
    rank: number;
    bridge: string;
    score: number;
    confidence: string;
    recommendation: string;
    fee: number;
    time: number;
    reliability: number;
  }>;
}

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: SmartRecommendationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get smart bridge route recommendations',
    description: 'Returns ranked bridge routes based on user preferences (fastest, cheapest, balanced, or most reliable).',
  })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    type: RecommendationResponseDto,
  })
  async getRecommendations(
    @Body() request: RecommendationRequestDto,
  ): Promise<RecommendationResponseDto> {
    // Convert DTO to service request format
    const serviceRequest: RecommendationRequest = {
      routes: request.routes,
      preference: request.preference,
      minReliability: request.minReliability,
      maxFeeUsd: request.maxFeeUsd,
      maxTimeSeconds: request.maxTimeSeconds,
    };

    // Get recommendations
    const results = this.recommendationService.recommend(serviceRequest);

    // Format response
    return {
      success: true,
      count: results.length,
      recommendations: results.map(result => ({
        rank: result.rank,
        bridge: result.route.bridgeName,
        score: result.score,
        confidence: result.confidence,
        recommendation: result.recommendation,
        fee: result.route.totalFeeUsd,
        time: result.route.estimatedTimeSeconds,
        reliability: result.route.reliabilityScore,
      })),
    };
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare routes across all preferences',
    description: 'Returns the best route for each preference type (fastest, cheapest, balanced, most reliable).',
  })
  @ApiBody({ type: RecommendationRequestDto })
  async compareAllPreferences(
    @Body() request: RecommendationRequestDto,
  ): Promise<{
    success: boolean;
    comparisons: Array<{
      preference: UserPreference;
      bestRoute: any;
    }>;
  }> {
    const comparisons = this.recommendationService.compareAllPreferences(request.routes);

    return {
      success: true,
      comparisons,
    };
  }
}
