/**
 * Beacon Design System - Design Tokens
 *
 * Extracted from the Beacon emergency management application.
 * These tokens define the visual language for all Beacon applications.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  beacon: {
    // Primary brand color - teal/cyan
    primary: '#0097b2',
    primaryHover: '#007a94',
    primaryLight: '#e6f3f6',
    primaryLighter: '#f1f6f6',

    // Dark navy for headers and emphasis
    navy: '#0b0f2a',
    navyHover: '#1a1f3a',
    navyLight: '#1F2657',
  },

  status: {
    // Success - Green
    success: '#10b981',
    successDark: '#059669',
    successDarker: '#047857',
    successDarkest: '#166534',
    successMuted: '#065f46',
    successLight: '#dcfce7',
    successLighter: '#d1fae5',
    successBorder: '#bbf7d0',
    successBorderLight: '#a7f3d0',
    successText: '#86efac',
    successTextLight: '#6ee7b7',

    // Error/Danger - Red
    error: '#dc2626',
    errorDark: '#991b1b',
    errorDarker: '#b91c1c',
    errorDarkest: '#7f1d1d',
    errorLight: '#fee2e2',
    errorLighter: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#fca5a5',
    errorMid: '#ef4444',

    // Warning - Amber/Orange
    warning: '#f59e0b',
    warningDark: '#d97706',
    warningDarker: '#92400e',
    warningLight: '#fef3c7',
    warningText: '#fbbf24',

    // Info - Blue
    info: '#3b82f6',
    infoDark: '#2563eb',
    infoDarker: '#1d4ed8',
    infoLight: '#93c5fd',
  },

  neutral: {
    // Pure white to black scale
    white: '#ffffff',
    offWhite: '#fdfdfd',

    // Light grays (backgrounds)
    50: '#f8fafc',
    100: '#f5f5f5',
    150: '#f3f4f6',
    200: '#f1f5f9',

    // Medium grays (borders, dividers)
    300: '#e5e7eb',
    350: '#e2e8f0',
    400: '#d1d5db',

    // Muted grays (secondary text)
    500: '#9ca3af',
    550: '#94a3b8',
    600: '#6b7280',
    650: '#64748b',

    // Dark grays (primary text)
    700: '#626769',
    750: '#666666',
    800: '#475569',
    850: '#374151',
    900: '#333333',
    950: '#1e293b',
  },

  // Semantic aliases for common use cases
  text: {
    primary: '#333333',
    secondary: '#626769',
    muted: '#6b7280',
    light: '#9ca3af',
    inverse: '#ffffff',
  },

  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f5f5f5',
    dark: '#1e293b',
    darker: '#0f172a',
  },

  border: {
    light: '#e5e7eb',
    default: '#e2e8f0',
    dark: '#d1d5db',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fonts: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
    mono: ['Monaco', 'Menlo', 'Consolas', 'monospace'],
  },

  sizes: {
    '2xs': '0.625rem',    // 10px
    xs: '0.6875rem',      // 11px
    sm: '0.75rem',        // 12px
    'sm-md': '0.8125rem', // 13px
    md: '0.875rem',       // 14px
    base: '1rem',         // 16px
    lg: '1.125rem',       // 18px
    xl: '1.25rem',        // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '2.125rem',    // 34px
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.5,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',       // 4px
  default: '0.375rem', // 6px
  md: '0.5rem',        // 8px
  lg: '0.75rem',       // 12px
  xl: '1rem',          // 16px
  '2xl': '1.5rem',     // 24px
  full: '3.125rem',    // 50px - used for pills/buttons
  circle: '50%',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  default: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 20px rgba(0, 0, 0, 0.2)',
  '2xl': '0 20px 60px rgba(0, 0, 0, 0.3)',

  // Inner shadows for inputs
  inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
  innerMd: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',

  // Focus shadows
  focus: '0 0 0 2px rgba(0, 151, 178, 0.2)',
  focusError: '0 0 0 2px rgba(220, 38, 38, 0.2)',

  // Emergency mode shadow
  emergency: '0 0 20px rgba(220, 38, 38, 0.5)',

  // Button shadows
  button: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
  buttonHover: 'inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.12)',

  // Card elevations
  card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 6px rgba(0, 0, 0, 0.15)',
  cardLifted: '0 8px 20px rgba(0, 0, 0, 0.3)',

  // Modal shadow
  modal: '0 20px 60px rgba(0, 0, 0, 0.3)',

  // Floating action button
  fab: '0 4px 12px rgba(0, 151, 178, 0.3)',
  fabHover: '0 6px 16px rgba(0, 151, 178, 0.4)',
};

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  emergency: 100,
  max: 2000,
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    default: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    default: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Brand gradients
  beaconPrimary: 'linear-gradient(135deg, #0097b2 0%, #007a94 100%)',

  // Form backgrounds
  inputBackground: 'linear-gradient(90deg, #f1f6f6, #e6f3f6)',
  inputBackgroundFocus: 'linear-gradient(145deg, #fdfdfd, #f5f6f7)',

  // Button gradients
  buttonDefault: 'linear-gradient(145deg, #e5e6ed, #d8d9e0)',
  buttonHover: 'linear-gradient(145deg, #d6d7de, #c8c9d0)',
  cardWhite: 'linear-gradient(145deg, #ffffff, #fdfdfd)',

  // Status gradients
  emergency: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  emergencyDark: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
  severe: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
  moderate: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  minor: 'linear-gradient(135deg, #059669 0%, #047857 100%)',

  // Dark backgrounds
  darkSlate: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  darkBlue: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',

  // Decorative dividers
  dividerLight: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent)',
  dividerMedium: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.25), transparent)',
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  keyframes: {
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
    emergencyPulse: {
      '0%, 100%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.5)' },
      '50%': { boxShadow: '0 0 15px rgba(220, 38, 38, 0.8)' },
    },
    beaconPulse: {
      '0%, 100%': { boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.4)' },
      '50%': { boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)' },
    },
    alertPulse: {
      '0%': { opacity: '0.9' },
      '100%': { opacity: '1' },
    },
  },
  durations: {
    spin: '1s',
    pulse: '2s',
    emergencyPulse: '2s',
    beaconPulse: '2s',
  },
};
