export const SDK_DEBUG_MODULE_OPTIONS = 'SDK_DEBUG_MODULE_OPTIONS';
export const SDK_DEBUG_LOGGER = 'SDK_DEBUG_LOGGER';

export const SDK_DEBUG_LOG_LEVELS = {
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export const SDK_DEBUG_EVENTS = {
  REQUEST_START: 'sdk.request.start',
  REQUEST_END: 'sdk.request.end',
  REQUEST_ERROR: 'sdk.request.error',
  AUTH_ATTEMPT: 'sdk.auth.attempt',
  AUTH_SUCCESS: 'sdk.auth.success',
  AUTH_FAILURE: 'sdk.auth.failure',
  RATE_LIMIT_HIT: 'sdk.rate_limit.hit',
  RETRY_ATTEMPT: 'sdk.retry.attempt',
  CACHE_HIT: 'sdk.cache.hit',
  CACHE_MISS: 'sdk.cache.miss',
  WEBHOOK_RECEIVED: 'sdk.webhook.received',
  CIRCUIT_OPEN: 'sdk.circuit.open',
  CIRCUIT_CLOSED: 'sdk.circuit.closed',
} as const;

export const SDK_DEBUG_TRANSPORT = {
  CONSOLE: 'console',
  FILE: 'file',
  HTTP: 'http',
  CUSTOM: 'custom',
} as const;

export const SDK_DEBUG_FORMAT = {
  JSON: 'json',
  PRETTY: 'pretty',
  COMPACT: 'compact',
} as const;

export const REDACTED_PLACEHOLDER = '[REDACTED]';

export const DEFAULT_SENSITIVE_KEYS = [
  'password',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'authorization',
  'Authorization',
  'x-api-key',
  'privateKey',
  'private_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'clientSecret',
  'client_secret',
  'passphrase',
  'mnemonic',
  'seed',
  'privateKeyBase58',
  'secretKeyBase64',
];

export const SDK_DEBUG_METADATA_KEY = 'sdk:debug';
export const SDK_DEBUG_TRACE_ID_HEADER = 'x-sdk-trace-id';
export const SDK_DEBUG_REQUEST_ID_HEADER = 'x-sdk-request-id';
