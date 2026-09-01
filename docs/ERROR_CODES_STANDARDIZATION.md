# SDK Error Codes Standardization

> **Issue:** #125 - Implement Error Codes Standardization  
> **Status:** Implemented  
> **Category:** SDK, Reliability

## Overview

This module provides a unified error code system used consistently across all KudiFlow SDK modules including adapters, validators, executors, and UI components.

## Problem Solved

- ❌ **Before:** Inconsistent error messages across modules (`BridgeErrorCode`, `AdapterErrorCode`, `TokenPairErrorCode`)
- ✅ **After:** Single `SDKErrorCode` enum with consistent error handling

## Quick Start

```typescript
import {
  SDKError,
  SDKErrorCode,
  SDKErrors,
  isSDKError,
  isRetryableError,
  toSDKError,
} from '@kudiflow/bridge-core';

// Create errors using factory functions
throw SDKErrors.invalidAmount('100', 'Amount must be positive');

// Or use the SDKError class directly
throw new SDKError(
  SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
  'Not enough liquidity for this transfer',
  { token: 'USDC', amount: '1000000' }
);
```

## Error Code Categories

| Category | Code Range | Description |
|----------|------------|-------------|
| `NETWORK` | 1000-1999 | Network and connectivity errors |
| `VALIDATION` | 2000-2999 | Input validation errors |
| `TRANSACTION` | 3000-3999 | Transaction execution errors |
| `BRIDGE` | 4000-4999 | Bridge and routing errors |
| `CONTRACT` | 5000-5999 | Smart contract errors |
| `ACCOUNT` | 6000-6999 | Account-related errors |
| `AUTH` | 7000-7999 | Authentication errors |
| `RATE_LIMIT` | 8000-8999 | Rate limiting errors |
| `CONFIG` | 9000-9999 | Configuration errors |
| `INTERNAL` | 10000+ | Internal SDK errors |

## Error Codes Reference

### Network Errors

| Code | Description | Retryable |
|------|-------------|-----------|
| `NETWORK_ERROR` | Generic network error | ✅ |
| `NETWORK_TIMEOUT` | Request timed out | ✅ |
| `NETWORK_CONNECTION_REFUSED` | Connection refused | ✅ |
| `NETWORK_DNS_FAILED` | DNS resolution failed | ✅ |
| `NETWORK_SSL_ERROR` | SSL certificate error | ❌ |
| `NETWORK_RPC_UNAVAILABLE` | RPC endpoint unavailable | ✅ |
| `NETWORK_WEBSOCKET_FAILED` | WebSocket connection failed | ✅ |

### Validation Errors

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_FAILED` | Generic validation error | 400 |
| `VALIDATION_INVALID_ADDRESS` | Invalid address format | 400 |
| `VALIDATION_INVALID_AMOUNT` | Invalid amount | 400 |
| `VALIDATION_AMOUNT_TOO_LOW` | Below minimum | 400 |
| `VALIDATION_AMOUNT_TOO_HIGH` | Above maximum | 400 |
| `VALIDATION_INVALID_CHAIN` | Invalid chain ID | 400 |
| `VALIDATION_INVALID_TOKEN` | Invalid token ID | 400 |
| `VALIDATION_MISSING_FIELD` | Required field missing | 400 |
| `VALIDATION_INVALID_REQUEST` | Invalid request format | 400 |
| `VALIDATION_INVALID_SLIPPAGE` | Slippage out of range | 400 |
| `VALIDATION_INVALID_DEADLINE` | Invalid deadline | 400 |

### Transaction Errors

| Code | Description | Retryable |
|------|-------------|-----------|
| `TRANSACTION_FAILED` | Transaction failed | ✅ |
| `TRANSACTION_REJECTED` | Rejected by user | ❌ |
| `TRANSACTION_REVERTED` | Transaction reverted | ❌ |
| `TRANSACTION_INSUFFICIENT_GAS` | Not enough gas | ✅ |
| `TRANSACTION_GAS_ESTIMATION_FAILED` | Gas estimation failed | ✅ |
| `TRANSACTION_NONCE_TOO_LOW` | Nonce too low | ✅ |
| `TRANSACTION_NONCE_TOO_HIGH` | Nonce too high | ✅ |
| `TRANSACTION_UNDERPRICED` | Gas price too low | ✅ |
| `TRANSACTION_ALREADY_KNOWN` | Already submitted | ❌ |
| `TRANSACTION_PENDING_TIMEOUT` | Pending timeout | ✅ |
| `TRANSACTION_INVALID_SIGNATURE` | Invalid signature | ❌ |
| `TRANSACTION_SEQUENCE_MISMATCH` | Stellar sequence mismatch | ✅ |

### Bridge Errors

| Code | Description | Retryable |
|------|-------------|-----------|
| `BRIDGE_UNSUPPORTED_CHAIN_PAIR` | Chain pair not supported | ❌ |
| `BRIDGE_UNSUPPORTED_TOKEN` | Token not supported | ❌ |
| `BRIDGE_UNSUPPORTED_TOKEN_PAIR` | Token pair not supported | ❌ |
| `BRIDGE_NOT_AVAILABLE` | Bridge unavailable | ✅ |
| `BRIDGE_PAUSED` | Bridge paused | ✅ |
| `BRIDGE_ROUTE_NOT_FOUND` | No route found | ✅ |
| `BRIDGE_INSUFFICIENT_LIQUIDITY` | Not enough liquidity | ✅ |
| `BRIDGE_QUOTE_EXPIRED` | Quote expired | ✅ |
| `BRIDGE_SLIPPAGE_EXCEEDED` | Slippage exceeded | ✅ |
| `BRIDGE_ALL_ROUTES_FAILED` | All routes failed | ✅ |
| `BRIDGE_DUPLICATE_EXECUTION` | Already executing | ❌ |
| `BRIDGE_TOKEN_MAPPING_NOT_FOUND` | Token mapping missing | ❌ |
| `BRIDGE_FEE_ESTIMATION_FAILED` | Fee estimation failed | ✅ |

### Rate Limit Errors

| Code | Description | Retryable |
|------|-------------|-----------|
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | ✅ |
| `RATE_LIMIT_QUOTA_EXCEEDED` | Quota exceeded | ✅ |
| `RATE_LIMIT_TOO_MANY_REQUESTS` | Too many requests | ✅ |

## SDKError Class

```typescript
class SDKError extends Error {
  code: SDKErrorCode;          // Error code
  category: SDKErrorCategory;  // Error category
  severity: SDKErrorSeverity;  // warning | error | critical
  httpStatus: number;          // HTTP status equivalent
  recoverable: boolean;        // User can recover
  retryable: boolean;          // Can be retried
  details?: SDKErrorDetails;   // Additional context
  timestamp: number;           // When error occurred
}
```

### Methods

```typescript
// Serialize to JSON
error.toJSON(): Record<string, unknown>

// Get user-friendly message
error.toUserMessage(): string

// Check error code
error.is(SDKErrorCode.NETWORK_TIMEOUT): boolean

// Check category
error.isCategory(SDKErrorCategory.NETWORK): boolean
```

## Factory Functions

`SDKErrors` provides convenient factory functions:

```typescript
// Network
SDKErrors.networkError(message?, details?)
SDKErrors.timeout(operation?, timeoutMs?)

// Validation
SDKErrors.invalidAddress(address?)
SDKErrors.invalidAmount(amount?, reason?)
SDKErrors.amountTooLow(amount, minimum)
SDKErrors.amountTooHigh(amount, maximum)
SDKErrors.missingField(field)

// Bridge
SDKErrors.unsupportedChainPair(source, destination)
SDKErrors.unsupportedToken(token, chain?)
SDKErrors.insufficientLiquidity(token?, amount?)
SDKErrors.routeNotFound(source?, destination?)
SDKErrors.quoteExpired()
SDKErrors.slippageExceeded(expected?, actual?)
SDKErrors.allRoutesFailed(attemptCount?)
SDKErrors.duplicateExecution(routeId?)

// Transaction
SDKErrors.transactionFailed(reason?, txHash?)
SDKErrors.transactionRejected(reason?)
SDKErrors.insufficientGas()

// Account
SDKErrors.insufficientBalance(required?, available?)
SDKErrors.accountNotFound(address?)

// Auth
SDKErrors.walletNotConnected()

// Rate Limit
SDKErrors.rateLimited(retryAfter?)

// Config
SDKErrors.notInitialized(component?)
SDKErrors.invalidConfig(field?, reason?)

// Internal
SDKErrors.internal(message?, cause?)
SDKErrors.notImplemented(feature?)
```

## Type Guards

```typescript
import {
  isSDKError,
  isSDKErrorCode,
  isSDKErrorCategory,
  isRetryableError,
} from '@kudiflow/bridge-core';

try {
  await bridge.execute(route);
} catch (error) {
  if (isSDKError(error)) {
    console.log(`SDK Error: ${error.code}`);
    
    if (error.isCategory(SDKErrorCategory.NETWORK)) {
      // Handle network errors
    }
    
    if (isRetryableError(error)) {
      // Retry logic
      await retry(() => bridge.execute(route));
    }
  }
}
```

## Error Conversion

Convert any error to `SDKError`:

```typescript
import { toSDKError } from '@kudiflow/bridge-core';

try {
  await someOperation();
} catch (error) {
  const sdkError = toSDKError(error);
  // Now you have a standardized SDKError
  console.log(sdkError.code, sdkError.message);
}
```

## Legacy Error Migration

For backward compatibility, legacy error codes are mapped:

```typescript
import { fromLegacyErrorCode } from '@kudiflow/bridge-core';

// Convert legacy BridgeErrorCode or AdapterErrorCode
const newCode = fromLegacyErrorCode('RPC_TIMEOUT');
// Returns: SDKErrorCode.NETWORK_TIMEOUT
```

### Legacy Mapping Tables

| Legacy `BridgeErrorCode` | New `SDKErrorCode` |
|--------------------------|-------------------|
| `NETWORK_ERROR` | `NETWORK_ERROR` |
| `RPC_TIMEOUT` | `NETWORK_TIMEOUT` |
| `INVALID_ADDRESS` | `VALIDATION_INVALID_ADDRESS` |
| `INSUFFICIENT_BALANCE` | `ACCOUNT_INSUFFICIENT_BALANCE` |
| `TRANSACTION_FAILED` | `TRANSACTION_FAILED` |
| `RATE_LIMIT_EXCEEDED` | `RATE_LIMIT_EXCEEDED` |

| Legacy `AdapterErrorCode` | New `SDKErrorCode` |
|---------------------------|-------------------|
| `INVALID_CONFIG` | `CONFIG_INVALID` |
| `UNSUPPORTED_CHAIN_PAIR` | `BRIDGE_UNSUPPORTED_CHAIN_PAIR` |
| `INSUFFICIENT_LIQUIDITY` | `BRIDGE_INSUFFICIENT_LIQUIDITY` |
| `TIMEOUT` | `NETWORK_TIMEOUT` |
| `RATE_LIMITED` | `RATE_LIMIT_EXCEEDED` |

## Error Handling Best Practices

### 1. Use Specific Error Codes

```typescript
// ❌ Bad
throw new Error('Invalid input');

// ✅ Good
throw SDKErrors.invalidAmount(amount, 'Amount must be positive');
```

### 2. Include Context in Details

```typescript
throw new SDKError(
  SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
  'Not enough liquidity',
  {
    token: 'USDC',
    amount: '1000000',
    available: '500000',
    suggestion: 'Try a smaller amount or different route',
  }
);
```

### 3. Check Retryable Before Retrying

```typescript
if (isRetryableError(error)) {
  const delay = error.details?.retryAfter || 1000;
  await sleep(delay);
  return retry();
}
```

### 4. Use Categories for Broad Handling

```typescript
if (isSDKErrorCategory(error, SDKErrorCategory.NETWORK)) {
  showNetworkErrorUI();
} else if (isSDKErrorCategory(error, SDKErrorCategory.VALIDATION)) {
  showValidationErrorUI(error.details?.field);
}
```

## Files

| File | Description |
|------|-------------|
| `packages/utils/src/sdk-errors.ts` | Error codes, SDKError class, factories |
| `packages/utils/src/__tests__/sdk-errors.test.ts` | Test suite |
| `packages/utils/src/error-codes.ts` | Legacy error codes (preserved) |

## Related Documentation

- [API Errors](./API_ERRORS.md)
- [Fallback Bridge Routing](./FALLBACK_BRIDGE_ROUTING.md)
- [Network Timeout Handling](./NETWORK_TIMEOUT_HANDLING.md)
