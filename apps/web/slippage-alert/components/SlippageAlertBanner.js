"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageAlertBanner = void 0;
const react_1 = __importDefault(require("react"));
const SlippageAlertBanner = ({ alerts, onDismiss, onDismissAll, }) => {
    const active = alerts.filter((a) => !a.dismissed);
    if (active.length === 0)
        return null;
    return (<div className="slippage-alert-banner-container" role="alert" aria-live="polite">
      {active.map((alert) => (<div key={alert.id} className={`slippage-alert-banner slippage-alert-banner--${alert.severity}`}>
          <div className="slippage-alert-banner__icon">
            {alert.severity === 'critical' ? '🚨' : '⚠️'}
          </div>

          <div className="slippage-alert-banner__body">
            <span className="slippage-alert-banner__title">
              {alert.severity === 'critical' ? 'High' : 'Elevated'} Slippage
              Detected
            </span>
            <span className="slippage-alert-banner__detail">
              <strong>{alert.bridge}</strong> ({alert.sourceChain} →{' '}
              {alert.destinationChain}) — {alert.token} slippage is{' '}
              <strong>{alert.slippage.toFixed(2)}%</strong> (threshold:{' '}
              {alert.threshold}%)
            </span>
          </div>

          <button className="slippage-alert-banner__dismiss" onClick={() => onDismiss(alert.id)} aria-label="Dismiss slippage alert">
            ✕
          </button>
        </div>))}

      {active.length > 1 && onDismissAll && (<button className="slippage-alert-banner__dismiss-all" onClick={onDismissAll}>
          Dismiss all ({active.length})
        </button>)}
    </div>);
};
exports.SlippageAlertBanner = SlippageAlertBanner;
//# sourceMappingURL=SlippageAlertBanner.js.map