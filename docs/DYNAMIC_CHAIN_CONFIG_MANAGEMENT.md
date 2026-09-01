# Dynamic Chain Config Management - Implementation Guide

## Overview

This document describes the implementation of dynamic chain configuration management for KudiFlow, which allows blockchain chains to be configured through files and environment variables instead of being hardcoded.

## Problem Solved

**Before**: Chain configurations were hardcoded in `src/config/chains.config.ts`, making it difficult to:
- Add or modify chains without code changes
- Use different chain sets per environment
- Dynamically override RPC endpoints
- Scale to support many chains

**After**: Chains are configurable through:
- JSON configuration files (environment-specific)
- Environment variables (runtime overrides)
- Programmatic registration

## Architecture

### Components

#### 1. **Chain Config Schema** (`chain-config-schema.ts`)
Defines the structure and validation rules for chain configurations.

**Key Types:**
- `ChainConfig`: Main chain configuration interface
- `ChainFeatures`: Features supported by a chain
- `ChainsConfiguration`: Collection of chains with metadata
- `ChainConfigOptions`: Options for loading chains

**Key Functions:**
- `validateChainConfig()`: Validates configuration structure
- `isValidChainConfig()`: Type guard for valid configs

#### 2. **Dynamic Chain Loader** (`dynamic-chain-loader.ts`)
Loads chain configurations from multiple sources with fallback and override support.

**Features:**
- Loads from JSON files (base + environment-specific)
- Loads from environment variables (CHAIN_* format)
- Merges configurations with environment overrides
- Caching for performance
- Environment-specific configuration loading

**Key Methods:**
- `loadChains()`: Load from all sources
- `getChainById()`: Get specific chain
- `getEVMChainByChainId()`: Get EVM chain by numeric ID
- `generateEnvFormat()`: Export chains as environment variables

#### 3. **Shared Config Package** (`packages/config/`)
Reusable configuration utilities for all packages.

**Exports:**
- `ChainConfigManager`: Configuration manager singleton
- `ChainRegistry`: Validated chain registry
- `createChainQuery()`: Query builder for chains
- Shared type definitions and validation

#### 4. **Updated chains.config.ts**
Refactored to use dynamic loader instead of hardcoded values.

## Configuration Files

### File Structure

```
apps/api/src/config/chains-config/
├── chains.config.json                    # Base configuration
├── chains.config.development.json        # Development overrides (with testnets)
├── chains.config.staging.json           # Staging overrides
└── chains.config.production.json        # Production overrides (mainnet only)
```

### Loading Priority

For each environment, configurations are loaded in order (later ones override):
1. `chains.config.json` (base)
2. `chains.config.{NODE_ENV}.json` (environment-specific)
3. Environment variables (highest priority)

## Environment Variable Format

### Override RPC Endpoints

```bash
CHAIN_<CHAIN_ID>_RPC_URL=<new_rpc_url>
CHAIN_<CHAIN_ID>_EXPLORER_URL=<new_explorer_url>
```

Example:
```bash
CHAIN_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
CHAIN_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### Add New Chains

```bash
CHAIN_<CHAIN_ID>_NAME=<chain_name>
CHAIN_<CHAIN_ID>_SYMBOL=<symbol>
CHAIN_<CHAIN_ID>_CHAIN_ID=<numeric_chain_id>
CHAIN_<CHAIN_ID>_RPC_URL=<rpc_url>
CHAIN_<CHAIN_ID>_EXPLORER_URL=<explorer_url>
CHAIN_<CHAIN_ID>_TYPE=<type>
CHAIN_<CHAIN_ID>_SUPPORTS_BRIDGING=<true|false>
CHAIN_<CHAIN_ID>_SUPPORTS_QUOTES=<true|false>
CHAIN_<CHAIN_ID>_NATIVE_DECIMALS=<decimals>
```

Example:
```bash
CHAIN_AVALANCHE_NAME=Avalanche
CHAIN_AVALANCHE_SYMBOL=AVAX
CHAIN_AVALANCHE_CHAIN_ID=43114
CHAIN_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
CHAIN_AVALANCHE_EXPLORER_URL=https://snowtrace.io
CHAIN_AVALANCHE_TYPE=EVM
CHAIN_AVALANCHE_SUPPORTS_BRIDGING=true
CHAIN_AVALANCHE_SUPPORTS_QUOTES=true
CHAIN_AVALANCHE_NATIVE_DECIMALS=18
```

## Usage Examples

### In API Services

```typescript
import { getAllChains, getChainById, getSupportedSourceChains } from './chains.config';

// Get all chains
const chains = getAllChains();

// Get specific chain
const ethereum = getChainById('ethereum');

// Get bridgeable chains
const bridgeable = getSupportedSourceChains();
```

### Using Configuration Manager

```typescript
import { ChainConfigManager } from '@kudiflow/config';

// Initialize with dynamically loaded chains
const chains = DynamicChainConfigLoader.loadChains();
ChainConfigManager.initialize(chains);

// Query chains
const evmChains = ChainConfigManager.getChainsByType('EVM');
const testnetChains = ChainConfigManager.getTestnetChains();
```

### Using Registry

```typescript
import { ChainRegistry } from '@kudiflow/config';

const registry = new ChainRegistry();
registry.registerBatch(chains);

// Update RPC URL at runtime
registry.update('ethereum', { rpcUrl: 'https://new-endpoint.com' });
```

### Using Query Builder

```typescript
import { createChainQuery } from '@kudiflow/config';

const result = createChainQuery(chains)
  .byType('EVM')
  .bridgeable(true)
  .testnet(false)
  .sortByName()
  .toResult();

console.log(`Found ${result.total} chains`);
console.log(`Applied filters: ${result.applied.join(', ')}`);
```

## Adding a New Chain

### Step 1: Add to Configuration File

Edit the appropriate JSON file (or create new environment-specific):

```json
{
  "id": "avalanche",
  "name": "Avalanche",
  "symbol": "AVAX",
  "chainId": 43114,
  "rpcUrl": "https://api.avax.network/ext/bc/C/rpc",
  "explorerUrl": "https://snowtrace.io",
  "type": "EVM",
  "nativeCurrency": {
    "name": "Avalanche",
    "symbol": "AVAX",
    "decimals": 18
  },
  "features": {
    "supportsBridging": true,
    "supportsQuotes": true,
    "nativeCurrencyDecimals": 18
  }
}
```

### Step 2: Test with Environment Variables

```bash
# Override in .env
CHAIN_AVALANCHE_NAME=Avalanche
CHAIN_AVALANCHE_SYMBOL=AVAX
CHAIN_AVALANCHE_CHAIN_ID=43114
CHAIN_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
CHAIN_AVALANCHE_EXPLORER_URL=https://snowtrace.io
CHAIN_AVALANCHE_TYPE=EVM
CHAIN_AVALANCHE_SUPPORTS_BRIDGING=true
CHAIN_AVALANCHE_SUPPORTS_QUOTES=true
CHAIN_AVALANCHE_NATIVE_DECIMALS=18
```

### Step 3: Verify

```typescript
import { getChainById } from './chains.config';

const avalanche = getChainById('avalanche');
console.log(avalanche); // Should show new chain
```

## Validation

All configurations are validated automatically:

```typescript
import { validateChainConfig } from '@kudiflow/config';

const result = validateChainConfig(chainData);
if (!result.valid) {
  console.error(result.errors);
}
```

Validation checks:
- Required fields present
- ID format valid (lowercase alphanumeric + hyphens)
- Numeric chain ID in valid range (0-2147483647)
- Type is one of: EVM, Stellar, Cosmos, Solana
- URL formats valid
- Native currency decimals in valid range (0-36)

## Performance Considerations

### Caching

Chains are cached after first load to avoid repeated file I/O:

```typescript
// First call: loads from files
const chains1 = DynamicChainConfigLoader.loadChains();

// Second call: returns cached result
const chains2 = DynamicChainConfigLoader.loadChains();

// Force reload
DynamicChainConfigLoader.clearCache();
const chains3 = DynamicChainConfigLoader.loadChains();
```

### Lazy Loading

Implement lazy loading in services:

```typescript
let chainCache: ChainConfig[] | null = null;

export function getChains() {
  if (!chainCache) {
    chainCache = DynamicChainConfigLoader.loadChains();
  }
  return chainCache;
}
```

## Migration Guide

If you have existing hardcoded chain configurations:

1. **Extract chains to JSON**:
   ```bash
   # Export current chains
   const chains = our existing hardcoded EVM_CHAINS;
   // Convert to chains.config.json format
   ```

2. **Update imports**:
   ```typescript
   // Old
   import { EVM_CHAINS, STELLAR_CONFIG } from './chains.config';

   // New
   import { getAllChains } from './chains.config';
   ```

3. **Update references**:
   ```typescript
   // Old
   const chain = EVM_CHAINS.ETHEREUM;

   // New
   const chain = getChainById('ethereum');
   ```

4. **Test thoroughly**:
   - Verify chains load correctly
   - Test environment variable overrides
   - Run existing tests

## Benefits

✅ **Scalability**: Add chains without code changes
✅ **Flexibility**: Different chain sets per environment
✅ **Runtime Configuration**: Override RPC endpoints at runtime
✅ **No Restarts Required**: Load new chains via environment variables
✅ **Maintainability**: Centralized chain definitions
✅ **Type Safety**: Full TypeScript support
✅ **Validation**: Automatic configuration validation
✅ **Reusability**: Shared package for all applications

## Troubleshooting

### Chains Not Loading

1. Check JSON file syntax:
   ```bash
   cat apps/api/src/config/chains-config/chains.config.json | jq
   ```

2. Verify NODE_ENV:
   ```bash
   echo $NODE_ENV
   ```

3. Check environment variable format:
   ```bash
   env | grep CHAIN_
   ```

### RPC URL Not Overriding

Ensure environment variable format is correct:
```bash
# Correct
CHAIN_ETHEREUM_RPC_URL=https://...

# Incorrect (won't work)
ETHEREUM_RPC_URL=https://...
CHAIN_ETHEREUM=https://...
```

### Validation Errors

Check error messages from loader:
```typescript
const chains = DynamicChainConfigLoader.loadChains({
  skipValidation: false, // Enable validation
});
```

## Future Enhancements

- [ ] Database-backed chain configuration
- [ ] Runtime API for managing chains
- [ ] Chain health monitoring
- [ ] RPC endpoint rotation/failover
- [ ] Fee estimation per chain
- [ ] Bridge compatibility matrix
- [ ] Chain metrics and analytics
- [ ] Hot reload without restart
