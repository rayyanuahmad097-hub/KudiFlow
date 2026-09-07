/**
 * KudiFlow SDK - Standardized Error Codes
 *
 * This module provides a unified error code system used consistently
 * across all SDK modules including adapters, validators, and executors.
 *
 * @module sdk-errors
 * @version 1.0.0
 */

// ============================================================================
// Error Code Enums
// ============================================================================

/**
 * SDK Error Categories
 * Top-level categorization for error codes
 */
export enum SDKErrorCategory {
  /** Network and connectivity errors */
  NETWORK = 'NETWORK',
  /** Validation and input errors */
  VALIDATION = 'VALIDATION',
  /** Transaction execution errors */
  TRANSACTION = 'TRANSACTION',
  /** Bridge and routing errors */
  BRIDGE = 'BRIDGE',
  /** Contract and blockchain errors */
  CONTRACT = 'CONTRACT',
  /** Authentication and authorization errors */
  AUTH = 'AUTH',
  /** Rate limiting and quota errors */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Configuration errors */
  CONFIG = 'CONFIG',
  /** Internal SDK errors */
  INTERNAL = 'INTERNAL',
}

/**
 * Unified SDK Error Codes
 *
 * All error codes follow the pattern: CATEGORY_SPECIFIC_ERROR
 * This ensures unique, descriptive, and consistent error identification.
 */
export enum SDKErrorCode {
  // ═══════════════════════════════════════════════════════════════════════════
  // Network Errors (1000-1999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Generic network error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Request timed out */
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  /** Connection refused */
  NETWORK_CONNECTION_REFUSED = 'NETWORK_CONNECTION_REFUSED',
  /** DNS resolution failed */
  NETWORK_DNS_FAILED = 'NETWORK_DNS_FAILED',
  /** SSL/TLS error */
  NETWORK_SSL_ERROR = 'NETWORK_SSL_ERROR',
  /** RPC endpoint unavailable */
  NETWORK_RPC_UNAVAILABLE = 'NETWORK_RPC_UNAVAILABLE',
  /** WebSocket connection failed */
  NETWORK_WEBSOCKET_FAILED = 'NETWORK_WEBSOCKET_FAILED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Validation Errors (2000-2999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Generic validation error */
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  /** Invalid address format */
  VALIDATION_INVALID_ADDRESS = 'VALIDATION_INVALID_ADDRESS',
  /** Invalid amount */
  VALIDATION_INVALID_AMOUNT = 'VALIDATION_INVALID_AMOUNT',
  /** Amount below minimum */
  VALIDATION_AMOUNT_TOO_LOW = 'VALIDATION_AMOUNT_TOO_LOW',
  /** Amount above maximum */
  VALIDATION_AMOUNT_TOO_HIGH = 'VALIDATION_AMOUNT_TOO_HIGH',
  /** Invalid chain identifier */
  VALIDATION_INVALID_CHAIN = 'VALIDATION_INVALID_CHAIN',
  /** Invalid token identifier */
  VALIDATION_INVALID_TOKEN = 'VALIDATION_INVALID_TOKEN',
  /** Missing required field */
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  /** Invalid request format */
  VALIDATION_INVALID_REQUEST = 'VALIDATION_INVALID_REQUEST',
  /** Slippage out of range */
  VALIDATION_INVALID_SLIPPAGE = 'VALIDATION_INVALID_SLIPPAGE',
  /** Invalid deadline */
  VALIDATION_INVALID_DEADLINE = 'VALIDATION_INVALID_DEADLINE',

  // ═══════════════════════════════════════════════════════════════════════════
  // Transaction Errors (3000-3999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Transaction failed */
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  /** Transaction rejected by user */
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  /** Transaction reverted */
  TRANSACTION_REVERTED = 'TRANSACTION_REVERTED',
  /** Insufficient gas */
  TRANSACTION_INSUFFICIENT_GAS = 'TRANSACTION_INSUFFICIENT_GAS',
  /** Gas estimation failed */
  TRANSACTION_GAS_ESTIMATION_FAILED = 'TRANSACTION_GAS_ESTIMATION_FAILED',
  /** Nonce too low */
  TRANSACTION_NONCE_TOO_LOW = 'TRANSACTION_NONCE_TOO_LOW',
  /** Nonce too high */
  TRANSACTION_NONCE_TOO_HIGH = 'TRANSACTION_NONCE_TOO_HIGH',
  /** Transaction underpriced */
  TRANSACTION_UNDERPRICED = 'TRANSACTION_UNDERPRICED',
  /** Transaction already known */
  TRANSACTION_ALREADY_KNOWN = 'TRANSACTION_ALREADY_KNOWN',
  /** Replacement transaction underpriced */
  TRANSACTION_REPLACEMENT_UNDERPRICED = 'TRANSACTION_REPLACEMENT_UNDERPRICED',
  /** Transaction pending timeout */
  TRANSACTION_PENDING_TIMEOUT = 'TRANSACTION_PENDING_TIMEOUT',
  /** Signature invalid */
  TRANSACTION_INVALID_SIGNATURE = 'TRANSACTION_INVALID_SIGNATURE',
  /** Sequence number mismatch (Stellar) */
  TRANSACTION_SEQUENCE_MISMATCH = 'TRANSACTION_SEQUENCE_MISMATCH',

  // ═══════════════════════════════════════════════════════════════════════════
  // Bridge Errors (4000-4999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Unsupported chain pair */
  BRIDGE_UNSUPPORTED_CHAIN_PAIR = 'BRIDGE_UNSUPPORTED_CHAIN_PAIR',
  /** Unsupported token */
  BRIDGE_UNSUPPORTED_TOKEN = 'BRIDGE_UNSUPPORTED_TOKEN',
  /** Unsupported token pair */
  BRIDGE_UNSUPPORTED_TOKEN_PAIR = 'BRIDGE_UNSUPPORTED_TOKEN_PAIR',
  /** Bridge not available */
  BRIDGE_NOT_AVAILABLE = 'BRIDGE_NOT_AVAILABLE',
  /** Bridge paused */
  BRIDGE_PAUSED = 'BRIDGE_PAUSED',
  /** Route not found */
  BRIDGE_ROUTE_NOT_FOUND = 'BRIDGE_ROUTE_NOT_FOUND',
  /** Insufficient liquidity */
  BRIDGE_INSUFFICIENT_LIQUIDITY = 'BRIDGE_INSUFFICIENT_LIQUIDITY',
  /** Quote expired */
  BRIDGE_QUOTE_EXPIRED = 'BRIDGE_QUOTE_EXPIRED',
  /** Slippage exceeded */
  BRIDGE_SLIPPAGE_EXCEEDED = 'BRIDGE_SLIPPAGE_EXCEEDED',
  /** All routes failed */
  BRIDGE_ALL_ROUTES_FAILED = 'BRIDGE_ALL_ROUTES_FAILED',
  /** Duplicate execution */
  BRIDGE_DUPLICATE_EXECUTION = 'BRIDGE_DUPLICATE_EXECUTION',
  /** Token mapping not found */
  BRIDGE_TOKEN_MAPPING_NOT_FOUND = 'BRIDGE_TOKEN_MAPPING_NOT_FOUND',
  /** Invalid token mapping */
  BRIDGE_INVALID_TOKEN_MAPPING = 'BRIDGE_INVALID_TOKEN_MAPPING',
  /** Fee estimation failed */
  BRIDGE_FEE_ESTIMATION_FAILED = 'BRIDGE_FEE_ESTIMATION_FAILED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Contract Errors (5000-5999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Contract not found */
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  /** Contract call failed */
  CONTRACT_CALL_FAILED = 'CONTRACT_CALL_FAILED',
  /** Contract invocation failed */
  CONTRACT_INVOCATION_FAILED = 'CONTRACT_INVOCATION_FAILED',
  /** Contract execution error */
  CONTRACT_EXECUTION_ERROR = 'CONTRACT_EXECUTION_ERROR',
  /** Insufficient allowance */
  CONTRACT_INSUFFICIENT_ALLOWANCE = 'CONTRACT_INSUFFICIENT_ALLOWANCE',
  /** Transfer failed */
  CONTRACT_TRANSFER_FAILED = 'CONTRACT_TRANSFER_FAILED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Account Errors (6000-6999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Account not found */
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  /** Insufficient balance */
  ACCOUNT_INSUFFICIENT_BALANCE = 'ACCOUNT_INSUFFICIENT_BALANCE',
  /** Account not activated */
  ACCOUNT_NOT_ACTIVATED = 'ACCOUNT_NOT_ACTIVATED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Authentication Errors (7000-7999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Authentication required */
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  /** Invalid credentials */
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  /** Token expired */
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  /** Unauthorized */
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  /** Wallet not connected */
  AUTH_WALLET_NOT_CONNECTED = 'AUTH_WALLET_NOT_CONNECTED',
  /** Signature required */
  AUTH_SIGNATURE_REQUIRED = 'AUTH_SIGNATURE_REQUIRED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Rate Limit Errors (8000-8999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** Quota exceeded */
  RATE_LIMIT_QUOTA_EXCEEDED = 'RATE_LIMIT_QUOTA_EXCEEDED',
  /** Too many requests */
  RATE_LIMIT_TOO_MANY_REQUESTS = 'RATE_LIMIT_TOO_MANY_REQUESTS',

  // ═══════════════════════════════════════════════════════════════════════════
  // Configuration Errors (9000-9999)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Invalid configuration */
  CONFIG_INVALID = 'CONFIG_INVALID',
  /** Missing configuration */
  CONFIG_MISSING = 'CONFIG_MISSING',
  /** Invalid endpoint */
  CONFIG_INVALID_ENDPOINT = 'CONFIG_INVALID_ENDPOINT',
  /** Missing API key */
  CONFIG_MISSING_API_KEY = 'CONFIG_MISSING_API_KEY',
  /** Adapter not initialized */
  CONFIG_NOT_INITIALIZED = 'CONFIG_NOT_INITIALIZED',

  // ═══════════════════════════════════════════════════════════════════════════
  // Internal Errors (10000+)
  // ═══════════════════════════════════════════════════════════════════════════
  /** Unknown error */
  INTERNAL_UNKNOWN = 'INTERNAL_UNKNOWN',
  /** Internal error */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Not implemented */
  INTERNAL_NOT_IMPLEMENTED = 'INTERNAL_NOT_IMPLEMENTED',
  /** Assertion failed */
  INTERNAL_ASSERTION_FAILED = 'INTERNAL_ASSERTION_FAILED',
}

// ============================================================================
// Error Metadata
// ============================================================================

/**
 * Error severity levels
 */
export enum SDKErrorSeverity {
  /** User-recoverable error */
  WARNING = 'warning',
  /** Non-recoverable but expected error */
  ERROR = 'error',
  /** Critical system error */
  CRITICAL = 'critical',
}

/**
 * Error metadata for each error code
 */
export interface SDKErrorMetadata {
  /** HTTP status code equivalent */
  httpStatus: number;
  /** Error category */
  category: SDKErrorCategory;
  /** Severity level */
  severity: SDKErrorSeverity;
  /** Whether this error is typically recoverable */
  recoverable: boolean;
  /** Suggested retry strategy */
  retryable: boolean;
  /** Default user-facing message */
  defaultMessage: string;
}

/**
 * Error metadata registry
 */
export const SDK_ERROR_METADATA: Record<SDKErrorCode, SDKErrorMetadata> = {
  // Network errors
  [SDKErrorCode.NETWORK_ERROR]: {
    httpStatus: 503,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'A network error occurred. Please check your connection.',
  },
  [SDKErrorCode.NETWORK_TIMEOUT]: {
    httpStatus: 504,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'The request timed out. Please try again.',
  },
  [SDKErrorCode.NETWORK_CONNECTION_REFUSED]: {
    httpStatus: 503,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Unable to connect to the server.',
  },
  [SDKErrorCode.NETWORK_DNS_FAILED]: {
    httpStatus: 503,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'DNS resolution failed.',
  },
  [SDKErrorCode.NETWORK_SSL_ERROR]: {
    httpStatus: 495,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.CRITICAL,
    recoverable: false,
    retryable: false,
    defaultMessage: 'SSL certificate error.',
  },
  [SDKErrorCode.NETWORK_RPC_UNAVAILABLE]: {
    httpStatus: 503,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'RPC endpoint is unavailable.',
  },
  [SDKErrorCode.NETWORK_WEBSOCKET_FAILED]: {
    httpStatus: 503,
    category: SDKErrorCategory.NETWORK,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'WebSocket connection failed.',
  },

  // Validation errors
  [SDKErrorCode.VALIDATION_FAILED]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Validation failed. Please check your input.',
  },
  [SDKErrorCode.VALIDATION_INVALID_ADDRESS]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid address format.',
  },
  [SDKErrorCode.VALIDATION_INVALID_AMOUNT]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid amount.',
  },
  [SDKErrorCode.VALIDATION_AMOUNT_TOO_LOW]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Amount is below the minimum required.',
  },
  [SDKErrorCode.VALIDATION_AMOUNT_TOO_HIGH]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Amount exceeds the maximum allowed.',
  },
  [SDKErrorCode.VALIDATION_INVALID_CHAIN]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid chain identifier.',
  },
  [SDKErrorCode.VALIDATION_INVALID_TOKEN]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid token identifier.',
  },
  [SDKErrorCode.VALIDATION_MISSING_FIELD]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Required field is missing.',
  },
  [SDKErrorCode.VALIDATION_INVALID_REQUEST]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid request format.',
  },
  [SDKErrorCode.VALIDATION_INVALID_SLIPPAGE]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Slippage value is out of range.',
  },
  [SDKErrorCode.VALIDATION_INVALID_DEADLINE]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid deadline.',
  },

  // Transaction errors
  [SDKErrorCode.TRANSACTION_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Transaction failed.',
  },
  [SDKErrorCode.TRANSACTION_REJECTED]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Transaction was rejected.',
  },
  [SDKErrorCode.TRANSACTION_REVERTED]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Transaction reverted.',
  },
  [SDKErrorCode.TRANSACTION_INSUFFICIENT_GAS]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Insufficient gas for transaction.',
  },
  [SDKErrorCode.TRANSACTION_GAS_ESTIMATION_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Gas estimation failed.',
  },
  [SDKErrorCode.TRANSACTION_NONCE_TOO_LOW]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Nonce too low.',
  },
  [SDKErrorCode.TRANSACTION_NONCE_TOO_HIGH]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Nonce too high.',
  },
  [SDKErrorCode.TRANSACTION_UNDERPRICED]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Transaction is underpriced.',
  },
  [SDKErrorCode.TRANSACTION_ALREADY_KNOWN]: {
    httpStatus: 409,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Transaction already submitted.',
  },
  [SDKErrorCode.TRANSACTION_REPLACEMENT_UNDERPRICED]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Replacement transaction is underpriced.',
  },
  [SDKErrorCode.TRANSACTION_PENDING_TIMEOUT]: {
    httpStatus: 504,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Transaction pending timeout.',
  },
  [SDKErrorCode.TRANSACTION_INVALID_SIGNATURE]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid transaction signature.',
  },
  [SDKErrorCode.TRANSACTION_SEQUENCE_MISMATCH]: {
    httpStatus: 400,
    category: SDKErrorCategory.TRANSACTION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Transaction sequence number mismatch.',
  },

  // Bridge errors
  [SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'This chain pair is not supported.',
  },
  [SDKErrorCode.BRIDGE_UNSUPPORTED_TOKEN]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'This token is not supported.',
  },
  [SDKErrorCode.BRIDGE_UNSUPPORTED_TOKEN_PAIR]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'This token pair is not supported.',
  },
  [SDKErrorCode.BRIDGE_NOT_AVAILABLE]: {
    httpStatus: 503,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Bridge is currently unavailable.',
  },
  [SDKErrorCode.BRIDGE_PAUSED]: {
    httpStatus: 503,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Bridge is temporarily paused.',
  },
  [SDKErrorCode.BRIDGE_ROUTE_NOT_FOUND]: {
    httpStatus: 404,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'No route found for this transfer.',
  },
  [SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Insufficient liquidity for this transfer.',
  },
  [SDKErrorCode.BRIDGE_QUOTE_EXPIRED]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Quote has expired. Please refresh.',
  },
  [SDKErrorCode.BRIDGE_SLIPPAGE_EXCEEDED]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Slippage tolerance exceeded.',
  },
  [SDKErrorCode.BRIDGE_ALL_ROUTES_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'All bridge routes failed.',
  },
  [SDKErrorCode.BRIDGE_DUPLICATE_EXECUTION]: {
    httpStatus: 409,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: false,
    retryable: false,
    defaultMessage: 'This route is already being executed.',
  },
  [SDKErrorCode.BRIDGE_TOKEN_MAPPING_NOT_FOUND]: {
    httpStatus: 404,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Token mapping not found.',
  },
  [SDKErrorCode.BRIDGE_INVALID_TOKEN_MAPPING]: {
    httpStatus: 400,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid token mapping configuration.',
  },
  [SDKErrorCode.BRIDGE_FEE_ESTIMATION_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.BRIDGE,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Fee estimation failed.',
  },

  // Contract errors
  [SDKErrorCode.CONTRACT_NOT_FOUND]: {
    httpStatus: 404,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Contract not found.',
  },
  [SDKErrorCode.CONTRACT_CALL_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Contract call failed.',
  },
  [SDKErrorCode.CONTRACT_INVOCATION_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Contract invocation failed.',
  },
  [SDKErrorCode.CONTRACT_EXECUTION_ERROR]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Contract execution error.',
  },
  [SDKErrorCode.CONTRACT_INSUFFICIENT_ALLOWANCE]: {
    httpStatus: 400,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Insufficient token allowance.',
  },
  [SDKErrorCode.CONTRACT_TRANSFER_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONTRACT,
    severity: SDKErrorSeverity.ERROR,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Token transfer failed.',
  },

  // Account errors
  [SDKErrorCode.ACCOUNT_NOT_FOUND]: {
    httpStatus: 404,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Account not found.',
  },
  [SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Insufficient balance.',
  },
  [SDKErrorCode.ACCOUNT_NOT_ACTIVATED]: {
    httpStatus: 400,
    category: SDKErrorCategory.VALIDATION,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Account is not activated.',
  },

  // Auth errors
  [SDKErrorCode.AUTH_REQUIRED]: {
    httpStatus: 401,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Authentication required.',
  },
  [SDKErrorCode.AUTH_INVALID_CREDENTIALS]: {
    httpStatus: 401,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Invalid credentials.',
  },
  [SDKErrorCode.AUTH_TOKEN_EXPIRED]: {
    httpStatus: 401,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Authentication token has expired.',
  },
  [SDKErrorCode.AUTH_UNAUTHORIZED]: {
    httpStatus: 403,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Unauthorized.',
  },
  [SDKErrorCode.AUTH_WALLET_NOT_CONNECTED]: {
    httpStatus: 401,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Wallet is not connected.',
  },
  [SDKErrorCode.AUTH_SIGNATURE_REQUIRED]: {
    httpStatus: 401,
    category: SDKErrorCategory.AUTH,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: false,
    defaultMessage: 'Signature is required.',
  },

  // Rate limit errors
  [SDKErrorCode.RATE_LIMIT_EXCEEDED]: {
    httpStatus: 429,
    category: SDKErrorCategory.RATE_LIMIT,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Rate limit exceeded. Please wait before retrying.',
  },
  [SDKErrorCode.RATE_LIMIT_QUOTA_EXCEEDED]: {
    httpStatus: 429,
    category: SDKErrorCategory.RATE_LIMIT,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Quota exceeded.',
  },
  [SDKErrorCode.RATE_LIMIT_TOO_MANY_REQUESTS]: {
    httpStatus: 429,
    category: SDKErrorCategory.RATE_LIMIT,
    severity: SDKErrorSeverity.WARNING,
    recoverable: true,
    retryable: true,
    defaultMessage: 'Too many requests. Please slow down.',
  },

  // Config errors
  [SDKErrorCode.CONFIG_INVALID]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONFIG,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Invalid configuration.',
  },
  [SDKErrorCode.CONFIG_MISSING]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONFIG,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Missing required configuration.',
  },
  [SDKErrorCode.CONFIG_INVALID_ENDPOINT]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONFIG,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Invalid endpoint configuration.',
  },
  [SDKErrorCode.CONFIG_MISSING_API_KEY]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONFIG,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'API key is missing.',
  },
  [SDKErrorCode.CONFIG_NOT_INITIALIZED]: {
    httpStatus: 500,
    category: SDKErrorCategory.CONFIG,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'SDK is not initialized.',
  },

  // Internal errors
  [SDKErrorCode.INTERNAL_UNKNOWN]: {
    httpStatus: 500,
    category: SDKErrorCategory.INTERNAL,
    severity: SDKErrorSeverity.CRITICAL,
    recoverable: false,
    retryable: false,
    defaultMessage: 'An unknown error occurred.',
  },
  [SDKErrorCode.INTERNAL_ERROR]: {
    httpStatus: 500,
    category: SDKErrorCategory.INTERNAL,
    severity: SDKErrorSeverity.CRITICAL,
    recoverable: false,
    retryable: false,
    defaultMessage: 'An internal error occurred.',
  },
  [SDKErrorCode.INTERNAL_NOT_IMPLEMENTED]: {
    httpStatus: 501,
    category: SDKErrorCategory.INTERNAL,
    severity: SDKErrorSeverity.ERROR,
    recoverable: false,
    retryable: false,
    defaultMessage: 'This feature is not implemented.',
  },
  [SDKErrorCode.INTERNAL_ASSERTION_FAILED]: {
    httpStatus: 500,
    category: SDKErrorCategory.INTERNAL,
    severity: SDKErrorSeverity.CRITICAL,
    recoverable: false,
    retryable: false,
    defaultMessage: 'Internal assertion failed.',
  },
};

// ============================================================================
// SDK Error Class
// ============================================================================

/**
 * Additional details for SDK errors
 */
export interface SDKErrorDetails {
  /** Original error that caused this error */
  cause?: unknown;
  /** Field that caused the error (for validation errors) */
  field?: string;
  /** Suggested action to resolve the error */
  suggestion?: string;
  /** Retry delay in milliseconds (for retryable errors) */
  retryAfter?: number;
  /** Additional context */
  [key: string]: unknown;
}

/**
 * Standard SDK Error class
 *
 * Use this class for all errors thrown by the SDK to ensure
 * consistent error handling across all modules.
 *
 * @example
 * ```typescript
 * throw new SDKError(
 *   SDKErrorCode.VALIDATION_INVALID_AMOUNT,
 *   'Amount must be greater than zero',
 *   { field: 'amount', value: -1 }
 * );
 * ```
 */
export class SDKError extends Error {
  /** Error code */
  readonly code: SDKErrorCode;
  /** Error category */
  readonly category: SDKErrorCategory;
  /** Error severity */
  readonly severity: SDKErrorSeverity;
  /** HTTP status code equivalent */
  readonly httpStatus: number;
  /** Whether this error is recoverable */
  readonly recoverable: boolean;
  /** Whether this error is retryable */
  readonly retryable: boolean;
  /** Additional error details */
  readonly details?: SDKErrorDetails;
  /** Error timestamp */
  readonly timestamp: number;

  constructor(
    code: SDKErrorCode,
    message?: string,
    details?: SDKErrorDetails
  ) {
    const metadata = SDK_ERROR_METADATA[code];
    super(message || metadata.defaultMessage);

    this.name = 'SDKError';
    this.code = code;
    this.category = metadata.category;
    this.severity = metadata.severity;
    this.httpStatus = metadata.httpStatus;
    this.recoverable = metadata.recoverable;
    this.retryable = metadata.retryable;
    this.details = details;
    this.timestamp = Date.now();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, SDKError.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SDKError);
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      httpStatus: this.httpStatus,
      recoverable: this.recoverable,
      retryable: this.retryable,
      details: this.details,
      timestamp: this.timestamp,
    };
  }

  /**
   * Create user-friendly error message
   */
  toUserMessage(): string {
    const metadata = SDK_ERROR_METADATA[this.code];
    let message = this.message || metadata.defaultMessage;

    if (this.details?.suggestion) {
      message += ` ${this.details.suggestion}`;
    }

    return message;
  }

  /**
   * Check if error is of a specific code
   */
  is(code: SDKErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if error is in a specific category
   */
  isCategory(category: SDKErrorCategory): boolean {
    return this.category === category;
  }
}

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Factory functions for creating common errors
 */
export const SDKErrors = {
  // Network errors
  networkError: (message?: string, details?: SDKErrorDetails) =>
    new SDKError(SDKErrorCode.NETWORK_ERROR, message, details),

  timeout: (operation?: string, timeoutMs?: number) =>
    new SDKError(
      SDKErrorCode.NETWORK_TIMEOUT,
      operation ? `${operation} timed out after ${timeoutMs}ms` : undefined,
      { operation, timeoutMs }
    ),

  // Validation errors
  invalidAddress: (address?: string) =>
    new SDKError(
      SDKErrorCode.VALIDATION_INVALID_ADDRESS,
      address ? `Invalid address: ${address}` : undefined,
      { field: 'address', value: address }
    ),

  invalidAmount: (amount?: string, reason?: string) =>
    new SDKError(
      SDKErrorCode.VALIDATION_INVALID_AMOUNT,
      reason || (amount ? `Invalid amount: ${amount}` : undefined),
      { field: 'amount', value: amount }
    ),

  amountTooLow: (amount: string, minimum: string) =>
    new SDKError(
      SDKErrorCode.VALIDATION_AMOUNT_TOO_LOW,
      `Amount ${amount} is below minimum ${minimum}`,
      { field: 'amount', value: amount, minimum }
    ),

  amountTooHigh: (amount: string, maximum: string) =>
    new SDKError(
      SDKErrorCode.VALIDATION_AMOUNT_TOO_HIGH,
      `Amount ${amount} exceeds maximum ${maximum}`,
      { field: 'amount', value: amount, maximum }
    ),

  missingField: (field: string) =>
    new SDKError(
      SDKErrorCode.VALIDATION_MISSING_FIELD,
      `Missing required field: ${field}`,
      { field }
    ),

  // Bridge errors
  unsupportedChainPair: (source: string, destination: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR,
      `Chain pair ${source} -> ${destination} is not supported`,
      { sourceChain: source, destinationChain: destination }
    ),

  unsupportedToken: (token: string, chain?: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_UNSUPPORTED_TOKEN,
      chain
        ? `Token ${token} is not supported on ${chain}`
        : `Token ${token} is not supported`,
      { token, chain }
    ),

  insufficientLiquidity: (token?: string, amount?: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
      token && amount
        ? `Insufficient liquidity for ${amount} ${token}`
        : undefined,
      { token, amount }
    ),

  routeNotFound: (source?: string, destination?: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_ROUTE_NOT_FOUND,
      source && destination
        ? `No route found for ${source} -> ${destination}`
        : undefined,
      { sourceChain: source, destinationChain: destination }
    ),

  quoteExpired: () =>
    new SDKError(SDKErrorCode.BRIDGE_QUOTE_EXPIRED),

  slippageExceeded: (expected?: string, actual?: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_SLIPPAGE_EXCEEDED,
      expected && actual
        ? `Slippage exceeded: expected ${expected}, got ${actual}`
        : undefined,
      { expected, actual }
    ),

  allRoutesFailed: (attemptCount?: number) =>
    new SDKError(
      SDKErrorCode.BRIDGE_ALL_ROUTES_FAILED,
      attemptCount
        ? `All ${attemptCount} routes failed`
        : undefined,
      { attemptCount }
    ),

  duplicateExecution: (routeId?: string) =>
    new SDKError(
      SDKErrorCode.BRIDGE_DUPLICATE_EXECUTION,
      routeId ? `Route ${routeId} is already being executed` : undefined,
      { routeId }
    ),

  // Transaction errors
  transactionFailed: (reason?: string, txHash?: string) =>
    new SDKError(
      SDKErrorCode.TRANSACTION_FAILED,
      reason,
      { txHash }
    ),

  transactionRejected: (reason?: string) =>
    new SDKError(SDKErrorCode.TRANSACTION_REJECTED, reason),

  insufficientGas: () =>
    new SDKError(SDKErrorCode.TRANSACTION_INSUFFICIENT_GAS),

  // Account errors
  insufficientBalance: (required?: string, available?: string) =>
    new SDKError(
      SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE,
      required && available
        ? `Insufficient balance: need ${required}, have ${available}`
        : undefined,
      { required, available }
    ),

  accountNotFound: (address?: string) =>
    new SDKError(
      SDKErrorCode.ACCOUNT_NOT_FOUND,
      address ? `Account not found: ${address}` : undefined,
      { address }
    ),

  // Auth errors
  walletNotConnected: () =>
    new SDKError(SDKErrorCode.AUTH_WALLET_NOT_CONNECTED),

  // Rate limit errors
  rateLimited: (retryAfter?: number) =>
    new SDKError(
      SDKErrorCode.RATE_LIMIT_EXCEEDED,
      retryAfter
        ? `Rate limit exceeded. Retry after ${retryAfter}ms`
        : undefined,
      { retryAfter }
    ),

  // Config errors
  notInitialized: (component?: string) =>
    new SDKError(
      SDKErrorCode.CONFIG_NOT_INITIALIZED,
      component ? `${component} is not initialized` : undefined,
      { component }
    ),

  invalidConfig: (field?: string, reason?: string) =>
    new SDKError(
      SDKErrorCode.CONFIG_INVALID,
      field ? `Invalid configuration for ${field}: ${reason}` : reason,
      { field }
    ),

  // Internal errors
  internal: (message?: string, cause?: unknown) =>
    new SDKError(
      SDKErrorCode.INTERNAL_ERROR,
      message,
      { cause }
    ),

  notImplemented: (feature?: string) =>
    new SDKError(
      SDKErrorCode.INTERNAL_NOT_IMPLEMENTED,
      feature ? `${feature} is not implemented` : undefined,
      { feature }
    ),
};

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Check if an error is an SDKError
 */
export function isSDKError(error: unknown): error is SDKError {
  return error instanceof SDKError;
}

/**
 * Check if an error is a specific SDKError code
 */
export function isSDKErrorCode(
  error: unknown,
  code: SDKErrorCode
): error is SDKError {
  return isSDKError(error) && error.code === code;
}

/**
 * Check if an error is in a specific category
 */
export function isSDKErrorCategory(
  error: unknown,
  category: SDKErrorCategory
): error is SDKError {
  return isSDKError(error) && error.category === category;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isSDKError(error)) {
    return error.retryable;
  }
  // Check for common retryable patterns in generic errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('429') ||
      message.includes('rate limit')
    );
  }
  return false;
}

// ============================================================================
// Error Conversion Utilities
// ============================================================================

/**
 * Convert any error to SDKError
 */
export function toSDKError(error: unknown): SDKError {
  if (isSDKError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Try to match error message to known patterns
    const code = matchErrorToCode(error.message);
    return new SDKError(code, error.message, { cause: error });
  }

  if (typeof error === 'string') {
    const code = matchErrorToCode(error);
    return new SDKError(code, error);
  }

  return new SDKError(
    SDKErrorCode.INTERNAL_UNKNOWN,
    'An unknown error occurred',
    { cause: error }
  );
}

/**
 * Match error message to error code
 */
function matchErrorToCode(message: string): SDKErrorCode {
  const lowerMessage = message.toLowerCase();

  // Network errors
  if (lowerMessage.includes('timeout')) return SDKErrorCode.NETWORK_TIMEOUT;
  if (lowerMessage.includes('econnrefused') || lowerMessage.includes('connection refused'))
    return SDKErrorCode.NETWORK_CONNECTION_REFUSED;
  if (lowerMessage.includes('network')) return SDKErrorCode.NETWORK_ERROR;

  // Rate limit
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('429') || lowerMessage.includes('too many'))
    return SDKErrorCode.RATE_LIMIT_EXCEEDED;

  // Validation
  if (lowerMessage.includes('invalid address')) return SDKErrorCode.VALIDATION_INVALID_ADDRESS;
  if (lowerMessage.includes('invalid amount')) return SDKErrorCode.VALIDATION_INVALID_AMOUNT;
  if (lowerMessage.includes('insufficient balance')) return SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE;

  // Transaction
  if (lowerMessage.includes('transaction failed')) return SDKErrorCode.TRANSACTION_FAILED;
  if (lowerMessage.includes('rejected')) return SDKErrorCode.TRANSACTION_REJECTED;
  if (lowerMessage.includes('insufficient gas')) return SDKErrorCode.TRANSACTION_INSUFFICIENT_GAS;

  // Bridge
  if (lowerMessage.includes('unsupported chain')) return SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR;
  if (lowerMessage.includes('insufficient liquidity')) return SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY;
  if (lowerMessage.includes('route not found') || lowerMessage.includes('no route'))
    return SDKErrorCode.BRIDGE_ROUTE_NOT_FOUND;

  // Contract
  if (lowerMessage.includes('contract not found')) return SDKErrorCode.CONTRACT_NOT_FOUND;
  if (lowerMessage.includes('contract') && lowerMessage.includes('failed'))
    return SDKErrorCode.CONTRACT_CALL_FAILED;

  return SDKErrorCode.INTERNAL_UNKNOWN;
}

// ============================================================================
// Legacy Error Code Mappings (for backward compatibility)
// ============================================================================

/**
 * Map legacy BridgeErrorCode to SDKErrorCode
 */
export const LEGACY_BRIDGE_ERROR_MAP: Record<string, SDKErrorCode> = {
  NETWORK_ERROR: SDKErrorCode.NETWORK_ERROR,
  RPC_TIMEOUT: SDKErrorCode.NETWORK_TIMEOUT,
  RPC_CONNECTION_FAILED: SDKErrorCode.NETWORK_CONNECTION_REFUSED,
  INVALID_CHAIN_PAIR: SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR,
  INVALID_AMOUNT: SDKErrorCode.VALIDATION_INVALID_AMOUNT,
  INVALID_ADDRESS: SDKErrorCode.VALIDATION_INVALID_ADDRESS,
  INVALID_TOKEN: SDKErrorCode.VALIDATION_INVALID_TOKEN,
  INSUFFICIENT_BALANCE: SDKErrorCode.ACCOUNT_INSUFFICIENT_BALANCE,
  ACCOUNT_NOT_FOUND: SDKErrorCode.ACCOUNT_NOT_FOUND,
  ACCOUNT_SEQUENCE_MISMATCH: SDKErrorCode.TRANSACTION_SEQUENCE_MISMATCH,
  TRANSACTION_FAILED: SDKErrorCode.TRANSACTION_FAILED,
  TRANSACTION_REJECTED: SDKErrorCode.TRANSACTION_REJECTED,
  INSUFFICIENT_GAS: SDKErrorCode.TRANSACTION_INSUFFICIENT_GAS,
  DUST_AMOUNT: SDKErrorCode.VALIDATION_AMOUNT_TOO_LOW,
  CONTRACT_ERROR: SDKErrorCode.CONTRACT_EXECUTION_ERROR,
  CONTRACT_NOT_FOUND: SDKErrorCode.CONTRACT_NOT_FOUND,
  CONTRACT_INVOCATION_FAILED: SDKErrorCode.CONTRACT_INVOCATION_FAILED,
  RATE_LIMIT_EXCEEDED: SDKErrorCode.RATE_LIMIT_EXCEEDED,
  QUOTA_EXCEEDED: SDKErrorCode.RATE_LIMIT_QUOTA_EXCEEDED,
  UNKNOWN_ERROR: SDKErrorCode.INTERNAL_UNKNOWN,
};

/**
 * Map legacy AdapterErrorCode to SDKErrorCode
 */
export const LEGACY_ADAPTER_ERROR_MAP: Record<string, SDKErrorCode> = {
  INVALID_CONFIG: SDKErrorCode.CONFIG_INVALID,
  MISSING_ENDPOINT: SDKErrorCode.CONFIG_INVALID_ENDPOINT,
  INVALID_AUTH: SDKErrorCode.AUTH_INVALID_CREDENTIALS,
  UNSUPPORTED_CHAIN_PAIR: SDKErrorCode.BRIDGE_UNSUPPORTED_CHAIN_PAIR,
  UNSUPPORTED_TOKEN: SDKErrorCode.BRIDGE_UNSUPPORTED_TOKEN,
  INVALID_CHAIN: SDKErrorCode.VALIDATION_INVALID_CHAIN,
  INVALID_TOKEN: SDKErrorCode.VALIDATION_INVALID_TOKEN,
  INVALID_REQUEST: SDKErrorCode.VALIDATION_INVALID_REQUEST,
  INVALID_AMOUNT: SDKErrorCode.VALIDATION_INVALID_AMOUNT,
  INSUFFICIENT_LIQUIDITY: SDKErrorCode.BRIDGE_INSUFFICIENT_LIQUIDITY,
  AMOUNT_OUT_OF_RANGE: SDKErrorCode.VALIDATION_AMOUNT_TOO_HIGH,
  API_ERROR: SDKErrorCode.NETWORK_ERROR,
  NETWORK_ERROR: SDKErrorCode.NETWORK_ERROR,
  TIMEOUT: SDKErrorCode.NETWORK_TIMEOUT,
  RATE_LIMITED: SDKErrorCode.RATE_LIMIT_EXCEEDED,
  TOKEN_MAPPING_NOT_FOUND: SDKErrorCode.BRIDGE_TOKEN_MAPPING_NOT_FOUND,
  INVALID_TOKEN_MAPPING: SDKErrorCode.BRIDGE_INVALID_TOKEN_MAPPING,
  FEE_ESTIMATION_FAILED: SDKErrorCode.BRIDGE_FEE_ESTIMATION_FAILED,
  NOT_INITIALIZED: SDKErrorCode.CONFIG_NOT_INITIALIZED,
  NOT_READY: SDKErrorCode.CONFIG_NOT_INITIALIZED,
  INTERNAL_ERROR: SDKErrorCode.INTERNAL_ERROR,
};

/**
 * Convert legacy error code to SDKErrorCode
 */
export function fromLegacyErrorCode(legacyCode: string): SDKErrorCode {
  return (
    LEGACY_BRIDGE_ERROR_MAP[legacyCode] ||
    LEGACY_ADAPTER_ERROR_MAP[legacyCode] ||
    SDKErrorCode.INTERNAL_UNKNOWN
  );
}
