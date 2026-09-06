import { Injectable, Logger } from '@nestjs/common';

/**
 * Supported chain configurations with detailed metadata
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  symbol: string;
  isEVM: boolean;
  rpcUrl?: string;
  explorerUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Bridge provider compatibility configuration
 */
export interface BridgeCompatibility {
  bridgeName: string;
  supportedPairs: Array<[number, number]>; // [fromChainId, toChainId]
  isAvailable: boolean;
  maintenanceMode?: boolean;
}

/**
 * Error thrown when an invalid chain pair is provided for bridging.
 */
export class InvalidChainPairError extends Error {
  constructor(
    fromChainId: number | string,
    toChainId: number | string,
    public reason?: string,
  ) {
    super(`Invalid chain pair: ${fromChainId} -> ${toChainId}${reason ? ` (${reason})` : ''}`);
    this.name = 'InvalidChainPairError';
  }
}

/**
 * Validation result with detailed error information
 */
export interface ChainValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  supportedBridges: string[];
  alternativeRoutes?: Array<{ from: number | string; to: number | string; bridge: string }>;
}

/**
 * Enhanced validator for chain pairs in cross-chain transfers.
 * Validates chain support, bridge compatibility, and provides alternative route suggestions.
 */
@Injectable()
export class ChainValidator {
  private readonly logger = new Logger(ChainValidator.name);

  // Comprehensive chain registry with metadata
  private readonly chainRegistry: Map<number, ChainConfig> = new Map([
    [1, {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      isEVM: true,
      explorerUrl: 'https://etherscan.io',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    }],
    [137, {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      isEVM: true,
      explorerUrl: 'https://polygonscan.com',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    }],
    [56, {
      chainId: 56,
      name: 'BNB Smart Chain',
      symbol: 'BNB',
      isEVM: true,
      explorerUrl: 'https://bscscan.com',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    }],
    [42161, {
      chainId: 42161,
      name: 'Arbitrum One',
      symbol: 'ARB',
      isEVM: true,
      explorerUrl: 'https://arbiscan.io',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    }],
    [10, {
      chainId: 10,
      name: 'Optimism',
      symbol: 'OP',
      isEVM: true,
      explorerUrl: 'https://optimistic.etherscan.io',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    }],
    [8453, {
      chainId: 8453,
      name: 'Base',
      symbol: 'BASE',
      isEVM: true,
      explorerUrl: 'https://basescan.org',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    }],
    [43114, {
      chainId: 43114,
      name: 'Avalanche C-Chain',
      symbol: 'AVAX',
      isEVM: true,
      explorerUrl: 'https://snowtrace.io',
      nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    }],
    [100, {
      chainId: 100,
      name: 'Gnosis Chain',
      symbol: 'xDAI',
      isEVM: true,
      explorerUrl: 'https://gnosisscan.io',
      nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    }],
  ]);

  // Bridge compatibility matrix
  private readonly bridgeCompatibilities: BridgeCompatibility[] = [
    {
      bridgeName: 'Stargate',
      supportedPairs: [
        [1, 137], [1, 56], [1, 42161], [1, 10], [1, 8453], [1, 43114],
        [137, 1], [137, 56], [137, 42161], [137, 10], [137, 8453],
        [56, 1], [56, 137], [56, 42161], [56, 10], [56, 43114],
        [42161, 1], [42161, 137], [42161, 10], [42161, 8453],
        [10, 1], [10, 137], [10, 42161], [10, 8453],
        [8453, 1], [8453, 42161], [8453, 10],
        [43114, 1], [43114, 56],
      ],
      isAvailable: true,
    },
    {
      bridgeName: 'Hop Protocol',
      supportedPairs: [
        [1, 137], [1, 42161], [1, 10], [1, 8453], [1, 100],
        [137, 1], [137, 42161], [137, 10], [137, 8453],
        [42161, 1], [42161, 137], [42161, 10], [42161, 8453],
        [10, 1], [10, 137], [10, 42161], [10, 8453],
        [8453, 1], [8453, 137], [8453, 42161], [8453, 10],
      ],
      isAvailable: true,
    },
    {
      bridgeName: 'Across Protocol',
      supportedPairs: [
        [1, 137], [1, 42161], [1, 10], [1, 8453],
        [137, 1], [137, 42161], [137, 10],
        [42161, 1], [42161, 137], [42161, 10], [42161, 8453],
        [10, 1], [10, 137], [10, 42161], [10, 8453],
        [8453, 1], [8453, 42161], [8453, 10],
      ],
      isAvailable: true,
    },
    {
      bridgeName: 'Synapse',
      supportedPairs: [
        [1, 137], [1, 56], [1, 42161], [1, 10], [1, 43114],
        [137, 1], [137, 56], [137, 42161], [137, 10], [137, 43114],
        [56, 1], [56, 137], [56, 42161], [56, 43114],
        [42161, 1], [42161, 137], [42161, 10],
        [10, 1], [10, 137], [10, 42161],
        [43114, 1], [43114, 137], [43114, 56],
      ],
      isAvailable: true,
    },
  ];

  /**
   * Validate chain pair and return comprehensive validation result
   */
  validateChainPairComprehensive(
    fromChainId: number | string,
    toChainId: number | string,
  ): ChainValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Convert string chain IDs to numbers if needed
    const fromId = typeof fromChainId === 'string' ? parseInt(fromChainId) : fromChainId;
    const toId = typeof toChainId === 'string' ? parseInt(toChainId) : toChainId;

    // Check if chains exist in registry
    const fromChain = this.chainRegistry.get(fromId);
    const toChain = this.chainRegistry.get(toId);

    if (!fromChain) {
      errors.push(`Source chain ID ${fromChainId} is not supported`);
    }

    if (!toChain) {
      errors.push(`Destination chain ID ${toChainId} is not supported`);
    }

    // Check for same-chain transfer
    if (fromId === toId) {
      errors.push('Source and destination chains must be different');
    }

    // Find bridges that support this pair
    const supportedBridges = this.getSupportedBridgesForPair(fromId, toId);

    if (supportedBridges.length === 0 && errors.length === 0) {
      errors.push(`No bridge supports the route ${fromChain?.name || fromId} → ${toChain?.name || toId}`);
      
      // Suggest alternative routes
      const alternatives = this.findAlternativeRoutes(fromId, toId);
      if (alternatives.length > 0) {
        warnings.push('Consider these alternative routes');
      }

      return {
        isValid: false,
        errors,
        warnings,
        supportedBridges,
        alternativeRoutes: alternatives,
      };
    }

    // Check for bridge maintenance
    const maintenanceBridges = supportedBridges.filter(bridge => {
      const compat = this.bridgeCompatibilities.find(b => b.bridgeName === bridge);
      return compat?.maintenanceMode;
    });

    if (maintenanceBridges.length > 0) {
      warnings.push(`These bridges are in maintenance mode: ${maintenanceBridges.join(', ')}`);
    }

    // Log successful validation
    if (errors.length === 0) {
      this.logger.debug(
        `Chain pair validated: ${fromChain?.name} (${fromId}) → ${toChain?.name} (${toId}), ` +
        `Available bridges: ${supportedBridges.join(', ')}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      supportedBridges,
    };
  }

  /**
   * Get all bridges supporting a specific chain pair
   */
  getSupportedBridgesForPair(fromChainId: number, toChainId: number): string[] {
    return this.bridgeCompatibilities
      .filter(bridge => {
        if (!bridge.isAvailable) return false;
        return bridge.supportedPairs.some(
          ([from, to]) => from === fromChainId && to === toChainId,
        );
      })
      .map(bridge => bridge.bridgeName);
  }

  /**
   * Find alternative routes when direct route is not available
   */
  private findAlternativeRoutes(
    fromChainId: number,
    toChainId: number,
  ): Array<{ from: number; to: number; bridge: string }> {
    const alternatives: Array<{ from: number; to: number; bridge: string }> = [];

    // Check reverse route
    this.bridgeCompatibilities.forEach(bridge => {
      if (!bridge.isAvailable) return;

      const hasReverse = bridge.supportedPairs.some(
        ([from, to]) => from === toChainId && to === fromChainId,
      );

      if (hasReverse) {
        alternatives.push({
          from: toChainId,
          to: fromChainId,
          bridge: bridge.bridgeName,
        });
      }
    });

    return alternatives.slice(0, 3); // Return max 3 alternatives
  }

  /**
   * Validates that the given chain pair is supported for bridging.
   * @param fromChainId - The source chain ID
   * @param toChainId - The destination chain ID
   * @throws InvalidChainPairError if the chain pair is not supported
   */
  validateChainPair(fromChainId: number, toChainId: number): void {
    const result = this.validateChainPairComprehensive(fromChainId, toChainId);

    if (!result.isValid) {
      const reason = result.errors.join('; ');
      throw new InvalidChainPairError(fromChainId, toChainId, reason);
    }
  }

  /**
   * Checks if a chain ID is supported.
   * @param chainId - The chain ID to check
   * @returns true if the chain is supported, false otherwise
   */
  isChainSupported(chainId: number): boolean {
    return this.chainRegistry.has(chainId);
  }

  /**
   * Gets the list of supported chain IDs.
   * @returns An array of supported chain IDs
   */
  getSupportedChains(): number[] {
    return Array.from(this.chainRegistry.keys());
  }

  /**
   * Get chain configuration by ID
   */
  getChainConfig(chainId: number): ChainConfig | undefined {
    return this.chainRegistry.get(chainId);
  }

  /**
   * Get all available bridge providers
   */
  getAvailableBridges(): string[] {
    return this.bridgeCompatibilities
      .filter(b => b.isAvailable)
      .map(b => b.bridgeName);
  }

  /**
   * Update bridge availability status
   */
  setBridgeAvailability(bridgeName: string, isAvailable: boolean): void {
    const bridge = this.bridgeCompatibilities.find(b => b.bridgeName === bridgeName);
    if (bridge) {
      bridge.isAvailable = isAvailable;
      this.logger.log(`Bridge ${bridgeName} availability updated: ${isAvailable}`);
    }
  }

  /**
   * Set bridge maintenance mode
   */
  setBridgeMaintenance(bridgeName: string, maintenanceMode: boolean): void {
    const bridge = this.bridgeCompatibilities.find(b => b.bridgeName === bridgeName);
    if (bridge) {
      bridge.maintenanceMode = maintenanceMode;
      this.logger.log(`Bridge ${bridgeName} maintenance mode: ${maintenanceMode}`);
    }
  }
}
