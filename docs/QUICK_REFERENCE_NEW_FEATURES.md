# Quick Reference: New Features

## 1. Chain Validation 📍

**Purpose**: Prevent invalid chain pair selections

**File**: `src/validators/chain.validator.ts`

### Quick Usage

```typescript
// Inject the validator
constructor(private chainValidator: ChainValidator) {}

// Validate before bridge transaction
try {
  chainValidator.validateChainPair(1, 137); // ETH → Polygon
} catch (error) {
  console.error('Invalid route:', error.message);
}

// Get detailed validation result
const result = chainValidator.validateChainPairComprehensive(1, 137);
console.log(result.supportedBridges);
// ['Stargate', 'Hop Protocol', 'Across Protocol', 'Synapse']

// Check if chain exists
chainValidator.isChainSupported(1); // true

// Get available bridges
chainValidator.getAvailableBridges();
```

### Supported Chains
- Ethereum (1), Polygon (137), BSC (56)
- Arbitrum (42161), Optimism (10), Base (8453)
- Avalanche (43114), Gnosis (100)

---

## 2. Smart Route Recommendation 🧭

**Purpose**: Suggest best routes based on preferences

**Files**:
- Service: `apps/api/src/services/recommendation.ts`
- Controller: `apps/api/src/bridge-recommendation/recommendation.controller.ts`
- Hook: `apps/web/hooks/useRecommendation.ts`

### Quick Usage (Frontend)

```typescript
import { useRecommendation, UserPreference } from '@/hooks/useRecommendation';

const { recommendations, getRecommendations } = useRecommendation();

// Get fastest route
await getRecommendations(routes, UserPreference.FASTEST);

// Get cheapest route
await getRecommendations(routes, UserPreference.CHEAPEST);

// With constraints
await getRecommendations(routes, UserPreference.BALANCED, {
  maxFeeUsd: 10,
  minReliability: 80,
});
```

### Quick Usage (Backend)

```typescript
import { SmartRecommendationService, UserPreference } from '@/services/recommendation';

const results = recommendationService.recommend({
  routes,
  preference: UserPreference.FASTEST, // or CHEAPEST, BALANCED, MOST_RELIABLE
});

console.log(results[0].recommendation);
// "⚡ Best speed: 120s estimated time with Stargate"
```

### API Endpoint

```bash
POST /api/recommendations
{
  "routes": [...],
  "preference": "fastest"
}
```

---

## 3. Auto Refresh Rates 🔄

**Purpose**: Keep fees and speeds updated in real-time

**Files**:
- Service: `apps/api/src/services/refresh.ts`
- Component: `libs/ui-components/src/components/RefreshStatus.tsx`

### Quick Usage (Backend)

```typescript
import { AutoRefreshService, RefreshDataType } from '@/services/refresh';

// Set up data fetcher
refreshService.setFetcher(async (dataType) => {
  if (dataType === RefreshDataType.FEES) {
    return await fetchFees();
  }
});

// Start auto-refresh (every 15 seconds by default)
await refreshService.start(RefreshDataType.FEES);
await refreshService.start(RefreshDataType.QUOTES);

// Manual refresh
await refreshService.refresh(RefreshDataType.FEES);

// Update interval
refreshService.updateConfig(RefreshDataType.FEES, {
  intervalMs: 10000, // 10 seconds
});

// Pause/resume
refreshService.pause();
refreshService.resume();
```

### Quick Usage (Frontend)

```tsx
import RefreshStatus from '@kudiflow/ui/RefreshStatus';

<RefreshStatus
  lastRefreshed={lastRefreshed}
  isRefreshing={isRefreshing}
  intervalMs={15000}
  onRefresh={handleManualRefresh}
  showCountdown={true}
/>
```

### Default Intervals
- **Fees/Quotes**: 15 seconds
- **Speeds**: 30 seconds
- **Liquidity**: 1 minute
- **Reliability**: 5 minutes

---

## Integration Example

```typescript
// Complete flow combining all 3 features

class BridgeService {
  constructor(
    private chainValidator: ChainValidator,
    private recommendationService: SmartRecommendationService,
    private refreshService: AutoRefreshService,
  ) {}

  async findBestRoute(params: {
    fromChain: number;
    toChain: number;
    routes: RouteInput[];
    preference: UserPreference;
  }) {
    // 1. Validate chain pair
    const validation = this.chainValidator.validateChainPairComprehensive(
      params.fromChain,
      params.toChain,
    );

    if (!validation.isValid) {
      throw new Error(`Invalid route: ${validation.errors.join(', ')}`);
    }

    // 2. Get recommendations
    const recommendations = this.recommendationService.recommend({
      routes: params.routes,
      preference: params.preference,
    });

    return {
      validation,
      bestRoute: recommendations[0],
      alternatives: recommendations.slice(1, 3),
    };
  }

  // Start real-time updates
  startLiveUpdates() {
    this.refreshService.start(RefreshDataType.FEES);
    this.refreshService.start(RefreshDataType.QUOTES);
  }
}
```

---

## Testing Commands

```bash
# Run unit tests
npm test

# Test chain validation
npm test -- chain.validator.spec.ts

# Test recommendations
npm test -- recommendation.spec.ts

# Test auto-refresh
npm test -- refresh.spec.ts
```

---

## Common Issues

### Chain Validation
**Problem**: "Invalid chain pair" error
**Solution**: Check supported chains with `getSupportedChains()`

### Recommendations
**Problem**: No recommendations returned
**Solution**: Ensure routes have all required fields (fee, time, reliability)

### Auto Refresh
**Problem**: Data not refreshing
**Solution**: Check that `setFetcher()` is called before `start()`

---

## Need Help?

See full documentation: `docs/FEATURE_IMPLEMENTATION_SUMMARY.md`
