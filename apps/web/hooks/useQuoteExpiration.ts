import { useState, useEffect, useCallback, useRef } from "react";

export interface UseQuoteExpirationOptions {
  expiresAt: string | number | Date | null;
  onExpire?: () => void;
  /** Poll interval in ms. Default 1000. */
  interval?: number;
}

export interface UseQuoteExpirationReturn {
  secondsLeft: number;
  isExpired: boolean;
  isWarning: boolean;   // <= 30s
  isCritical: boolean;  // <= 10s
  formattedTime: string;
  reset: (newExpiresAt: string | number | Date) => void;
}

function toMs(val: string | number | Date): number {
  return new Date(val).getTime();
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * useQuoteExpiration
 *
 * Tracks the remaining time for a quote and fires `onExpire` when time runs out.
 * Designed to integrate with KudiFlow quote API responses that include an
 * `expiresAt` field.
 *
 * @example
 * const { formattedTime, isCritical, isExpired } = useQuoteExpiration({
 *   expiresAt: quote.expiresAt,
 *   onExpire: () => refetchQuote(),
 * });
 */
export function useQuoteExpiration({
  expiresAt,
  onExpire,
  interval = 1000,
}: UseQuoteExpirationOptions): UseQuoteExpirationReturn {
  const [expiryMs, setExpiryMs] = useState<number | null>(
    expiresAt ? toMs(expiresAt) : null
  );

  const getSecondsLeft = useCallback((): number => {
    if (!expiryMs) return 0;
    return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
  }, [expiryMs]);

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Sync when expiresAt prop changes (new quote fetched)
  useEffect(() => {
    if (expiresAt) setExpiryMs(toMs(expiresAt));
  }, [expiresAt]);

  useEffect(() => {
    const s = getSecondsLeft();
    setSecondsLeft(s);
    if (s <= 0) {
      onExpireRef.current?.();
      return;
    }

    const id = setInterval(() => {
      const remaining = getSecondsLeft();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, interval);

    return () => clearInterval(id);
  }, [expiryMs, getSecondsLeft, interval]);

  const reset = useCallback((newExpiresAt: string | number | Date) => {
    setExpiryMs(toMs(newExpiresAt));
  }, []);

  return {
    secondsLeft,
    isExpired: secondsLeft <= 0,
    isWarning: secondsLeft > 0 && secondsLeft <= 30,
    isCritical: secondsLeft > 0 && secondsLeft <= 10,
    formattedTime: formatTime(secondsLeft),
    reset,
  };
}