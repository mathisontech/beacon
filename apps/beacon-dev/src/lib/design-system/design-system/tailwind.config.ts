/**
 * Beacon Design System - Tailwind CSS Configuration
 *
 * This configuration extends Tailwind CSS with Beacon's design tokens.
 * Other Beacon apps can extend this configuration to ensure consistency.
 *
 * Usage in your app's tailwind.config.ts:
 * ```
 * import beaconPreset from '@beacon/design-system/tailwind.config';
 *
 * export default {
 *   presets: [beaconPreset],
 *   content: ['./src/**\/*.{js,ts,jsx,tsx}'],
 * };
 * ```
 */

import type { Config } from 'tailwindcss';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  animations,
} from './tokens';

const config: Config = {
  content: [],
  theme: {
    extend: {
      // ========================================
      // COLORS
      // ========================================
      colors: {
        // Brand colors
        beacon: {
          primary: colors.beacon.primary,
          primaryHover: colors.beacon.primaryHover,
          primaryLight: colors.beacon.primaryLight,
          primaryLighter: colors.beacon.primaryLighter,
          navy: colors.beacon.navy,
          navyHover: colors.beacon.navyHover,
          navyLight: colors.beacon.navyLight,
        },

        // Status colors
        status: {
          success: colors.status.success,
          successDark: colors.status.successDark,
          successDarker: colors.status.successDarker,
          successDarkest: colors.status.successDarkest,
          successMuted: colors.status.successMuted,
          successLight: colors.status.successLight,
          successLighter: colors.status.successLighter,
          successBorder: colors.status.successBorder,
          successBorderLight: colors.status.successBorderLight,
          successText: colors.status.successText,
          successTextLight: colors.status.successTextLight,

          error: colors.status.error,
          errorDark: colors.status.errorDark,
          errorDarker: colors.status.errorDarker,
          errorDarkest: colors.status.errorDarkest,
          errorLight: colors.status.errorLight,
          errorLighter: colors.status.errorLighter,
          errorBorder: colors.status.errorBorder,
          errorText: colors.status.errorText,
          errorMid: colors.status.errorMid,

          warning: colors.status.warning,
          warningDark: colors.status.warningDark,
          warningDarker: colors.status.warningDarker,
          warningLight: colors.status.warningLight,
          warningText: colors.status.warningText,

          info: colors.status.info,
          infoDark: colors.status.infoDark,
          infoDarker: colors.status.infoDarker,
          infoLight: colors.status.infoLight,
        },

        // Neutral scale
        neutral: colors.neutral,

        // Semantic color aliases
        text: colors.text,
        background: colors.background,
        border: colors.border,
      },

      // ========================================
      // TYPOGRAPHY
      // ========================================
      fontFamily: {
        sans: typography.fonts.sans,
        mono: typography.fonts.mono,
      },

      fontSize: {
        '2xs': typography.sizes['2xs'],
        xs: typography.sizes.xs,
        sm: typography.sizes.sm,
        'sm-md': typography.sizes['sm-md'],
        md: typography.sizes.md,
        base: typography.sizes.base,
        lg: typography.sizes.lg,
        xl: typography.sizes.xl,
        '2xl': typography.sizes['2xl'],
        '3xl': typography.sizes['3xl'],
      },

      fontWeight: {
        light: String(typography.weights.light),
        normal: String(typography.weights.normal),
        medium: String(typography.weights.medium),
        semibold: String(typography.weights.semibold),
        bold: String(typography.weights.bold),
      },

      lineHeight: {
        tight: String(typography.lineHeights.tight),
        snug: String(typography.lineHeights.snug),
        normal: String(typography.lineHeights.normal),
        relaxed: String(typography.lineHeights.relaxed),
      },

      letterSpacing: typography.letterSpacing,

      // ========================================
      // SPACING
      // ========================================
      spacing: {
        px: spacing.px,
        '0': spacing[0],
        '0.5': spacing[0.5],
        '1': spacing[1],
        '1.5': spacing[1.5],
        '2': spacing[2],
        '2.5': spacing[2.5],
        '3': spacing[3],
        '3.5': spacing[3.5],
        '4': spacing[4],
        '5': spacing[5],
        '6': spacing[6],
        '7': spacing[7],
        '8': spacing[8],
        '9': spacing[9],
        '10': spacing[10],
        '11': spacing[11],
        '12': spacing[12],
        '14': spacing[14],
        '16': spacing[16],
        '20': spacing[20],
        '24': spacing[24],
        '28': spacing[28],
        '32': spacing[32],
      },

      // ========================================
      // BORDER RADIUS
      // ========================================
      borderRadius: {
        none: borderRadius.none,
        sm: borderRadius.sm,
        DEFAULT: borderRadius.default,
        md: borderRadius.md,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        '2xl': borderRadius['2xl'],
        full: borderRadius.full,
        circle: borderRadius.circle,
      },

      // ========================================
      // BOX SHADOWS
      // ========================================
      boxShadow: {
        none: shadows.none,
        xs: shadows.xs,
        sm: shadows.sm,
        DEFAULT: shadows.default,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        '2xl': shadows['2xl'],
        inner: shadows.inner,
        innerMd: shadows.innerMd,
        focus: shadows.focus,
        focusError: shadows.focusError,
        emergency: shadows.emergency,
        button: shadows.button,
        buttonHover: shadows.buttonHover,
        card: shadows.card,
        cardHover: shadows.cardHover,
        cardLifted: shadows.cardLifted,
        modal: shadows.modal,
        fab: shadows.fab,
        fabHover: shadows.fabHover,
      },

      // ========================================
      // Z-INDEX
      // ========================================
      zIndex: {
        base: String(zIndex.base),
        dropdown: String(zIndex.dropdown),
        sticky: String(zIndex.sticky),
        fixed: String(zIndex.fixed),
        overlay: String(zIndex.overlay),
        modal: String(zIndex.modal),
        popover: String(zIndex.popover),
        tooltip: String(zIndex.tooltip),
        toast: String(zIndex.toast),
        emergency: String(zIndex.emergency),
        max: String(zIndex.max),
      },

      // ========================================
      // TRANSITIONS
      // ========================================
      transitionDuration: {
        fast: transitions.duration.fast,
        DEFAULT: transitions.duration.default,
        slow: transitions.duration.slow,
        slower: transitions.duration.slower,
      },

      transitionTimingFunction: {
        DEFAULT: transitions.timing.default,
        in: transitions.timing.in,
        out: transitions.timing.out,
        'in-out': transitions.timing.inOut,
      },

      // ========================================
      // SCREENS (BREAKPOINTS)
      // ========================================
      screens: {
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        '2xl': breakpoints['2xl'],
      },

      // ========================================
      // ANIMATIONS
      // ========================================
      keyframes: {
        spin: animations.keyframes.spin,
        pulse: animations.keyframes.pulse,
        emergencyPulse: animations.keyframes.emergencyPulse,
        beaconPulse: animations.keyframes.beaconPulse,
        alertPulse: animations.keyframes.alertPulse,
      },

      animation: {
        spin: `spin ${animations.durations.spin} linear infinite`,
        pulse: `pulse ${animations.durations.pulse} ease-in-out infinite`,
        emergencyPulse: `emergencyPulse ${animations.durations.emergencyPulse} ease-in-out infinite`,
        beaconPulse: `beaconPulse ${animations.durations.beaconPulse} infinite`,
        alertPulse: `alertPulse 2s ease-in-out infinite alternate`,
      },

      // ========================================
      // BACKDROP BLUR
      // ========================================
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '10px',
        lg: '16px',
      },
    },
  },

  plugins: [],
};

export default config;
