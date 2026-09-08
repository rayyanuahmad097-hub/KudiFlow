import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BridgeStatus } from '../enums';

export interface BridgeStatusInfo {
  bridgeId: string;
  name: string;
  status: BridgeStatus;
  uptime: number; // percentage 0-100
  lastUpdated: Date;
  lastDowntimeStart?: Date;
  lastDowntimeDuration?: number; // milliseconds
  errorMessage?: string;
}

export interface BridgeStatusMap {
  [bridgeId: string]: BridgeStatusInfo;
}

@Injectable()
export class BridgeStatusService {
  private readonly logger = new Logger(BridgeStatusService.name);
  private statusMap: BridgeStatusMap = {};
  private readonly statusCheckUrls: Map<string, string> = new Map([
    ['stargate', 'https://api.stargate.finance/route'],
    ['hop', 'https://api.hop.exchange/quote'],
    ['multichain', 'https://api.multichain.org/router'],
    ['axelar', 'https://api.axelarscan.io/status'],
    ['wormhole', 'https://api.wormholescan.io/api/v1/global-stats'],
    ['lifi', 'https://li.fi/health'],
    ['cbridge', 'https://cbridge-api.celer.network/v1/get_supported_token_list'],
    ['connext', 'https://api.connext.network/pools/'],
  ]);

  constructor(private readonly httpService: HttpService) {
    this.initializeStatusMap();
  }

  private initializeStatusMap(): void {
    for (const [bridgeId, url] of this.statusCheckUrls) {
      this.statusMap[bridgeId] = {
        bridgeId,
        name: this.formatBridgeName(bridgeId),
        status: BridgeStatus.ACTIVE,
        uptime: 100,
        lastUpdated: new Date(),
      };
    }
  }

  private formatBridgeName(bridgeId: string): string {
    const names: { [key: string]: string } = {
      stargate: 'Stargate',
      hop: 'Hop Protocol',
      multichain: 'Multichain',
      axelar: 'Axelar',
      wormhole: 'Wormhole',
      lifi: 'LiFi',
      cbridge: 'cBridge',
      connext: 'Connext',
    };
    return names[bridgeId] || bridgeId.charAt(0).toUpperCase() + bridgeId.slice(1);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAllBridgesStatus(): Promise<void> {
    this.logger.debug('Starting bridge status check');

    const statusChecks = Array.from(this.statusCheckUrls.entries()).map(
      ([bridgeId, url]) => this.checkBridgeStatus(bridgeId, url),
    );

    await Promise.allSettled(statusChecks);
  }

  private async checkBridgeStatus(bridgeId: string, statusUrl: string): Promise<void> {
    try {
      const timeout = 5000; // 5 second timeout
      const response = await firstValueFrom(
        this.httpService.get(statusUrl, { timeout }).pipe(),
      );

      const previousStatus = this.statusMap[bridgeId]?.status || BridgeStatus.ACTIVE;

      if (response.status === 200) {
        // Bridge is responding - check if it was previously offline
        if (previousStatus !== BridgeStatus.ACTIVE) {
          this.logger.log(`Bridge ${bridgeId} recovered - status now ACTIVE`);
        }

        this.statusMap[bridgeId] = {
          ...this.statusMap[bridgeId],
          status: BridgeStatus.ACTIVE,
          uptime: Math.min(100, (this.statusMap[bridgeId]?.uptime || 95) + 1),
          lastUpdated: new Date(),
          errorMessage: undefined,
        };
      } else {
        this.handleBridgeStatusChange(bridgeId, BridgeStatus.DEGRADED, 'Slow response');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Bridge ${bridgeId} status check failed: ${errorMessage}`);

      const previousStatus = this.statusMap[bridgeId]?.status || BridgeStatus.ACTIVE;

      if (previousStatus === BridgeStatus.ACTIVE) {
        // First failure - mark as degraded
        this.handleBridgeStatusChange(bridgeId, BridgeStatus.DEGRADED, errorMessage);
      } else if (previousStatus === BridgeStatus.DEGRADED) {
        // Second consecutive failure - mark as offline
        this.handleBridgeStatusChange(bridgeId, BridgeStatus.OFFLINE, errorMessage);
      } else {
        // Already offline, just update uptime
        this.statusMap[bridgeId] = {
          ...this.statusMap[bridgeId],
          uptime: Math.max(0, (this.statusMap[bridgeId]?.uptime || 50) - 2),
          lastUpdated: new Date(),
          errorMessage,
        };
      }
    }
  }

  private handleBridgeStatusChange(
    bridgeId: string,
    newStatus: BridgeStatus,
    errorMessage?: string,
  ): void {
    const currentInfo = this.statusMap[bridgeId];
    const wasOffline = currentInfo?.status === BridgeStatus.OFFLINE;
    const nowOffline = newStatus === BridgeStatus.OFFLINE;

    if (nowOffline && !wasOffline) {
      this.logger.warn(`Bridge ${bridgeId} went OFFLINE: ${errorMessage}`);
    }

    this.statusMap[bridgeId] = {
      ...currentInfo,
      status: newStatus,
      uptime: nowOffline ? Math.max(0, (currentInfo?.uptime || 50) - 5) : currentInfo?.uptime || 100,
      lastUpdated: new Date(),
      lastDowntimeStart: nowOffline ? new Date() : currentInfo?.lastDowntimeStart,
      errorMessage,
    };
  }

  getBridgeStatus(bridgeId: string): BridgeStatusInfo | undefined {
    return this.statusMap[bridgeId];
  }

  getAllBridgesStatus(): BridgeStatusInfo[] {
    return Object.values(this.statusMap);
  }

  getBridgesStatus(bridgeIds: string[]): BridgeStatusMap {
    const result: BridgeStatusMap = {};
    for (const id of bridgeIds) {
      if (this.statusMap[id]) {
        result[id] = this.statusMap[id];
      }
    }
    return result;
  }

  isOnline(bridgeId: string): boolean {
    const status = this.statusMap[bridgeId];
    return status?.status === BridgeStatus.ACTIVE || status?.status === BridgeStatus.DEGRADED;
  }

  isOffline(bridgeId: string): boolean {
    return this.statusMap[bridgeId]?.status === BridgeStatus.OFFLINE;
  }

  isDegraded(bridgeId: string): boolean {
    return this.statusMap[bridgeId]?.status === BridgeStatus.DEGRADED;
  }

  getOfflineBridges(): BridgeStatusInfo[] {
    return Object.values(this.statusMap).filter((info) => info.status === BridgeStatus.OFFLINE);
  }

  getAverageUptime(bridgeIds?: string[]): number {
    const bridges = bridgeIds
      ? bridgeIds.map((id) => this.statusMap[id]).filter(Boolean)
      : Object.values(this.statusMap);

    if (bridges.length === 0) return 100;

    const totalUptime = bridges.reduce((sum, info) => sum + info.uptime, 0);
    return totalUptime / bridges.length;
  }

  updateManualStatus(
    bridgeId: string,
    status: BridgeStatus,
    errorMessage?: string,
  ): BridgeStatusInfo {
    this.logger.log(`Manually updating bridge ${bridgeId} status to ${status}`);

    this.statusMap[bridgeId] = {
      ...this.statusMap[bridgeId],
      status,
      lastUpdated: new Date(),
      errorMessage,
    };

    return this.statusMap[bridgeId];
  }

  // Check if a bridge has been offline for a certain duration
  getDowntimeDuration(bridgeId: string): number | null {
    const info = this.statusMap[bridgeId];
    if (!info?.lastDowntimeStart) return null;

    const now = new Date();
    return now.getTime() - info.lastDowntimeStart.getTime();
  }
}
