import { DEFAULT_SENSITIVE_KEYS, REDACTED_PLACEHOLDER } from './sdk-debug.constants';

/**
 * Deeply traverses an object and replaces values whose keys match
 * the sensitive-key list with REDACTED_PLACEHOLDER.
 */
export function sanitize(
  value: unknown,
  sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS,
  maxDepth = 8,
  maxStringLength = 2048,
  _depth = 0,
): unknown {
  if (_depth > maxDepth) return '[MAX_DEPTH_REACHED]';

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return value.length > maxStringLength
      ? value.slice(0, maxStringLength) + '…[TRUNCATED]'
      : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      sanitize(item, sensitiveKeys, maxDepth, maxStringLength, _depth + 1),
    );
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const isSensitive = sensitiveKeys.some(
        (sk) => k.toLowerCase() === sk.toLowerCase(),
      );
      result[k] = isSensitive
        ? REDACTED_PLACEHOLDER
        : sanitize(v, sensitiveKeys, maxDepth, maxStringLength, _depth + 1);
    }
    return result;
  }

  return value;
}

/**
 * Generates a lightweight random trace/request ID (no external deps).
 */
export function generateId(prefix = ''): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 9);
  return prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`;
}

/**
 * Formats bytes to a two-decimal MB string.
 */
export function toMB(bytes: number): number {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

/**
 * Colorize a string for terminal output.
 */
const COLORS: Record<string, string> = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

export function colorize(text: string, ...styles: string[]): string {
  const codes = styles.map((s) => COLORS[s] ?? '').join('');
  return `${codes}${text}${COLORS.reset}`;
}

const LEVEL_COLORS: Record<string, string> = {
  verbose: 'gray',
  debug: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red',
};

export function levelColor(level: string): string {
  return LEVEL_COLORS[level] ?? 'white';
}

/**
 * Determines whether a log entry should be sampled in (true = emit it).
 */
export function shouldSample(rate: number): boolean {
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}

const LEVEL_WEIGHT: Record<string, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

export function isLevelEnabled(
  entryLevel: string,
  minLevel: string,
): boolean {
  return (LEVEL_WEIGHT[entryLevel] ?? 0) >= (LEVEL_WEIGHT[minLevel] ?? 0);
}
