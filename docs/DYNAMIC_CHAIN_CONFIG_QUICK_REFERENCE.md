# Dynamic Chain Config Management - Quick Reference

## 📋 Overview

Dynamic chain configuration system allowing chains to be configured through JSON files and environment variables instead of hardcoded values.

## 📁 Files Created/Modified

### New Files

**Configuration Schema:**
- `apps/api/src/config/chain-config-schema.ts` - Chain config schema and validation
- `apps/api/src/config/dynamic-chain-loader.ts` - Dynamic configuration loader

**Configuration Files:**
- `apps/api/src/config/chains-config/chains.config.json` - Base configuration
- `apps/api/src/config/chains-config/chains.config.development.json` - Dev config (with testnets)
- `apps/api/src/config/chains-config/chains.config.staging.json` - Staging config
- `apps/api/src/config/chains-config/chains.config.production.json` - Production config

**Shared Package:**
- `packages/config/package.json` - Package definition
- `packages/config/tsconfig.json` - TypeScript config
- `packages/config/README.md` - Package documentation
- `packages/config/.eslintrc.json` - ESLint config
- `packages/config/src/index.ts` - Main entry point
- `packages/config/src/chain-config-schema.ts` - Shared schema
- `packages/config/src/chain-config-manager.ts` - Configuration manager
- `packages/config/src/chain-registry.ts` - Chain registry
- `packages/config/src/chain-query.ts` - Query builder

**Documentation:**
- `docs/DYNAMIC_CHAIN_CONFIG_MANAGEMENT.md` - Full implementation guide
- `docs/DYNAMIC_CHAIN_CONFIG_QUICK_REFERENCE.md` - This file

### Modified Files

- `apps/api/src/config/chains.config.ts` - Refactored to use dynamic loader
- `.env.example` - Added dynamic chain config examples
- `.env.development` - Added dynamic chain config comments
- `.env.staging` - Added dynamic chain config comments
- `.env.production` - Added dynamic chain config comments

## 🚀 Key Features

✅ **Config-driven chains** - Load from JSON and environment
✅ **Dynamic loading** - Add/modify chains without code changes
✅ **Environment-specific** - Different configs per NODE_ENV
✅ **Runtime overrides** - Override via environment variables
✅ **Validation** - Automatic configuration validation
✅ **Type safety** - Full TypeScript support
✅ **Reusable** - Shared package for all apps

## 📝 Configuration Format

### JSON Format

```json
{
  "id": "ethereum",
  "name": "Ethereum",
  "symbol": "ETH",
  "chainId": 1,
  "rpcUrl": "https://eth.llamarpc.com",
  "explorerUrl": "https://etherscan.io",
  "type": "EVM",
  "isTestnet": false,
  "features": {
    "supportsBridging": true,
    "supportsQuotes": true,
    "nativeCurrencyDecimals": 18
  }
}
```

### Environment Variables

```bash
# Override RPC URL
CHAIN_ETHEREUM_RPC_URL=https://new-rpc.com

# Add new chain
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

## 💻 Usage Examples

### Load Chains

```typescript
import { getAllChains, getChainById } from '@/config/chains.config';
import { DynamicChainConfigLoader } from '@/config/dynamic-chain-loader';

// Get all chains
const chains = getAllChains();

// Get specific chain
const ethereum = getChainById('ethereum');

// Load with custom options
const mainnetOnly = DynamicChainConfigLoader.loadChains({
  includeTestnets: false,
});
```

### Use Configuration Manager

```typescript
import { ChainConfigManager } from '@kudiflow/config';

// Initialize
ChainConfigManager.initialize(chains);

// Query chains
const evmChains = ChainConfigManager.getChainsByType('EVM');
const bridgeable = ChainConfigManager.getBridgeableChains();
const ethereum = ChainConfigManager.getChainById('ethereum');
```

### Use Registry

```typescript
import { ChainRegistry } from '@kudiflow/config';

const registry = new ChainRegistry();
registry.registerBatch(chains);

// Find chains
const chain = registry.get('ethereum');
const allEvm = registry.getByType('EVM');

// Update chain
registry.update('ethereum', { rpcUrl: 'https://new-endpoint.com' });
```

### Query Builder

```typescript
import { createChainQuery } from '@kudiflow/config';

const result = createChainQuery(chains)
  .byType('EVM')
  .bridgeable(true)
  .testnet(false)
  .sortByName()
  .toResult();

console.log(`Found ${result.total} chains`);
```

## 🔧 Adding a New Chain

### Option 1: JSON Configuration

Edit `chains.config.json`:
```json
{
  "id": "avalanche",
  "name": "Avalanche",
  "symbol": "AVAX",
  "chainId": 43114,
  "rpcUrl": "https://api.avax.network/ext/bc/C/rpc",
  "explorerUrl": "https://snowtrace.io",
  "type": "EVM",
  "features": {
    "supportsBridging": true,
    "supportsQuotes": true,
    "nativeCurrencyDecimals": 18
  }
}
```

### Option 2: Environment Variables

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

### Option 3: Programmatic

```typescript
import { ChainRegistry } from '@kudiflow/config';

const registry = new ChainRegistry();
registry.register({
  id: 'avalanche',
  name: 'Avalanche',
  symbol: 'AVAX',
  chainId: 43114,
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  explorerUrl: 'https://snowtrace.io',
  type: 'EVM',
  features: {
    supportsBridging: true,
    supportsQuotes: true,
    nativeCurrencyDecimals: 18,
  },
});
```

## 📊 Configuration Loading Priority

For each NODE_ENV:

1. `chains.config.json` (base, always loaded)
2. `chains.config.{NODE_ENV}.json` (environment-specific)
3. Environment variables (CHAIN_* format, highest priority)

Later sources override earlier ones.

## ✅ Acceptance Criteria

✅ **Chains configurable** - Via JSON files and environment variables
✅ **Dynamic loading** - Load chains at runtime without restart
✅ **No hardcoding** - Removed hardcoded chain definitions
✅ **Environment-specific** - Different configs for dev/staging/prod
✅ **Backward compatible** - Existing code still works
✅ **Type safe** - Full TypeScript support
✅ **Validated** - Automatic schema validation
✅ **Documented** - Comprehensive documentation

## 🎯 Benefits

- **Scalability**: Add chains without code changes
- **Flexibility**: Different chains per environment
- **Maintainability**: Centralized chain definitions
- **Reusability**: Shared package for all apps
- **Extensibility**: Easy to add new chain types
- **Operations**: Override endpoints at runtime

## 📚 Documentation

- [Full Implementation Guide](DYNAMIC_CHAIN_CONFIG_MANAGEMENT.md)
- [Package README](../packages/config/README.md)
- [Chain Config Schema](../apps/api/src/config/chain-config-schema.ts)
- [Dynamic Loader ](../apps/api/src/config/dynamic-chain-loader.ts)

## 🔗 Key Classes/Functions

**Dynamic Loading:**
- `DynamicChainConfigLoader.loadChains()`
- `DynamicChainConfigLoader.getChainById()`
- `DynamicChainConfigLoader.generateEnvFormat()`

**Management:**
- `ChainConfigManager` - Singleton manager
- `ChainRegistry` - Validated registry
- `createChainQuery()` - Query builder

**Validation:**
- `validateChainConfig()`
- `isValidChainConfig()`

## ⚙️ Configuration Files Location

```
apps/api/src/config/chains-config/
├── chains.config.json                    # Base
├── chains.config.development.json        # Dev (+ testnets)
├── chains.config.staging.json           # Staging
└── chains.config.production.json        # Production
```

## 🚦 Environment Variables

### Format
```
CHAIN_<CHAIN_ID>_<PROPERTY>=<value>
```

### Properties
- `NAME` - Chain name
- `SYMBOL` - Native token symbol
- `CHAIN_ID` - Numeric chain ID
- `RPC_URL` - RPC endpoint
- `EXPLORER_URL` - Block explorer URL
- `TYPE` - Chain type (EVM, Stellar, etc)
- `IS_TESTNET` - true/false
- `SUPPORTS_BRIDGING` - true/false
- `SUPPORTS_QUOTES` - true/false
- `NATIVE_DECIMALS` - Token decimals

### Examples
```bash
# Override endpoint
CHAIN_ETHEREUM_RPC_URL=https://new-rpc.com

# Add new chain
CHAIN_AVALANCHE_NAME=Avalanche
CHAIN_AVALANCHE_SYMBOL=AVAX
CHAIN_AVALANCHE_CHAIN_ID=43114
...
```

## 🧪 Testing

```typescript
import { DynamicChainConfigLoader, getChainById } from '@/config';

// Test loading
const chains = DynamicChainConfigLoader.loadChains();
expect(chains.length).toBeGreaterThan(0);

// Test retrieval
const ethereum = getChainById('ethereum');
expect(ethereum).toBeDefined();
expect(ethereum?.type).toBe('EVM');
```

## 📖 See Also

- [MULTI_CHAIN_SUPPORT.md](MULTI_CHAIN_SUPPORT.md)
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
