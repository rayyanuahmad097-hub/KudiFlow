"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteRefreshEngine = void 0;
const events_1 = require("events");
class QuoteRefreshEngine extends events_1.EventEmitter {
    constructor(fetchQuotesFn, config = {}) {
        super();
        this.fetchQuotesFn = fetchQuotesFn;
        this.refreshInterval = null;
        this.state = {
            isRefreshing: false,
            lastRefreshed: null,
            error: null,
            retryCount: 0,
            quotes: []
        };
        this.abortController = null;
        this.refreshQueue = [];
        this.lastParams = {};
        // Default configuration
        this.config = {
            intervalMs: 15000,
            autoRefresh: true,
            maxRetries: 3,
            retryDelayMs: 1000,
            onRefresh: () => { },
            onError: () => { },
            onRefreshStart: () => { },
            onRefreshEnd: () => { },
            ...config
        };
    }
    /**
     * Initialize the refresh engine with parameters
     */
    initialize(params) {
        this.lastParams = params;
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        }
    }
    /**
     * Start auto-refresh interval
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => {
            this.refresh({
                type: 'interval',
                timestamp: Date.now()
            });
        }, this.config.intervalMs);
        // Trigger immediate first refresh
        this.refresh({
            type: 'interval',
            timestamp: Date.now()
        });
    }
    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    /**
     * Manual refresh trigger
     */
    async refresh(trigger) {
        // Debounce: if already refreshing, queue this refresh
        if (this.state.isRefreshing) {
            return new Promise((resolve) => {
                this.once('refresh-complete', (quotes) => {
                    resolve(quotes);
                });
            });
        }
        // Check if parameters changed significantly (avoid unnecessary refreshes)
        if (trigger.type === 'parameter-change' && !this.hasSignificantChange(trigger.params)) {
            return this.state.quotes;
        }
        this.abortController = new AbortController();
        try {
            this.setState({
                ...this.state,
                isRefreshing: true,
                error: null
            });
            this.config.onRefreshStart();
            this.emit('refresh-start');
            // Fetch quotes with retry logic
            const quotes = await this.fetchWithRetry(trigger);
            this.setState({
                ...this.state,
                isRefreshing: false,
                lastRefreshed: new Date(),
                error: null,
                retryCount: 0,
                quotes
            });
            this.config.onRefresh(quotes);
            this.emit('refresh-complete', quotes);
            return quotes;
        }
        catch (error) {
            this.setState({
                ...this.state,
                isRefreshing: false,
                error: error
            });
            this.config.onError(error);
            this.emit('refresh-error', error);
            throw error;
        }
        finally {
            this.config.onRefreshEnd();
            this.emit('refresh-end');
            this.abortController = null;
        }
    }
    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(trigger) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                // Update parameters if this is a parameter change trigger
                const params = trigger.type === 'parameter-change'
                    ? { ...this.lastParams, ...trigger.params }
                    : this.lastParams;
                const quotes = await this.fetchQuotesFn(params, {
                    signal: this.abortController?.signal
                });
                // Validate quotes
                this.validateQuotes(quotes);
                return quotes;
            }
            catch (error) {
                lastError = error;
                if (attempt < this.config.maxRetries) {
                    // Exponential backoff
                    const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    this.setState({
                        ...this.state,
                        retryCount: attempt
                    });
                    this.emit('retry-attempt', { attempt, error });
                }
            }
        }
        throw lastError || new Error('Failed to fetch quotes after retries');
    }
    /**
     * Check if parameters changed significantly
     */
    hasSignificantChange(newParams) {
        if (!newParams)
            return false;
        const significantParams = ['amount', 'sourceChain', 'destinationChain', 'sourceToken', 'destinationToken'];
        for (const param of significantParams) {
            if (this.lastParams[param] !== newParams[param]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Validate quotes data structure
     */
    validateQuotes(quotes) {
        quotes.forEach(quote => {
            if (!quote.id || !quote.bridgeName || !quote.outputAmount) {
                throw new Error('Invalid quote format: missing required fields');
            }
        });
    }
    /**
     * Update engine state
     */
    setState(newState) {
        this.state = newState;
        this.emit('state-change', this.state);
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
        // Restart auto-refresh if interval changed
        if (config.intervalMs && this.config.autoRefresh) {
            this.startAutoRefresh();
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.stopAutoRefresh();
        if (this.abortController) {
            this.abortController.abort();
        }
        this.refreshQueue = [];
        this.removeAllListeners();
    }
}
exports.QuoteRefreshEngine = QuoteRefreshEngine;
//# sourceMappingURL=QuoteRefreshEngine.js.map