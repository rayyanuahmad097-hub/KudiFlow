"use strict";
/**
 * SSR-safe utilities for KudiFlow components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsMounted = exports.ssrWindow = exports.ssrLocalStorage = exports.isServer = exports.isBrowser = void 0;
const react_1 = require("react");
/**
 * Check if code is running in browser environment
 */
exports.isBrowser = typeof window !== 'undefined';
/**
 * Check if code is running in server environment
 */
exports.isServer = !exports.isBrowser;
/**
 * SSR-safe localStorage operations
 */
exports.ssrLocalStorage = {
    getItem: (key) => {
        if (!exports.isBrowser)
            return null;
        try {
            return localStorage.getItem(key);
        }
        catch {
            return null;
        }
    },
    setItem: (key, value) => {
        if (!exports.isBrowser)
            return;
        try {
            localStorage.setItem(key, value);
        }
        catch {
            // Silently fail in server environment
        }
    },
    removeItem: (key) => {
        if (!exports.isBrowser)
            return;
        try {
            localStorage.removeItem(key);
        }
        catch {
            // Silently fail in server environment
        }
    }
};
/**
 * SSR-safe window operations
 */
exports.ssrWindow = {
    getScrollY: () => {
        if (!exports.isBrowser)
            return 0;
        return window.scrollY;
    },
    addEventListener: (event, handler) => {
        if (!exports.isBrowser)
            return;
        window.addEventListener(event, handler);
    },
    removeEventListener: (event, handler) => {
        if (!exports.isBrowser)
            return;
        window.removeEventListener(event, handler);
    }
};
/**
 * Hook to detect if component is mounted (client-side)
 */
const useIsMounted = () => {
    const [isMounted, setIsMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);
    return isMounted;
};
exports.useIsMounted = useIsMounted;
//# sourceMappingURL=ssr.js.map