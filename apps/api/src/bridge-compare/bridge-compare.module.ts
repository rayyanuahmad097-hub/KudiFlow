import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BridgeCompareController } from './bridge-compare.controller';
import { BridgeCompareService } from './bridge-compare.service';
import { BridgeStatusService } from './bridge-status.service';
import { AggregationService } from './aggregation.service';
import { SlippageService } from './slippage.service';
import { ReliabilityService } from './reliability.service';
import { RankingService } from './ranking.service';
import { FailureRiskService } from './failure-risk.service';
import { QuoteCacheService } from './quote-cache.service';

@Module({
  imports: [HttpModule],
  controllers: [BridgeCompareController],
  providers: [
    BridgeCompareService,
    BridgeStatusService,
    AggregationService,
    SlippageService,
    ReliabilityService,
    RankingService,
    FailureRiskService,
    QuoteCacheService,
  ],
  exports: [BridgeCompareService, BridgeStatusService],
})
export class BridgeCompareModule {}

