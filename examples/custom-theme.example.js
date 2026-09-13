"use strict";
/**
 * Custom Theme Configuration Example
 * Shows how external developers can customize the KudiFlow theme
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
exports.DarkApp = DarkApp;
const theme_1 = require("@kudiflow/ui-components/theme");
/**
 * Example: Custom brand colors
 */
const customTheme = {
    colors: {
        background: {
            primary: '#fafafa',
            secondary: '#f4f4f5',
        },
        foreground: {
            primary: '#18181b',
            link: '#3b82f6',
        },
        transaction: {
            background: '#ffffff',
            border: '#e4e4e7',
            progressBar: {
                success: '#22c55e',
                error: '#ef4444',
                pending: '#3b82f6',
            },
        },
    },
    spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1.25rem',
    },
    typography: {
        fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
        },
    },
};
/**
 * Example: Dark-first theme
 */
const darkFirstTheme = {
    colors: {
        background: {
            primary: '#0a0a0a',
            secondary: '#171717',
        },
        foreground: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
        },
    },
};
/**
 * Usage in your app
 */
function App() {
    return (<theme_1.ThemeProvider theme={customTheme} defaultMode="system">
      {/* Your application components */}
    </theme_1.ThemeProvider>);
}
/**
 * Force dark mode
 */
function DarkApp() {
    return (<theme_1.ThemeProvider theme={darkFirstTheme} defaultMode="dark">
      {/* Your application components */}
    </theme_1.ThemeProvider>);
}
//# sourceMappingURL=custom-theme.example.js.map