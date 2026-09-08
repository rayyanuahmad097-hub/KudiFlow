import {
  colorize,
  generateId,
  isLevelEnabled,
  levelColor,
  sanitize,
  shouldSample,
  toMB,
} from '../src/sdk-debug.utils';
import { REDACTED_PLACEHOLDER } from '../src/sdk-debug.constants';

describe('SdkDebugUtils', () => {
  // ---------------------------------------------------------------------------
  // sanitize()
  // ---------------------------------------------------------------------------
  describe('sanitize()', () => {
    it('returns primitives unchanged', () => {
      expect(sanitize(42)).toBe(42);
      expect(sanitize(true)).toBe(true);
      expect(sanitize(null)).toBeNull();
      expect(sanitize(undefined)).toBeUndefined();
    });

    it('truncates long strings', () => {
      const long = 'x'.repeat(3000);
      const result = sanitize(long, [], 8, 2048) as string;
      expect(result.length).toBeLessThan(3000);
      expect(result).toContain('[TRUNCATED]');
    });

    it('does not truncate short strings', () => {
      const short = 'hello world';
      expect(sanitize(short, [], 8, 2048)).toBe(short);
    });

    it('redacts top-level sensitive key', () => {
      const obj = { password: 'supersecret', name: 'Alice' };
      const result = sanitize(obj, ['password']) as Record<string, unknown>;
      expect(result.password).toBe(REDACTED_PLACEHOLDER);
      expect(result.name).toBe('Alice');
    });

    it('redacts nested sensitive keys', () => {
      const obj = { user: { token: 'abc123', id: 1 } };
      const result = sanitize(obj, ['token']) as {
        user: Record<string, unknown>;
      };
      expect(result.user.token).toBe(REDACTED_PLACEHOLDER);
      expect(result.user.id).toBe(1);
    });

    it('redacts case-insensitively', () => {
      const obj = { ApiKey: 'key-value' };
      const result = sanitize(obj, ['apikey']) as Record<string, unknown>;
      expect(result.ApiKey).toBe(REDACTED_PLACEHOLDER);
    });

    it('handles arrays recursively', () => {
      const arr = [{ secret: 'shh' }, { value: 1 }];
      const result = sanitize(arr, ['secret']) as Array<Record<string, unknown>>;
      expect(result[0].secret).toBe(REDACTED_PLACEHOLDER);
      expect(result[1].value).toBe(1);
    });

    it('stops at maxDepth and returns a placeholder', () => {
      // Build a deeply nested object
      let deep: Record<string, unknown> = { leaf: 'value' };
      for (let i = 0; i < 10; i++) deep = { child: deep };
      const result = sanitize(deep, [], 3) as Record<string, unknown>;
      // At depth 3 we should see the max depth placeholder somewhere
      const str = JSON.stringify(result);
      expect(str).toContain('MAX_DEPTH_REACHED');
    });

    it('serialises Error instances', () => {
      const err = new Error('boom');
      const result = sanitize(err) as Record<string, unknown>;
      expect(result.name).toBe('Error');
      expect(result.message).toBe('boom');
    });
  });

  // ---------------------------------------------------------------------------
  // generateId()
  // ---------------------------------------------------------------------------
  describe('generateId()', () => {
    it('returns a non-empty string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('includes the prefix when provided', () => {
      const id = generateId('trace');
      expect(id.startsWith('trace-')).toBe(true);
    });

    it('generates unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // toMB()
  // ---------------------------------------------------------------------------
  describe('toMB()', () => {
    it('converts bytes to MB with 2 decimal precision', () => {
      expect(toMB(1048576)).toBe(1); // 1 MB exactly
      expect(toMB(1572864)).toBe(1.5); // 1.5 MB
      expect(toMB(0)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // shouldSample()
  // ---------------------------------------------------------------------------
  describe('shouldSample()', () => {
    it('always returns true for rate = 1', () => {
      for (let i = 0; i < 50; i++) {
        expect(shouldSample(1)).toBe(true);
      }
    });

    it('always returns false for rate = 0', () => {
      for (let i = 0; i < 50; i++) {
        expect(shouldSample(0)).toBe(false);
      }
    });

    it('returns roughly correct ratio for rate = 0.5', () => {
      const results = Array.from({ length: 1000 }, () => shouldSample(0.5));
      const trueCount = results.filter(Boolean).length;
      // Allow ±15% variance
      expect(trueCount).toBeGreaterThan(350);
      expect(trueCount).toBeLessThan(650);
    });
  });

  // ---------------------------------------------------------------------------
  // isLevelEnabled()
  // ---------------------------------------------------------------------------
  describe('isLevelEnabled()', () => {
    it('returns true when entry level >= min level', () => {
      expect(isLevelEnabled('error', 'debug')).toBe(true);
      expect(isLevelEnabled('warn', 'warn')).toBe(true);
      expect(isLevelEnabled('info', 'info')).toBe(true);
    });

    it('returns false when entry level < min level', () => {
      expect(isLevelEnabled('debug', 'warn')).toBe(false);
      expect(isLevelEnabled('verbose', 'info')).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // colorize() / levelColor()
  // ---------------------------------------------------------------------------
  describe('colorize() and levelColor()', () => {
    it('wraps string with ANSI codes', () => {
      const result = colorize('hello', 'red');
      expect(result).toContain('hello');
      expect(result).toContain('\x1b[31m'); // red code
    });

    it('returns a known level color key', () => {
      const color = levelColor('error');
      expect(color).toBe('red');
      expect(levelColor('warn')).toBe('yellow');
      expect(levelColor('info')).toBe('green');
      expect(levelColor('debug')).toBe('cyan');
      expect(levelColor('verbose')).toBe('gray');
    });

    it('returns white for unknown level', () => {
      expect(levelColor('unknown-level')).toBe('white');
    });
  });
});
