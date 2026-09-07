"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcHealthChecker = void 0;
/**
 * RpcHealthChecker - Monitor RPC endpoint health with failover support
 * Automatically switches to healthy endpoints
 */
class RpcHealthChecker {
    constructor(config = {}) {
        this.endpoints = new Map();
        this.checkInterval = null;
        this.config = {
            checkIntervalMs: config.checkIntervalMs ?? 30000,
            timeoutMs: config.timeoutMs ?? 5000,
            unhealthyThreshold: config.unhealthyThreshold ?? 3
        };
    }
    /**
     * Register RPC endpoint
     */
    register(url, priority = 0) {
        this.endpoints.set(url, {
            url,
            healthy: true,
            lastCheckTime: Date.now(),
            consecutiveFailures: 0,
            responseTimeMs: 0,
            priority
        });
    }
    /**
     * Get healthy endpoint (with priority-based failover)
     */
    getHealthyEndpoint() {
        const healthy = Array.from(this.endpoints.values())
            .filter(ep => ep.healthy)
            .sort((a, b) => a.priority - b.priority);
        return healthy.length > 0 ? healthy[0] : null;
    }
    /**
     * Get all healthy endpoints
     */
    getHealthyEndpoints() {
        return Array.from(this.endpoints.values())
            .filter(ep => ep.healthy)
            .sort((a, b) => a.priority - b.priority);
    }
    /**
     * Check specific endpoint health
     */
    async checkEndpoint(url) {
        const endpoint = this.endpoints.get(url);
        if (!endpoint)
            return false;
        const startTime = Date.now();
        try {
            // Simple health check - try a basic RPC call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getLedger'
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            endpoint.responseTimeMs = responseTime;
            endpoint.lastCheckTime = Date.now();
            if (response.ok) {
                endpoint.healthy = true;
                endpoint.consecutiveFailures = 0;
                return true;
            }
            else {
                throw new Error(`HTTP ${response.status}`);
            }
        }
        catch (error) {
            endpoint.consecutiveFailures++;
            endpoint.lastCheckTime = Date.now();
            if (endpoint.consecutiveFailures >= this.config.unhealthyThreshold) {
                endpoint.healthy = false;
                console.warn(`[RpcHealthChecker] Endpoint ${url} marked unhealthy after ${endpoint.consecutiveFailures} failures`);
            }
            return false;
        }
    }
    /**
     * Check all endpoints
     */
    async checkAll() {
        const results = new Map();
        for (const [url] of this.endpoints) {
            const healthy = await this.checkEndpoint(url);
            results.set(url, healthy);
        }
        return results;
    }
    /**
     * Start periodic health checks
     */
    startHealthChecks() {
        if (this.checkInterval)
            return;
        this.checkInterval = setInterval(async () => {
            await this.checkAll();
        }, this.config.checkIntervalMs);
        if (this.checkInterval.unref) {
            this.checkInterval.unref();
        }
        // Initial check
        this.checkAll().catch(err => console.error('[RpcHealthChecker] Initial health check failed:', err));
    }
    /**
     * Stop health checks
     */
    stopHealthChecks() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    /**
     * Get endpoint statistics
     */
    getStats() {
        const endpoints = Array.from(this.endpoints.values());
        const healthy = endpoints.filter(ep => ep.healthy).length;
        return {
            total: endpoints.length,
            healthy,
            unhealthy: endpoints.length - healthy,
            endpoints: endpoints.map(ep => ({
                url: ep.url,
                healthy: ep.healthy,
                responseTimeMs: ep.responseTimeMs,
                consecutiveFailures: ep.consecutiveFailures,
                lastCheckTime: new Date(ep.lastCheckTime).toISOString()
            }))
        };
    }
    /**
     * Reset endpoint state
     */
    reset(url) {
        const endpoint = this.endpoints.get(url);
        if (endpoint) {
            endpoint.healthy = true;
            endpoint.consecutiveFailures = 0;
            endpoint.lastCheckTime = Date.now();
        }
    }
    /**
     * Destroy checker
     */
    destroy() {
        this.stopHealthChecks();
        this.endpoints.clear();
    }
}
exports.RpcHealthChecker = RpcHealthChecker;
//# sourceMappingURL=RpcHealthChecker.js.map