"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSlippageAlert = useSlippageAlert;
const react_1 = require("react");
const DEFAULT_MAX_SLIPPAGE = 1; // 1%
const CRITICAL_MULTIPLIER = 2; // 2x threshold = critical
function generateId() {
    return `slippage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function resolveSeverity(slippage, threshold) {
    return slippage >= threshold * CRITICAL_MULTIPLIER ? 'critical' : 'warning';
}
function useSlippageAlert(config = {}) {
    const { maxSlippagePercent = DEFAULT_MAX_SLIPPAGE, notifyUser = true, blockOnExceed = false, onAlert, } = config;
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    // Keep onAlert stable across renders without triggering effects
    const onAlertRef = (0, react_1.useRef)(onAlert);
    onAlertRef.current = onAlert;
    const checkSlippage = (0, react_1.useCallback)((quote) => {
        if (quote.slippagePercent <= maxSlippagePercent)
            return null;
        const severity = resolveSeverity(quote.slippagePercent, maxSlippagePercent);
        const data = {
            bridge: quote.bridge,
            sourceChain: quote.sourceChain,
            destinationChain: quote.destinationChain,
            token: quote.token,
            slippage: quote.slippagePercent,
            threshold: maxSlippagePercent,
            severity,
            timestamp: new Date(),
        };
        const alert = {
            ...data,
            id: generateId(),
            dismissed: false,
        };
        if (notifyUser) {
            setAlerts((prev) => {
                // Avoid duplicate alerts for the same bridge within 5 seconds
                const recent = prev.find((a) => a.bridge === alert.bridge &&
                    a.sourceChain === alert.sourceChain &&
                    a.destinationChain === alert.destinationChain &&
                    !a.dismissed &&
                    Date.now() - a.timestamp.getTime() < 5000);
                if (recent)
                    return prev;
                return [...prev, alert];
            });
        }
        onAlertRef.current?.(data);
        return alert;
    }, [maxSlippagePercent, notifyUser]);
    const dismissAlert = (0, react_1.useCallback)((id) => {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
    }, []);
    const dismissAll = (0, react_1.useCallback)(() => {
        setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })));
    }, []);
    const activeAlerts = (0, react_1.useMemo)(() => alerts.filter((a) => !a.dismissed), [alerts]);
    const isBlocked = (0, react_1.useMemo)(() => blockOnExceed && activeAlerts.length > 0, [blockOnExceed, activeAlerts]);
    const highestSlippage = (0, react_1.useMemo)(() => {
        if (activeAlerts.length === 0)
            return null;
        return Math.max(...activeAlerts.map((a) => a.slippage));
    }, [activeAlerts]);
    return {
        alerts,
        activeAlerts,
        isBlocked,
        highestSlippage,
        dismissAlert,
        dismissAll,
        checkSlippage,
    };
}
//# sourceMappingURL=useSlippageAlert.js.map