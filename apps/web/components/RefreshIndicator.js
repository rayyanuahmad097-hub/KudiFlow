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
exports.RefreshIndicator = void 0;
const react_1 = __importStar(require("react"));
const RefreshIndicator = ({ isRefreshing, lastRefreshed, onClick, showAnimation = false }) => {
    const [animate, setAnimate] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (showAnimation) {
            setAnimate(true);
            const timer = setTimeout(() => setAnimate(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showAnimation]);
    const getTimeSinceLastRefresh = () => {
        if (!lastRefreshed)
            return 'Never';
        const seconds = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
        if (seconds < 60)
            return `${seconds}s`;
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h`;
    };
    return (<button className={`refresh-indicator ${animate ? 'refresh-indicator--pulse' : ''}`} onClick={onClick} disabled={isRefreshing} aria-label="Refresh quotes" title={`Last refreshed: ${getTimeSinceLastRefresh()} ago`}>
      <svg className={`refresh-indicator__icon ${isRefreshing ? 'refresh-indicator__icon--spinning' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 7H21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {isRefreshing && (<span className="refresh-indicator__text">Refreshing...</span>)}
    </button>);
};
exports.RefreshIndicator = RefreshIndicator;
//# sourceMappingURL=RefreshIndicator.js.map