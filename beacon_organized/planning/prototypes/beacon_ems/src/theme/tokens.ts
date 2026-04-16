/**
 * Beacon EMS Design Tokens for React Native
 * Derived from the Beacon design system
 */

export const colors = {
  // Brand
  beacon: {
    primary: '#0097b2',
    primaryHover: '#007a94',
    primaryLight: '#e6f3f6',
    navy: '#0b0f2a',
    navyLight: '#1F2657',
  },

  // Status colors - Critical for EMS
  status: {
    // Critical/Emergency - Red
    critical: '#dc2626',
    criticalDark: '#991b1b',
    criticalLight: '#fee2e2',

    // Severe - Orange
    severe: '#f59e0b',
    severeDark: '#d97706',
    severeLight: '#fef3c7',

    // Moderate - Blue
    moderate: '#3b82f6',
    moderateDark: '#2563eb',
    moderateLight: '#dbeafe',

    // Minor/Success - Green
    minor: '#10b981',
    minorDark: '#059669',
    minorLight: '#dcfce7',

    // Online/Offline indicators
    online: '#10b981',
    offline: '#6b7280',
    busy: '#f59e0b',
  },

  // Background colors - Light theme for EMS
  background: {
    primary: '#f8fafc',
    secondary: '#f1f5f9',
    tertiary: '#e2e8f0',
    card: '#ffffff',
    cardElevated: '#ffffff',
  },

  // Text colors
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    default: '#e2e8f0',
    light: '#f1f5f9',
    dark: '#cbd5e1',
  },

  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Minimum touch target size for accessibility (44x44 points)
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// Shadows for cards
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  touchTargets,
  shadows,
};
