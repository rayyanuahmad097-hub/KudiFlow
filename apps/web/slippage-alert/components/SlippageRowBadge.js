"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageRowBadge = void 0;
const react_1 = __importDefault(require("react"));
function getSeverity(slippage, threshold) {
    if (slippage <= threshold)
        return null;
    return slippage >= threshold * 2 ? 'critical' : 'warning';
}
/**
 * Inline badge for use inside <BridgeCompare /> route rows.
 * Highlights routes with slippage exceeding the configured threshold.
 */
const SlippageRowBadge = ({ slippagePercent, threshold, }) => {
    const severity = getSeverity(slippagePercent, threshold);
    if (!severity)
        return null;
    return (<span className={`slippage-row-badge slippage-row-badge--${severity}`} title={`Slippage ${slippagePercent.toFixed(2)}% exceeds ${threshold}% threshold`}>
      {severity === 'critical' ? '🚨' : '⚠️'} {slippagePercent.toFixed(2)}%
    </span>);
};
exports.SlippageRowBadge = SlippageRowBadge;
//# sourceMappingURL=SlippageRowBadge.js.map