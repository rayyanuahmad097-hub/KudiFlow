"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageWarningBlock = void 0;
const react_1 = __importDefault(require("react"));
/**
 * Inline warning block for use inside <BridgeStatus /> during execution.
 * When blockOnExceed is enabled, also renders a transfer-blocked notice.
 */
const SlippageWarningBlock = ({ activeAlerts, isBlocked, onDismiss, }) => {
    if (activeAlerts.length === 0 && !isBlocked)
        return null;
    return (<div className="slippage-warning-block">
      {isBlocked && (<div className="slippage-warning-block__blocked" role="alert">
          <strong>Transfer Blocked</strong> — slippage exceeds your configured
          maximum. Adjust your threshold or wait for better rates.
        </div>)}

      {activeAlerts.map((alert) => (<div key={alert.id} className={`slippage-warning-block__item slippage-warning-block__item--${alert.severity}`}>
          <span>
            {alert.severity === 'critical' ? '🚨' : '⚠️'}{' '}
            <strong>{alert.bridge}</strong>: slippage is{' '}
            {alert.slippage.toFixed(2)}% — threshold is {alert.threshold}%
          </span>
          <button onClick={() => onDismiss(alert.id)} aria-label="Dismiss warning">
            ✕
          </button>
        </div>))}
    </div>);
};
exports.SlippageWarningBlock = SlippageWarningBlock;
//# sourceMappingURL=SlippageWarningBlock.js.map