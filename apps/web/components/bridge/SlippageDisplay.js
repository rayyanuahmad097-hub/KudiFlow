"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageDisplay = SlippageDisplay;
const react_1 = __importDefault(require("react"));
const tooltip_1 = require("@/components/ui/tooltip");
const lucide_react_1 = require("lucide-react");
function SlippageDisplay({ slippage, outputSymbol = "", className = "", }) {
    const { slippagePercent, minimumReceived, isHighSlippage, hasWarning } = slippage;
    const slippageColor = isHighSlippage
        ? "text-red-500"
        : slippagePercent > 0.5
            ? "text-yellow-500"
            : "text-green-500";
    return (<div className={`flex flex-col gap-2 text-sm ${className}`}>
      {/* Slippage Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>Slippage</span>
          <tooltip_1.TooltipProvider>
            <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <lucide_react_1.Info className="h-3.5 w-3.5 cursor-pointer"/>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent className="max-w-xs">
                <p>
                  Slippage is the difference between the expected and actual
                  amount received. High slippage may result in receiving
                  significantly less than expected. This can occur during high
                  volatility or low liquidity conditions.
                </p>
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
          </tooltip_1.TooltipProvider>
        </div>

        <span className={`font-medium ${slippageColor}`}>
          {hasWarning && (<span className="mr-1" aria-label="warning">
              ⚠️
            </span>)}
          {slippagePercent.toFixed(2)}%
        </span>
      </div>

      {/* Minimum Received Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span>Minimum received</span>
          <tooltip_1.TooltipProvider>
            <tooltip_1.Tooltip>
              <tooltip_1.TooltipTrigger asChild>
                <lucide_react_1.Info className="h-3.5 w-3.5 cursor-pointer"/>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent className="max-w-xs">
                <p>
                  The minimum amount you are guaranteed to receive after
                  accounting for slippage. If the actual output falls below this
                  value, the transaction will revert.
                </p>
              </tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>
          </tooltip_1.TooltipProvider>
        </div>

        <span className="font-medium text-foreground">
          {minimumReceived} {outputSymbol}
        </span>
      </div>
    </div>);
}
//# sourceMappingURL=SlippageDisplay.js.map