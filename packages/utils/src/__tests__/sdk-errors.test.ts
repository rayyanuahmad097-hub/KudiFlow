/**
 * Tests for SDK Error Codes Standardization
 *
 * @module sdk-errors.test
 */

import { describe, it, expect } from 'vitest';
import {
  SDKError,
  SDKErrorCode,
  SDKErrorCategory,
  SDKErrorSeverity,
  SDKErrors,
  SDK_ERROR_METADATA,
  isSDKError,
  isSDKErrorCode,
  isSDKErrorCategory,
  isRetryableError,
  toSDKError,
  fromLegacyErrorCode,
  LEGACY_BRIDGE_ERROR_MAP,
  LEGACY_ADAPTER_ERROR_MAP,
} from '../sdk-errors';

describe('SDKError', () => {
  describe('constructor', () => {
    it('creates error with code and default message', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);

      expect(error.code).toBe(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.message).toBe('The request timed out. Please try again.');
      expect(error.category).toBe(SDKErrorCategory.NETWORK);
      expect(error.severity).toBe(SDKErrorSeverity.WARNING);
      expect(error.httpStatus).toBe(504);
      expect(error.recoverable).toBe(true);
      expect(error.retryable).toBe(true);
    });

    it('creates error with custom message', () => {
      const error = new SDKError(
        SDKErrorCode.VALIDATION_INVALID_AMOUNT,
        'Amount must be positive'
      );

      expect(error.code).toBe(SDKErrorCode.VALIDATION_INVALID_AMOUNT);
      expect(error.message).toBe('Amount must be positive');
    });

    it('creates error with details', () => {
      const error = new SDKError(
        SDKErrorCode.VALIDATION_INVALID_ADDRESS,
        'Invalid address',
        { field: 'recipient', value: '0xinvalid' }
      );

      expect(error.details).toEqual({
        field: 'recipient',
        value: '0xinvalid',
      });
    });

    it('sets timestamp', () => {
      const before = Date.now();
      const error = new SDKError(SDKErrorCode.INTERNAL_ERROR);
      const after = Date.now();

      expect(error.timestamp).toBeGreaterThanOrEqual(before);
      expect(error.timestamp).toBeLessThanOrEqual(after);
    });

    it('is instance of Error', () => {
      const error = new SDKError(SDKErrorCode.INTERNAL_ERROR);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SDKError);
      expect(error.name).toBe('SDKError');
    });
  });

  describe('toJSON', () => {
    it('serializes error to JSON', () => {
      const error = new SDKError(
        SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
        'Not enough liquidity',
        { token: 'USDC', amount: '1000' }
      );

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'SDKError',
        code: SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
        category: SDKErrorCategory.BRIDGE,
        severity: SDKErrorSeverity.WARNING,
        message: 'Not enough liquidity',
        httpStatus: 400,
        recoverable: true,
        retryable: true,
        details: { token: 'USDC', amount: '1000' },
        timestamp: expect.any(Number),
      });
    });
  });

  describe('toUserMessage', () => {
    it('returns message', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.toUserMessage()).toBe('The request timed out. Please try again.');
    });

    it('appends suggestion if present', () => {
      const error = new SDKError(
        SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE,
        'Insufficient balance',
        { suggestion: 'Please add more funds.' }
      );

      expect(error.toUserMessage()).toBe('Insufficient balance Please add more funds.');
    });
  });

  describe('is', () => {
    it('returns true for matching code', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.is(SDKErrorCode.NETWORK_TIMEOUT)).toBe(true);
    });

    it('returns false for non-matching code', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.is(SDKErrorCode.NETWORK_ERROR)).toBe(false);
    });
  });

  describe('isCategory', () => {
    it('returns true for matching category', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.isCategory(SDKErrorCategory.NETWORK)).toBe(true);
    });

    it('returns false for non-matching category', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(error.isCategory(SDKErrorCategory.VALIDATION)).toBe(false);
    });
  });
});

describe('SDKErrors factory', () => {
  it('creates network error', () => {
    const error = SDKErrors.networkError('Connection failed');
    expect(error.code).toBe(SDKErrorCode.NETWORK_ERROR);
    expect(error.message).toBe('Connection failed');
  });

  it('creates timeout error', () => {
    const error = SDKErrors.timeout('fetchRoutes', 5000);
    expect(error.code).toBe(SDKErrorCode.NETWORK_TIMEOUT);
    expect(error.message).toBe('fetchRoutes timed out after 5000ms');
    expect(error.details?.operation).toBe('fetchRoutes');
    expect(error.details?.timeoutMs).toBe(5000);
  });

  it('creates invalid address error', () => {
    const error = SDKErrors.invalidAddress('0xinvalid');
    expect(error.code).toBe(SDKErrorCode.VALIDATION_INVALID_ADDRESS);
    expect(error.message).toBe('Invalid address: 0xinvalid');
    expect(error.details?.field).toBe('address');
  });

  it('creates invalid amount error', () => {
    const error = SDKErrors.invalidAmount('-100', 'Amount must be positive');
    expect(error.code).toBe(SDKErrorCode.VALIDATION_INVALID_AMOUNT);
    expect(error.message).toBe('Amount must be positive');
  });

  it('creates amount too low error', () => {
    const error = SDKErrors.amountTooLow('0.01', '1.00');
    expect(error.code).toBe(SDKErrorCode.VALIDATION_AMOUNT_TOO_LOW);
    expect(error.message).toBe('Amount 0.01 is below minimum 1.00');
  });

  it('creates amount too high error', () => {
    const error = SDKErrors.amountTooHigh('1000000', '100000');
    expect(error.code).toBe(SDKErrorCode.VALIDATION_AMOUNT_TOO_HIGH);
    expect(error.message).toBe('Amount 1000000 exceeds maximum 100000');
  });

  it('creates missing field error', () => {
    const error = SDKErrors.missingField('sourceChain');
    expect(error.code).toBe(SDKErrorCode.VALIDATION_MISSING_FIELD);
    expect(error.message).toBe('Missing required field: sourceChain');
  });

  it('creates unsupported chain pair error', () => {
    const error = SDKErrors.unsupportedChainPair('ethereum', 'solana');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR);
    expect(error.message).toBe('Chain pair ethereum -> solana is not supported');
    expect(error.details?.sourceChain).toBe('ethereum');
    expect(error.details?.destinationChain).toBe('solana');
  });

  it('creates unsupported token error', () => {
    const error = SDKErrors.unsupportedToken('SHIB', 'stellar');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_UNSUPPORTED_TOKEN);
    expect(error.message).toBe('Token SHIB is not supported on stellar');
  });

  it('creates insufficient liquidity error', () => {
    const error = SDKErrors.insufficientLiquidity('USDC', '1000000');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY);
    expect(error.message).toBe('Insufficient liquidity for 1000000 USDC');
  });

  it('creates route not found error', () => {
    const error = SDKErrors.routeNotFound('ethereum', 'stellar');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_ROUTE_NOT_FOUND);
    expect(error.message).toBe('No route found for ethereum -> stellar');
  });

  it('creates quote expired error', () => {
    const error = SDKErrors.quoteExpired();
    expect(error.code).toBe(SDKErrorCode.BRIDGE_QUOTE_EXPIRED);
  });

  it('creates slippage exceeded error', () => {
    const error = SDKErrors.slippageExceeded('0.5%', '2.5%');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_SLIPPAGE_EXCEEDED);
    expect(error.message).toBe('Slippage exceeded: expected 0.5%, got 2.5%');
  });

  it('creates all routes failed error', () => {
    const error = SDKErrors.allRoutesFailed(3);
    expect(error.code).toBe(SDKErrorCode.BRIDGE_ALL_ROUTES_FAILED);
    expect(error.message).toBe('All 3 routes failed');
  });

  it('creates duplicate execution error', () => {
    const error = SDKErrors.duplicateExecution('route-123');
    expect(error.code).toBe(SDKErrorCode.BRIDGE_DUPLICATE_EXECUTION);
    expect(error.message).toBe('Route route-123 is already being executed');
  });

  it('creates transaction failed error', () => {
    const error = SDKErrors.transactionFailed('Out of gas', '0xabc');
    expect(error.code).toBe(SDKErrorCode.TRANSACTION_FAILED);
    expect(error.message).toBe('Out of gas');
    expect(error.details?.txHash).toBe('0xabc');
  });

  it('creates insufficient balance error', () => {
    const error = SDKErrors.insufficientBalance('100', '50');
    expect(error.code).toBe(SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE);
    expect(error.message).toBe('Insufficient balance: need 100, have 50');
  });

  it('creates wallet not connected error', () => {
    const error = SDKErrors.walletNotConnected();
    expect(error.code).toBe(SDKErrorCode.AUTH_WALLET_NOT_CONNECTED);
  });

  it('creates rate limited error', () => {
    const error = SDKErrors.rateLimited(60000);
    expect(error.code).toBe(SDKErrorCode.RATE_LIMIT_EXCEEDED);
    expect(error.message).toBe('Rate limit exceeded. Retry after 60000ms');
    expect(error.details?.retryAfter).toBe(60000);
  });

  it('creates not initialized error', () => {
    const error = SDKErrors.notInitialized('BridgeAggregator');
    expect(error.code).toBe(SDKErrorCode.CONFIG_NOT_INITIALIZED);
    expect(error.message).toBe('BridgeAggregator is not initialized');
  });

  it('creates internal error', () => {
    const cause = new Error('original');
    const error = SDKErrors.internal('Something went wrong', cause);
    expect(error.code).toBe(SDKErrorCode.INTERNAL_ERROR);
    expect(error.details?.cause).toBe(cause);
  });

  it('creates not implemented error', () => {
    const error = SDKErrors.notImplemented('multiHopRouting');
    expect(error.code).toBe(SDKErrorCode.INTERNAL_NOT_IMPLEMENTED);
    expect(error.message).toBe('multiHopRouting is not implemented');
  });
});

describe('Type Guards', () => {
  describe('isSDKError', () => {
    it('returns true for SDKError', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_ERROR);
      expect(isSDKError(error)).toBe(true);
    });

    it('returns false for regular Error', () => {
      const error = new Error('regular error');
      expect(isSDKError(error)).toBe(false);
    });

    it('returns false for non-error', () => {
      expect(isSDKError('string')).toBe(false);
      expect(isSDKError(null)).toBe(false);
      expect(isSDKError(undefined)).toBe(false);
      expect(isSDKError({})).toBe(false);
    });
  });

  describe('isSDKErrorCode', () => {
    it('returns true for matching code', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(isSDKErrorCode(error, SDKErrorCode.NETWORK_TIMEOUT)).toBe(true);
    });

    it('returns false for non-matching code', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(isSDKErrorCode(error, SDKErrorCode.NETWORK_ERROR)).toBe(false);
    });

    it('returns false for non-SDKError', () => {
      const error = new Error('regular error');
      expect(isSDKErrorCode(error, SDKErrorCode.NETWORK_ERROR)).toBe(false);
    });
  });

  describe('isSDKErrorCategory', () => {
    it('returns true for matching category', () => {
      const error = new SDKError(SDKErrorCode.VALIDATION_INVALID_AMOUNT);
      expect(isSDKErrorCategory(error, SDKErrorCategory.VALIDATION)).toBe(true);
    });

    it('returns false for non-matching category', () => {
      const error = new SDKError(SDKErrorCode.VALIDATION_INVALID_AMOUNT);
      expect(isSDKErrorCategory(error, SDKErrorCategory.NETWORK)).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('returns true for retryable SDKError', () => {
      const error = new SDKError(SDKErrorCode.NETWORK_TIMEOUT);
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for non-retryable SDKError', () => {
      const error = new SDKError(SDKErrorCode.VALIDATION_INVALID_ADDRESS);
      expect(isRetryableError(error)).toBe(false);
    });

    it('detects retryable patterns in regular errors', () => {
      expect(isRetryableError(new Error('timeout'))).toBe(true);
      expect(isRetryableError(new Error('network error'))).toBe(true);
      expect(isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
      expect(isRetryableError(new Error('429 Too Many Requests'))).toBe(true);
      expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
    });

    it('returns false for non-retryable regular errors', () => {
      expect(isRetryableError(new Error('invalid input'))).toBe(false);
    });
  });
});

describe('toSDKError', () => {
  it('returns same error if already SDKError', () => {
    const original = new SDKError(SDKErrorCode.NETWORK_ERROR);
    const converted = toSDKError(original);
    expect(converted).toBe(original);
  });

  it('converts Error to SDKError', () => {
    const original = new Error('Request timeout');
    const converted = toSDKError(original);

    expect(converted).toBeInstanceOf(SDKError);
    expect(converted.code).toBe(SDKErrorCode.NETWORK_TIMEOUT);
    expect(converted.message).toBe('Request timeout');
    expect(converted.details?.cause).toBe(original);
  });

  it('converts string to SDKError', () => {
    const converted = toSDKError('Invalid address provided');

    expect(converted).toBeInstanceOf(SDKError);
    expect(converted.code).toBe(SDKErrorCode.VALIDATION_INVALID_ADDRESS);
    expect(converted.message).toBe('Invalid address provided');
  });

  it('converts unknown to SDKError', () => {
    const converted = toSDKError({ foo: 'bar' });

    expect(converted).toBeInstanceOf(SDKError);
    expect(converted.code).toBe(SDKErrorCode.INTERNAL_UNKNOWN);
  });

  it('matches error patterns correctly', () => {
    expect(toSDKError(new Error('ECONNREFUSED')).code).toBe(
      SDKErrorCode.NETWORK_CONNECTION_REFUSED
    );
    expect(toSDKError(new Error('rate limit exceeded')).code).toBe(
      SDKErrorCode.RATE_LIMIT_EXCEEDED
    );
    expect(toSDKError(new Error('insufficient balance')).code).toBe(
      SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE
    );
    expect(toSDKError(new Error('transaction failed')).code).toBe(
      SDKErrorCode.TRANSACTION_FAILED
    );
    expect(toSDKError(new Error('unsupported chain')).code).toBe(
      SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR
    );
    expect(toSDKError(new Error('contract not found')).code).toBe(
      SDKErrorCode.CONTRACT_NOT_FOUND
    );
  });
});

describe('Legacy Error Mappings', () => {
  describe('fromLegacyErrorCode', () => {
    it('maps legacy BridgeErrorCode', () => {
      expect(fromLegacyErrorCode('NETWORK_ERROR')).toBe(SDKErrorCode.NETWORK_ERROR);
      expect(fromLegacyErrorCode('RPC_TIMEOUT')).toBe(SDKErrorCode.NETWORK_TIMEOUT);
      expect(fromLegacyErrorCode('INVALID_ADDRESS')).toBe(SDKErrorCode.VALIDATION_INVALID_ADDRESS);
      expect(fromLegacyErrorCode('INSUFFICIENT_BALANCE')).toBe(SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE);
      expect(fromLegacyErrorCode('TRANSACTION_FAILED')).toBe(SDKErrorCode.TRANSACTION_FAILED);
      expect(fromLegacyErrorCode('RATE_LIMIT_EXCEEDED')).toBe(SDKErrorCode.RATE_LIMIT_EXCEEDED);
    });

    it('maps legacy AdapterErrorCode', () => {
      expect(fromLegacyErrorCode('INVALID_CONFIG')).toBe(SDKErrorCode.CONFIG_INVALID);
      expect(fromLegacyErrorCode('UNSUPPORTED_CHAIN_PAIR')).toBe(SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR);
      expect(fromLegacyErrorCode('INSUFFICIENT_LIQUIDITY')).toBe(SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY);
      expect(fromLegacyErrorCode('TIMEOUT')).toBe(SDKErrorCode.NETWORK_TIMEOUT);
      expect(fromLegacyErrorCode('NOT_INITIALIZED')).toBe(SDKErrorCode.CONFIG_NOT_INITIALIZED);
    });

    it('returns INTERNAL_UNKNOWN for unknown codes', () => {
      expect(fromLegacyErrorCode('DOES_NOT_EXIST')).toBe(SDKErrorCode.INTERNAL_UNKNOWN);
    });
  });

  it('all legacy bridge codes are mapped', () => {
    const expectedCodes = [
      'NETWORK_ERROR',
      'RPC_TIMEOUT',
      'RPC_CONNECTION_FAILED',
      'INVALID_CHAIN_PAIR',
      'INVALID_AMOUNT',
      'INVALID_ADDRESS',
      'INVALID_TOKEN',
      'INSUFFICIENT_BALANCE',
      'ACCOUNT_NOT_FOUND',
      'ACCOUNT_SEQUENCE_MISMATCH',
      'TRANSACTION_FAILED',
      'TRANSACTION_REJECTED',
      'INSUFFICIENT_GAS',
      'DUST_AMOUNT',
      'CONTRACT_ERROR',
      'CONTRACT_NOT_FOUND',
      'CONTRACT_INVOCATION_FAILED',
      'RATE_LIMIT_EXCEEDED',
      'QUOTA_EXCEEDED',
      'UNKNOWN_ERROR',
    ];

    for (const code of expectedCodes) {
      expect(LEGACY_BRIDGE_ERROR_MAP[code]).toBeDefined();
    }
  });

  it('all legacy adapter codes are mapped', () => {
    const expectedCodes = [
      'INVALID_CONFIG',
      'MISSING_ENDPOINT',
      'INVALID_AUTH',
      'UNSUPPORTED_CHAIN_PAIR',
      'UNSUPPORTED_TOKEN',
      'INVALID_CHAIN',
      'INVALID_TOKEN',
      'INVALID_REQUEST',
      'INVALID_AMOUNT',
      'INSUFFICIENT_LIQUIDITY',
      'AMOUNT_OUT_OF_RANGE',
      'API_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT',
      'RATE_LIMITED',
      'TOKEN_MAPPING_NOT_FOUND',
      'INVALID_TOKEN_MAPPING',
      'FEE_ESTIMATION_FAILED',
      'NOT_INITIALIZED',
      'NOT_READY',
      'INTERNAL_ERROR',
    ];

    for (const code of expectedCodes) {
      expect(LEGACY_ADAPTER_ERROR_MAP[code]).toBeDefined();
    }
  });
});

describe('SDK_ERROR_METADATA', () => {
  it('has metadata for all error codes', () => {
    const allCodes = Object.values(SDKErrorCode);

    for (const code of allCodes) {
      expect(SDK_ERROR_METADATA[code]).toBeDefined();
      expect(SDK_ERROR_METADATA[code].httpStatus).toBeGreaterThanOrEqual(200);
      expect(SDK_ERROR_METADATA[code].httpStatus).toBeLessThan(600);
      expect(SDK_ERROR_METADATA[code].category).toBeDefined();
      expect(SDK_ERROR_METADATA[code].severity).toBeDefined();
      expect(typeof SDK_ERROR_METADATA[code].recoverable).toBe('boolean');
      expect(typeof SDK_ERROR_METADATA[code].retryable).toBe('boolean');
      expect(SDK_ERROR_METADATA[code].defaultMessage).toBeTruthy();
    }
  });

  it('validation errors have 400 status', () => {
    const validationCodes = Object.values(SDKErrorCode).filter(
      (code) => code.startsWith('VALIDATION_')
    );

    for (const code of validationCodes) {
      expect(SDK_ERROR_METADATA[code].httpStatus).toBe(400);
      expect(SDK_ERROR_METADATA[code].category).toBe(SDKErrorCategory.VALIDATION);
    }
  });

  it('rate limit errors have 429 status', () => {
    const rateLimitCodes = Object.values(SDKErrorCode).filter(
      (code) => code.startsWith('RATE_LIMIT_')
    );

    for (const code of rateLimitCodes) {
      expect(SDK_ERROR_METADATA[code].httpStatus).toBe(429);
      expect(SDK_ERROR_METADATA[code].category).toBe(SDKErrorCategory.RATE_LIMIT);
      expect(SDK_ERROR_METADATA[code].retryable).toBe(true);
    }
  });

  it('network errors are retryable', () => {
    const networkCodes = Object.values(SDKErrorCode).filter(
      (code) => code.startsWith('NETWORK_') && code !== 'NETWORK_SSL_ERROR'
    );

    for (const code of networkCodes) {
      expect(SDK_ERROR_METADATA[code].retryable).toBe(true);
      expect(SDK_ERROR_METADATA[code].category).toBe(SDKErrorCategory.NETWORK);
    }
  });
});
