"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageWarning = SlippageWarning;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
const useSlippage_1 = require("@/hooks/useSlippage");
function SlippageWarning({ slippage, warningThreshold = useSlippage_1.SLIPPAGE_WARNING_THRESHOLD, className = "", }) {
    const { isHighSlippage, isLowLiquidity, slippagePercent, hasWarning } = slippage;
    if (!hasWarning)
        return null;
    return (<div className={`flex flex-col gap-2 ${className}`}>
      {/* High Slippage Warning */}
      {isHighSlippage && (<alert_1.Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
          <alert_1.AlertTitle className="text-red-500 font-semibold">
            High Slippage Warning
          </alert_1.AlertTitle>
          <alert_1.AlertDescription className="text-red-400 text-sm">
            Current slippage is{" "}
            <span className="font-bold">{slippagePercent.toFixed(2)}%</span>,
            which exceeds the {warningThreshold}% threshold. You may receive
            significantly less than expected. Consider splitting your transaction
            or waiting for better market conditions.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Low Liquidity Warning */}
      {isLowLiquidity && (<alert_1.Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10">
          <lucide_react_1.Droplets className="h-4 w-4 text-yellow-500"/>
          <alert_1.AlertTitle className="text-yellow-500 font-semibold">
            Low Liquidity
          </alert_1.AlertTitle>
          <alert_1.AlertDescription className="text-yellow-400 text-sm">
            This route has low liquidity depth. Large transactions may cause
            higher slippage and price impact. Consider using a smaller amount or
            an alternative route.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}
    </div>);
}
//# sourceMappingURL=SlippageWarning.js.map