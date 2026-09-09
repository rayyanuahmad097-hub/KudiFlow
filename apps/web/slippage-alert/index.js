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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageWarningBlock = exports.SlippageRowBadge = exports.SlippageToast = exports.SlippageAlertBanner = exports.useSlippageMonitor = exports.useSlippageAlert = void 0;
__exportStar(require("./types/slippage-alert.types"), exports);
var useSlippageAlert_1 = require("./hooks/useSlippageAlert");
Object.defineProperty(exports, "useSlippageAlert", { enumerable: true, get: function () { return useSlippageAlert_1.useSlippageAlert; } });
var useSlippageMonitor_1 = require("./hooks/useSlippageMonitor");
Object.defineProperty(exports, "useSlippageMonitor", { enumerable: true, get: function () { return useSlippageMonitor_1.useSlippageMonitor; } });
var SlippageAlertBanner_1 = require("./components/SlippageAlertBanner");
Object.defineProperty(exports, "SlippageAlertBanner", { enumerable: true, get: function () { return SlippageAlertBanner_1.SlippageAlertBanner; } });
var SlippageToast_1 = require("./components/SlippageToast");
Object.defineProperty(exports, "SlippageToast", { enumerable: true, get: function () { return SlippageToast_1.SlippageToast; } });
var SlippageRowBadge_1 = require("./components/SlippageRowBadge");
Object.defineProperty(exports, "SlippageRowBadge", { enumerable: true, get: function () { return SlippageRowBadge_1.SlippageRowBadge; } });
var SlippageWarningBlock_1 = require("./components/SlippageWarningBlock");
Object.defineProperty(exports, "SlippageWarningBlock", { enumerable: true, get: function () { return SlippageWarningBlock_1.SlippageWarningBlock; } });
//# sourceMappingURL=index.js.map