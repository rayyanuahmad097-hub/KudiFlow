/**
 * @kudiflow/rules — Rule engine for relayer slashing risk and double-sign detection.
 *
 * @example
 * ```ts
 * import { DoubleSignChecker, SlashingMonitor } from '@kudiflow/rules';
 * import type { AttestationRecord, DoubleSignEvent } from '@kudiflow/rules';
 * ```
 */

export { DoubleSignChecker } from "./double-sign-checker";
export { SlashingMonitor } from "./slashing-monitor";
export type {
  AttestationRecord,
  AttestationVerdict,
  DoubleSignEvent,
  PreSignResult,
  SlashingMonitorOptions,
  SlashingRiskReport,
} from "./types";
