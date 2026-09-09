"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSlippageMonitor = useSlippageMonitor;
const react_1 = require("react");
const useSlippageAlert_1 = require("./useSlippageAlert");
/**
 * Wraps useSlippageAlert and continuously monitors a list of quotes,
 * triggering alerts whenever a quote's slippage exceeds the threshold.
 * Integrates with useBridgeQuotes() by accepting its output as `quotes`.
 */
function useSlippageMonitor({ quotes, config = {}, pollingIntervalMs = 10_000, }) {
    const { alerts, activeAlerts, isBlocked, highestSlippage, dismissAlert, dismissAll, checkSlippage, } = (0, useSlippageAlert_1.useSlippageAlert)(config);
    // Track last-checked quotes to avoid redundant checks
    const lastCheckedRef = (0, react_1.useRef)(new Map());
    const runChecks = (0, react_1.useRef)((currentQuotes) => {
        for (const quote of currentQuotes) {
            const key = `${quote.bridge}:${quote.sourceChain}:${quote.destinationChain}:${quote.token}`;
            const lastSlippage = lastCheckedRef.current.get(key);
            // Only re-check if slippage value changed
            if (lastSlippage !== quote.slippagePercent) {
                lastCheckedRef.current.set(key, quote.slippagePercent);
                checkSlippage(quote);
            }
        }
    });
    // Run on every quotes update
    (0, react_1.useEffect)(() => {
        runChecks.current(quotes);
    }, [quotes]);
    // Also run on a polling interval for long-lived quote streams
    (0, react_1.useEffect)(() => {
        if (pollingIntervalMs <= 0)
            return;
        const interval = setInterval(() => {
            runChecks.current(quotes);
        }, pollingIntervalMs);
        return () => clearInterval(interval);
    }, [quotes, pollingIntervalMs]);
    return {
        alerts,
        activeAlerts,
        isBlocked,
        highestSlippage,
        dismissAlert,
        dismissAll,
    };
}
//# sourceMappingURL=useSlippageMonitor.js.map