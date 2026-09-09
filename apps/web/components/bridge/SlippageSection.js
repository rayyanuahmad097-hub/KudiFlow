"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageSection = SlippageSection;
/**
 * SlippageSection — Drop this component into your bridge form wherever
 * you display route details. It reacts automatically whenever
 * `transferAmount` or `route` changes.
 *
 * Usage:
 *   <SlippageSection
 *     transferAmount={amount}
 *     route={selectedRoute}
 *     outputSymbol="USDC"
 *   />
 */
const react_1 = __importDefault(require("react"));
const useSlippage_1 = require("@/hooks/useSlippage");
const SlippageDisplay_1 = require("./SlippageDisplay");
const SlippageWarning_1 = require("./SlippageWarning");
function SlippageSection({ transferAmount, route, outputSymbol, warningThreshold, lowLiquidityThreshold, className = "", }) {
    const slippage = (0, useSlippage_1.useSlippage)(route, transferAmount, warningThreshold, lowLiquidityThreshold);
    if (!route || !transferAmount || Number(transferAmount) <= 0)
        return null;
    return (<div className={`flex flex-col gap-3 ${className}`}>
      <SlippageWarning_1.SlippageWarning slippage={slippage} warningThreshold={warningThreshold}/>
      <SlippageDisplay_1.SlippageDisplay slippage={slippage} outputSymbol={outputSymbol}/>
    </div>);
}
//# sourceMappingURL=SlippageSection.js.map