/**
 * Beacon Design System - Component Patterns
 *
 * Reusable component style patterns using Tailwind CSS classes.
 * Import these patterns to ensure consistent styling across all Beacon apps.
 */

// ============================================================================
// BUTTONS
// ============================================================================

export const buttons = {
  // Base button styles applied to all buttons
  base: 'font-medium transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',

  variants: {
    // Primary action button
    primary: 'bg-beacon-primary hover:bg-beacon-primaryHover text-white focus:ring-beacon-primary',

    // Secondary/neutral button (pill style from auth pages)
    secondary: 'bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-beacon-navy shadow-button hover:shadow-buttonHover',

    // Outline/ghost button
    outline: 'bg-transparent border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600',

    // Danger/destructive button
    danger: 'bg-status-error hover:bg-status-errorDarker text-white focus:ring-status-error',

    // Emergency action button (animated pulse)
    emergency: 'bg-gradient-to-br from-status-error to-status-errorDark text-white shadow-emergency hover:shadow-lg',

    // Link-style button
    link: 'bg-transparent text-beacon-navy underline hover:text-beacon-navyHover p-0',

    // Floating action button
    fab: 'rounded-full bg-beacon-primary text-white shadow-fab hover:shadow-fabHover hover:bg-beacon-primaryHover hover:-translate-y-0.5',

    // Transparent/ghost on dark backgrounds
    ghost: 'bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50',
  },

  sizes: {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-xl',
    pill: 'px-6 py-3 text-lg rounded-full', // Auth page style
    fab: 'w-14 h-14 text-xl', // Floating action button
    fabSm: 'w-11 h-11 text-lg',
  },

  // Full width variant
  fullWidth: 'w-full',
};

// Helper function to compose button classes
export const getButtonClasses = (
  variant: keyof typeof buttons.variants = 'primary',
  size: keyof typeof buttons.sizes = 'md',
  fullWidth = false
): string => {
  return [
    buttons.base,
    buttons.variants[variant],
    buttons.sizes[size],
    fullWidth ? buttons.fullWidth : '',
  ].filter(Boolean).join(' ');
};

// ============================================================================
// INPUTS
// ============================================================================

export const inputs = {
  // Base input styles
  base: 'w-full font-inherit transition-all duration-200 ease-in-out focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed',

  variants: {
    // Default input (pill style from auth pages)
    default: 'bg-gradient-to-r from-beacon-primaryLighter to-beacon-primaryLight border border-gray-200 rounded-full shadow-inner focus:shadow-innerMd focus:bg-gradient-to-br focus:from-white focus:to-gray-50',

    // Standard rectangular input
    standard: 'bg-white border border-gray-300 rounded-lg focus:border-beacon-primary focus:ring-2 focus:ring-beacon-primary/20',

    // Search input
    search: 'bg-white/95 border border-black/20 rounded-lg backdrop-blur focus:border-info focus:ring-2 focus:ring-info/10',

    // Error state
    error: 'border-status-error focus:border-status-error focus:ring-status-error/20',

    // Chat input
    chat: 'bg-white border border-gray-200 rounded-2xl focus:border-info',
  },

  sizes: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
    pill: 'px-5 py-2.5 text-base', // Auth page style
  },

  // Label styles
  label: {
    base: 'block font-medium text-sm mb-2',
    default: 'text-beacon-navy uppercase tracking-wide',
    muted: 'text-gray-600',
    error: 'text-status-error',
  },

  // Help text styles
  helpText: {
    default: 'text-sm text-gray-500 mt-1',
    error: 'text-sm text-status-error mt-1',
  },
};

// Helper function to compose input classes
export const getInputClasses = (
  variant: keyof typeof inputs.variants = 'default',
  size: keyof typeof inputs.sizes = 'md',
  hasError = false
): string => {
  return [
    inputs.base,
    inputs.variants[variant],
    inputs.sizes[size],
    hasError ? inputs.variants.error : '',
  ].filter(Boolean).join(' ');
};

// ============================================================================
// CARDS
// ============================================================================

export const cards = {
  // Base card styles
  base: 'rounded-lg transition-all duration-200',

  variants: {
    // Default card with subtle shadow
    default: 'bg-white shadow-card border border-gray-100',

    // Elevated card on hover
    elevated: 'bg-white shadow-card hover:shadow-cardHover hover:-translate-y-0.5',

    // Glass morphism card for dark backgrounds
    glass: 'bg-white/10 backdrop-blur border border-white/20',

    // Auth form card
    form: 'bg-gradient-to-br from-white to-gray-50 shadow-sm rounded-3xl',

    // Status/notification card
    notification: 'border-l-4',

    // Entity/list item card
    entity: 'bg-white shadow-card hover:shadow-cardHover hover:-translate-y-0.5 cursor-pointer',

    // Emergency card
    emergency: 'bg-status-error/20 border border-status-error/50 backdrop-blur',
  },

  sizes: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    form: 'py-24 px-20', // Auth form padding
  },

  // Notification severity variants
  severity: {
    critical: 'bg-gradient-to-br from-status-error to-status-errorDark border-status-errorText',
    severe: 'bg-gradient-to-br from-status-warning to-status-warningDarker border-status-warningText',
    moderate: 'bg-gradient-to-br from-info to-infoDark border-infoLight',
    minor: 'bg-gradient-to-br from-status-successDark to-status-successDarker border-status-successTextLight',
    info: 'bg-status-infoLight/10 border-status-info',
    success: 'bg-status-successLight border-status-successBorder',
    warning: 'bg-status-warningLight border-status-warning',
    error: 'bg-status-errorLight border-status-errorBorder',
  },
};

// Helper function to compose card classes
export const getCardClasses = (
  variant: keyof typeof cards.variants = 'default',
  size: keyof typeof cards.sizes = 'md'
): string => {
  return [cards.base, cards.variants[variant], cards.sizes[size]].join(' ');
};

// ============================================================================
// BADGES & STATUS INDICATORS
// ============================================================================

export const badges = {
  base: 'inline-flex items-center font-semibold rounded-full',

  variants: {
    // Status badges
    safe: 'bg-status-successLight text-status-successDarkest',
    sheltering: 'bg-status-warningLight text-status-warningDarker',
    help: 'bg-status-errorLight text-status-errorDark',

    // General purpose
    primary: 'bg-beacon-primaryLight text-beacon-primary',
    secondary: 'bg-gray-100 text-gray-700',
    success: 'bg-status-successLight text-status-successDarkest',
    warning: 'bg-status-warningLight text-status-warningDarker',
    error: 'bg-status-errorLight text-status-errorDark',
    info: 'bg-blue-100 text-blue-800',

    // Beacon indicator (animated)
    beacon: 'bg-status-error text-white animate-beaconPulse',
  },

  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  },
};

// Status dot indicator
export const statusDot = {
  base: 'w-2 h-2 rounded-full',
  variants: {
    safe: 'bg-status-success',
    sheltering: 'bg-status-warning',
    help: 'bg-status-error',
    connected: 'bg-status-success',
    connecting: 'bg-status-warning',
    error: 'bg-status-error',
    inactive: 'bg-gray-400',
  },
};

// ============================================================================
// ALERTS & MESSAGES
// ============================================================================

export const alerts = {
  base: 'rounded-lg border p-3',

  variants: {
    success: 'bg-status-successLight text-status-successMuted border-status-successBorder',
    error: 'bg-status-errorLight text-status-error border-status-errorBorder',
    warning: 'bg-status-warningLight text-status-warningDarker border-status-warning',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  },

  // Emergency alert banner variants (for overlays)
  banner: {
    base: 'p-3 border-b-4',
    critical: 'bg-gradient-to-br from-status-error to-status-errorDark border-status-errorText shadow-emergency',
    severe: 'bg-gradient-to-br from-status-warningDark to-status-warningDarker border-status-warningText',
    moderate: 'bg-gradient-to-br from-info to-infoDark border-infoLight',
    minor: 'bg-gradient-to-br from-status-successDark to-status-successDarker border-status-successTextLight',
  },
};

// ============================================================================
// NAVIGATION
// ============================================================================

export const navigation = {
  // Header/top bar
  header: {
    base: 'bg-beacon-primary text-white shadow-md',
    content: 'flex items-center justify-between px-4 py-3 max-w-7xl mx-auto',
  },

  // Bottom navigation (mobile)
  bottomNav: {
    container: 'flex bg-white border-t border-gray-200 shadow-lg',
    tab: 'flex-1 flex flex-col items-center gap-1 py-3 px-2 text-gray-500 transition-all duration-200 hover:bg-beacon-primary/5',
    tabActive: 'text-beacon-primary bg-beacon-primary/5',
    icon: 'text-2xl flex items-center justify-center',
    label: 'text-xs font-medium',
  },

  // Menu button
  menuBtn: 'p-2 rounded text-white hover:bg-white/10 transition-colors',
};

// ============================================================================
// MODALS & OVERLAYS
// ============================================================================

export const modals = {
  // Backdrop overlay
  overlay: 'fixed inset-0 bg-black/60 flex items-center justify-center z-modal',

  // Modal container
  container: {
    base: 'bg-white rounded-lg shadow-modal max-h-[80vh] overflow-y-auto',
    sm: 'max-w-sm w-[90%] p-6',
    md: 'max-w-md w-[90%] p-8',
    lg: 'max-w-lg w-[90%] p-8',
    xl: 'max-w-xl w-[90%] p-8',
  },

  // Modal header
  header: 'flex items-center justify-between mb-5',
  title: 'text-xl font-semibold text-beacon-navyLight',

  // Close button
  closeBtn: 'w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-2xl',
};

// ============================================================================
// MAP COMPONENTS
// ============================================================================

export const map = {
  // Map container
  container: 'relative w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg',

  // Emergency mode
  emergencyMode: 'border-4 border-status-error shadow-emergency',

  // Map overlay badges
  overlay: {
    base: 'absolute z-overlay backdrop-blur rounded-md text-sm',
    position: {
      topLeft: 'top-4 left-4',
      topRight: 'top-4 right-4',
      bottomLeft: 'bottom-4 left-4',
      bottomRight: 'bottom-4 right-4',
    },
    emergency: 'bg-status-error/95 text-white px-4 py-2 font-bold flex items-center gap-2',
    stats: 'bg-black/80 text-white px-3 py-2',
  },

  // Map controls
  controls: {
    container: 'absolute top-4 right-4 z-overlay flex flex-col gap-2',
    button: 'w-11 h-11 bg-white/95 border border-black/20 rounded-md flex items-center justify-center text-lg cursor-pointer hover:bg-white hover:-translate-y-px shadow-lg backdrop-blur transition-all',
    buttonActive: 'bg-status-error/95 border-status-error/50 text-white',
  },
};

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layout = {
  // Page containers
  page: {
    base: 'min-h-screen flex flex-col',
    auth: 'min-h-screen bg-beacon-primary flex flex-col overflow-x-hidden relative',
    dashboard: 'min-h-screen bg-white text-gray-900 flex flex-col',
  },

  // Content containers
  content: {
    center: 'flex-1 flex items-center justify-center p-5',
    scroll: 'flex-1 overflow-y-auto',
    padded: 'p-5',
  },

  // Flex layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    col: 'flex flex-col',
    row: 'flex flex-row',
    gap2: 'gap-2',
    gap3: 'gap-3',
    gap4: 'gap-4',
  },

  // Grid layouts
  grid: {
    cols2: 'grid grid-cols-2 gap-4',
    cols3: 'grid grid-cols-3 gap-4',
    auto: 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4',
  },
};

// ============================================================================
// AVATAR & PROFILE
// ============================================================================

export const avatar = {
  base: 'rounded-full flex items-center justify-center bg-beacon-primary text-white font-semibold',
  sizes: {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  },
  variants: {
    primary: 'bg-beacon-primary text-white',
    secondary: 'bg-gray-200 text-gray-600',
    outline: 'bg-transparent border-2 border-beacon-primary text-beacon-primary',
  },
};

// ============================================================================
// DIVIDERS
// ============================================================================

export const dividers = {
  horizontal: 'h-px bg-gradient-to-r from-transparent via-black/25 to-transparent',
  horizontalLight: 'h-px bg-gradient-to-r from-transparent via-black/15 to-transparent',
  vertical: 'w-px bg-gray-200',
  solid: 'border-t border-gray-200',
};

// ============================================================================
// UTILITY CLASSES
// ============================================================================

export const utils = {
  // Screen reader only
  srOnly: 'sr-only',

  // Truncate text
  truncate: 'truncate',

  // Line clamp
  lineClamp2: 'line-clamp-2',
  lineClamp3: 'line-clamp-3',

  // Focus visible
  focusVisible: 'focus-visible:outline-2 focus-visible:outline-beacon-primary focus-visible:outline-offset-2',

  // Animations
  animate: {
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    emergencyPulse: 'animate-emergencyPulse',
    beaconPulse: 'animate-beaconPulse',
  },
};
