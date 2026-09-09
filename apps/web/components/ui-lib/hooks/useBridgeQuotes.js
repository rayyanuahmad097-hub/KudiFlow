"use strict";
// packages/react/src/hooks/useBridgeQuotes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBridgeQuotes = useBridgeQuotes;
const react_1 = require("react");
const tokenValidation_1 = require("../../../../../../libs/ui-components/src/tokenValidation");
const core_1 = require("@kudiflow/core");
function useBridgeQuotes(options = {}) {
    const { initialParams, intervalMs = 15000, autoRefresh = true, maxRetries = 3, retryDelayMs = 1000, debounceMs = 300, ...callbacks } = options;
    const [params, setParams] = (0, react_1.useState)(initialParams);
    const [quotes, setQuotes] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastRefreshed, setLastRefreshed] = (0, react_1.useState)(null);
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
    const [retryCount, setRetryCount] = (0, react_1.useState)(0);
    const engineRef = (0, react_1.useRef)(null);
    const debounceTimerRef = (0, react_1.useRef)();
    const paramsRef = (0, react_1.useRef)(params);
    // Update params ref on change
    (0, react_1.useEffect)(() => {
        paramsRef.current = params;
    }, [params]);
    // Initialize refresh engine
    (0, react_1.useEffect)(() => {
        const fetchQuotes = async (fetchParams, options) => {
            // Token compatibility validation
            const validation = (0, tokenValidation_1.isTokenSupported)(fetchParams.sourceToken, fetchParams.sourceChain, fetchParams.destinationChain);
            if (!validation.isValid) {
                const error = new Error(validation.errors.join('; '));
                setError(error);
                throw error;
            }
            // Implement actual quote fetching logic here
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fetchParams),
                signal: options?.signal
            });
            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }
            return response.json();
        };
        engineRef.current = new core_1.QuoteRefreshEngine(fetchQuotes, {
            intervalMs,
            autoRefresh,
            maxRetries,
            retryDelayMs,
            onRefresh: (newQuotes) => {
                setQuotes(newQuotes);
                setLastRefreshed(new Date());
                callbacks.onRefresh?.(newQuotes);
            },
            onError: (err) => {
                setError(err);
                callbacks.onError?.(err);
            },
            onRefreshStart: () => {
                setIsRefreshing(true);
                callbacks.onRefreshStart?.();
            },
            onRefreshEnd: () => {
                setIsRefreshing(false);
                callbacks.onRefreshEnd?.();
            }
        });
        // Listen to state changes
        const handleStateChange = (state) => {
            setRetryCount(state.retryCount);
            setIsLoading(state.isRefreshing);
        };
        engineRef.current.on('state-change', handleStateChange);
        // Initialize with params if available
        if (params) {
            engineRef.current.initialize(params);
        }
        return () => {
            if (engineRef.current) {
                engineRef.current.destroy();
            }
        };
    }, []); // Empty dependency array - engine should only be created once
    // Handle parameter changes with debouncing
    const updateParams = (0, react_1.useCallback)((newParams) => {
        if (!paramsRef.current)
            return;
        const updatedParams = { ...paramsRef.current, ...newParams };
        // Debounce parameter updates to avoid too many refreshes
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setParams(updatedParams);
            if (engineRef.current) {
                engineRef.current.refresh({
                    type: 'parameter-change',
                    timestamp: Date.now(),
                    params: updatedParams
                }).catch((err) => {
                    console.error('Failed to refresh quotes after parameter change:', err);
                });
            }
        }, debounceMs);
    }, [debounceMs]);
    // Manual refresh function
    const refresh = (0, react_1.useCallback)(async () => {
        if (!engineRef.current) {
            throw new Error('Refresh engine not initialized');
        }
        try {
            setIsLoading(true);
            setError(null);
            const newQuotes = await engineRef.current.refresh({
                type: 'manual',
                timestamp: Date.now()
            });
            return newQuotes;
        }
        catch (err) {
            setError(err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Auto-refresh based on config changes
    (0, react_1.useEffect)(() => {
        if (engineRef.current) {
            engineRef.current.updateConfig({ autoRefresh });
            if (autoRefresh) {
                engineRef.current.startAutoRefresh();
            }
            else {
                engineRef.current.stopAutoRefresh();
            }
        }
    }, [autoRefresh]);
    // Update interval when changed
    (0, react_1.useEffect)(() => {
        if (engineRef.current) {
            engineRef.current.updateConfig({ intervalMs });
        }
    }, [intervalMs]);
    return {
        quotes,
        isLoading,
        error,
        lastRefreshed,
        isRefreshing,
        refresh,
        updateParams,
        retryCount
    };
}
//# sourceMappingURL=useBridgeQuotes.js.map