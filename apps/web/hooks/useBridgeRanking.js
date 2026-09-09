"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBridgeRanking = useBridgeRanking;
const react_1 = require("react");
const ranking_1 = require("@/lib/ranking");
/**
 * Reactively ranks bridge routes whenever `routes` or `weights` change.
 * Replaces simple fee-based sorting in the aggregation engine UI layer.
 *
 * @param routes  - Normalized quotes from the aggregation engine
 * @param weights - Optional weight overrides
 */
function useBridgeRanking(routes, weights) {
    return (0, react_1.useMemo)(() => {
        if (!routes || routes.length === 0) {
            return { rankedRoutes: [], bestRoute: null };
        }
        const rankedRoutes = (0, ranking_1.rankBridges)(routes, weights);
        return {
            rankedRoutes,
            bestRoute: rankedRoutes[0] ?? null,
        };
    }, [routes, weights]);
}
//# sourceMappingURL=useBridgeRanking.js.map