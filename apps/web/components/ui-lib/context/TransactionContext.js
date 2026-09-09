'use client';
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
exports.useTransaction = exports.TransactionProvider = void 0;
const react_1 = __importStar(require("react"));
const ssr_1 = require("../utils/ssr");
const TransactionContext = (0, react_1.createContext)(undefined);
const STORAGE_KEY = 'kudiflow_tx_state';
const TransactionProvider = ({ children }) => {
    const [state, setState] = (0, react_1.useState)({
        id: '',
        status: 'idle',
        progress: 0,
        step: '',
        timestamp: 0,
    });
    // Load from storage on mount
    (0, react_1.useEffect)(() => {
        const stored = ssr_1.ssrLocalStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setState(parsed);
                }
                else {
                    ssr_1.ssrLocalStorage.removeItem(STORAGE_KEY);
                }
            }
            catch (e) {
                console.error('Failed to load transaction state', e);
            }
        }
    }, []);
    // Save to storage on change
    (0, react_1.useEffect)(() => {
        if (state.status !== 'idle') {
            ssr_1.ssrLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, [state]);
    const updateState = (0, react_1.useCallback)((updates) => {
        setState((prev) => ({ ...prev, ...updates, timestamp: Date.now() }));
    }, []);
    const clearState = (0, react_1.useCallback)(() => {
        setState({
            id: '',
            status: 'idle',
            progress: 0,
            step: '',
            timestamp: 0,
        });
        ssr_1.ssrLocalStorage.removeItem(STORAGE_KEY);
    }, []);
    const startTransaction = (0, react_1.useCallback)((id) => {
        setState({
            id,
            status: 'pending',
            progress: 0,
            step: 'Initializing...',
            timestamp: Date.now()
        });
    }, []);
    return (<TransactionContext.Provider value={{ state, updateState, clearState, startTransaction }}>
            {children}
        </TransactionContext.Provider>);
};
exports.TransactionProvider = TransactionProvider;
const useTransaction = () => {
    const context = (0, react_1.useContext)(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};
exports.useTransaction = useTransaction;
//# sourceMappingURL=TransactionContext.js.map