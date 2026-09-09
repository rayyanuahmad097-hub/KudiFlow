"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageToast = void 0;
const react_1 = __importStar(require("react"));
const SlippageToast = ({ alerts, onDismiss, autoDismissMs = 5000, }) => {
    const active = alerts.filter((a) => !a.dismissed);
    (0, react_1.useEffect)(() => {
        if (autoDismissMs <= 0 || active.length === 0)
            return;
        const timers = active.map((alert) => setTimeout(() => onDismiss(alert.id), autoDismissMs));
        return () => timers.forEach(clearTimeout);
    }, [active, autoDismissMs, onDismiss]);
    if (active.length === 0)
        return null;
    return (<div className="slippage-toast-container" role="status" aria-live="polite">
      {active.map((alert) => (<div key={alert.id} className={`slippage-toast slippage-toast--${alert.severity}`}>
          <div className="slippage-toast__content">
            <p className="slippage-toast__title">
              {alert.severity === 'critical' ? '🚨 Critical' : '⚠️ Warning'}:{' '}
              Slippage Alert
            </p>
            <p className="slippage-toast__message">
              {alert.bridge} — {alert.token}: {alert.slippage.toFixed(2)}%
              slippage exceeds your {alert.threshold}% limit.
            </p>
          </div>
          <button className="slippage-toast__close" onClick={() => onDismiss(alert.id)} aria-label="Close notification">
            ✕
          </button>
        </div>))}
    </div>);
};
exports.SlippageToast = SlippageToast;
//# sourceMappingURL=SlippageToast.js.map