export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  accent: string;
  background: string;
  surface: string;
  surfaceRaised: string;
  onPrimary: string;
  onSecondary: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  success: string;
  successLight: string;
  info: string;
  infoLight: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  border: string;
  borderFocus: string;
  divider: string;
  overlay: string;
}

export interface ThemeTypography {
  fontFamilyHeading: string;
  fontFamilyBody: string;
  fontFamilyMono: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontSize4xl: string;
  fontWeightLight: number;
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
  letterSpacingTight: string;
  letterSpacingNormal: string;
  letterSpacingWide: string;
}

export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  xxl: string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  inner: string;
}

export interface ThemeTransitions {
  durationFast: string;
  durationBase: string;
  durationSlow: string;
  easingDefault: string;
  easingIn: string;
  easingOut: string;
  easingBounce: string;
}

export interface ThemeBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeZIndex {
  base: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

export interface ThemeConfig {
  colors: ThemeColors;
  darkModeColors?: Partial<ThemeColors>;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions: ThemeTransitions;
  breakpoints: ThemeBreakpoints;
  zIndex: ThemeZIndex;
  darkModeEnabled: boolean;
  customCssVariables?: Record<string, string>;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: {
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    primaryActive: '#4338CA',
    secondary: '#8B5CF6',
    secondaryHover: '#7C3AED',
    secondaryActive: '#6D28D9',
    accent: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceRaised: '#F3F4F6',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    success: '#10B981',
    successLight: '#D1FAE5',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    textInverse: '#FFFFFF',
    border: '#E5E7EB',
    borderFocus: '#6366F1',
    divider: '#F3F4F6',
    overlay: 'rgba(0,0,0,0.5)',
  },
  typography: {
    fontFamilyHeading: "'Inter', 'Segoe UI', sans-serif",
    fontFamilyBody: "'Inter', 'Segoe UI', sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeBase: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2xl: '1.5rem',
    fontSize3xl: '1.875rem',
    fontSize4xl: '2.25rem',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
    letterSpacingTight: '-0.025em',
    letterSpacingNormal: '0em',
    letterSpacingWide: '0.025em',
  },
  spacing: {
    unit: 4,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    base: '4px',
    lg: '8px',
    xl: '12px',
    xxl: '16px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    base: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
    lg: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    xl: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)',
  },
  transitions: {
    durationFast: '100ms',
    durationBase: '200ms',
    durationSlow: '300ms',
    easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easingOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easingBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
    toast: 700,
  },
  darkModeEnabled: false,
  customCssVariables: {},
};
