/**
 * NeuroPilot Color System
 * Neuro-inclusive palette: muted, calming tones that avoid sensory overload.
 * Designed per ADHD UX research — no harsh saturations, clear visual hierarchy.
 */

export const palette = {
  // Brand
  violet50: '#F3F1FF',
  violet100: '#E9E5FF',
  violet200: '#D6CFFE',
  violet300: '#B8ADFD',
  violet400: '#9585FA',
  violet500: '#7B6CF6', // Primary brand
  violet600: '#6355E2',
  violet700: '#5244C8',
  violet800: '#4337A8',
  violet900: '#2D2470',

  // Teal (Secondary / Flow state)
  teal50: '#EDFAFA',
  teal100: '#D5F5F5',
  teal200: '#AAEAEA',
  teal300: '#7DDCDC',
  teal400: '#4ECDC4', // Secondary brand
  teal500: '#38B2AC',
  teal600: '#2C9A94',
  teal700: '#20807B',
  teal800: '#166762',
  teal900: '#0D4E4A',

  // Coral (Alert / Urgent)
  coral50: '#FFF5F5',
  coral100: '#FFE8E8',
  coral200: '#FFCFCF',
  coral300: '#FFABAB',
  coral400: '#FF7F7F',
  coral500: '#FF6B6B', // Urgent/Error
  coral600: '#E85555',
  coral700: '#CC3E3E',
  coral800: '#A82B2B',
  coral900: '#7A1E1E',

  // Amber (Warning)
  amber50: '#FFFBEB',
  amber100: '#FEF3C7',
  amber200: '#FDE68A',
  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Green (Success / Completion)
  green50: '#F0FFF4',
  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E', // Success
  green600: '#16A34A',

  // Neutrals Dark
  dark0: '#0D0D1A',   // Background
  dark1: '#12121F',   // Surface
  dark2: '#16162A',   // Card
  dark3: '#1E1E38',   // Card elevated
  dark4: '#26264A',   // Border
  dark5: '#333360',   // Divider

  // Neutrals Light
  light0: '#F7F6FF',  // Background
  light1: '#F0EFFE',  // Surface
  light2: '#E8E5FF',  // Card
  light3: '#DDDAFF',  // Card elevated
  light4: '#C8C4F0',  // Border
  light5: '#B0ABDE',  // Divider

  // Text
  textPrimaryDark: '#F0EFFE',
  textSecondaryDark: '#9B96C8',
  textTertiaryDark: '#5E5A88',
  textDisabledDark: '#3D3A60',

  textPrimaryLight: '#1A1A2E',
  textSecondaryLight: '#4A4A70',
  textTertiaryLight: '#7A7A9A',
  textDisabledLight: '#ABABC0',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type PaletteKey = keyof typeof palette;

/** Dark theme semantic tokens — Deep Navy × Teal gradient */
export const darkColors = {
  background: '#091520',   // Deep navy-black (top of gradient)
  surface: '#0D1F30',      // Slightly lighter navy
  card: '#112840',         // Mid navy with teal hint
  cardElevated: '#163350', // Elevated card — teal-navy
  border: '#1E4060',       // Subtle teal-navy border
  divider: '#172E45',      // Thin divider

  primary: '#2A9DB5',      // Bright teal — primary actions
  primaryLight: '#5BBFCF',
  primaryDark: '#1A7A8C',
  primaryContainer: 'rgba(42, 157, 181, 0.15)',

  secondary: '#4DD9E0',    // Lighter cyan accent
  secondaryLight: '#8EEEF3',
  secondaryDark: '#2AACB8',
  secondaryContainer: 'rgba(77, 217, 224, 0.15)',

  error: '#FF5252',
  errorContainer: 'rgba(255, 82, 82, 0.15)',
  warning: '#FFB74D',
  warningContainer: 'rgba(255, 183, 77, 0.15)',
  success: '#4DD9A0',      // Teal-green success
  successContainer: 'rgba(77, 217, 160, 0.15)',

  textPrimary: '#E8F4F8',        // Soft ice-white
  textSecondary: '#A8CBDA',      // Muted teal-white
  textTertiary: '#5E8FA8',       // Dimmed teal
  textDisabled: '#2E5A70',       // Very muted
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#091520',

  // Feature-specific
  focusTimer: '#4DD9E0',
  habitActive: '#2A9DB5',
  taskHighPriority: '#FF5252',
  taskMediumPriority: '#FFB74D',
  taskLowPriority: '#4DD9A0',
  xpBar: '#2A9DB5',
  streakFire: '#FFB74D',
} as const;

/** Light theme semantic tokens */
export const lightColors = {
  background: '#F2F2F7', // iOS Grouped Background
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: '#E5E5EA',
  divider: '#C6C6C8',

  primary: '#6A1B9A', // Deep Purple
  primaryLight: '#9C4DCC',
  primaryDark: '#38006B',
  primaryContainer: 'rgba(106, 27, 154, 0.1)',

  secondary: '#00B8D4', // Deep Cyan
  secondaryLight: '#62EBFF',
  secondaryDark: '#008BA3',
  secondaryContainer: 'rgba(0, 184, 212, 0.1)',

  error: '#FF3B30',
  errorContainer: 'rgba(255, 59, 48, 0.1)',
  warning: '#FF9F0A',
  warningContainer: 'rgba(255, 159, 10, 0.1)',
  success: '#34C759',
  successContainer: 'rgba(52, 199, 89, 0.1)',

  textPrimary: '#000000',
  textSecondary: '#3C3C4399', // iOS light secondary
  textTertiary: '#3C3C434D',
  textDisabled: '#3C3C432E',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  focusTimer: '#6A1B9A',
  habitActive: '#00B8D4',
  taskHighPriority: '#FF3B30',
  taskMediumPriority: '#FF9F0A',
  taskLowPriority: '#34C759',
  xpBar: '#6A1B9A',
  streakFire: '#FF9F0A',
} as const;

export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

/**
 * Dawn theme (06:00–11:59) — Warm, soft sunrise palette.
 * Gentle on the eyes when users are just waking up.
 */
export const dawnColors: ThemeColors = {
  background: '#FFF8F0',   // Warm off-white sunrise
  surface: '#FFF0E0',
  card: '#FFFFFF',
  cardElevated: '#FEF3E8',
  border: '#F0D9C8',
  divider: '#E8CBBA',

  primary: '#E8761A',      // Warm amber-orange sunrise
  primaryLight: '#F5A55E',
  primaryDark: '#C05A0A',
  primaryContainer: 'rgba(232, 118, 26, 0.12)',

  secondary: '#D4439A',    // Rosy morning pink
  secondaryLight: '#E87DBE',
  secondaryDark: '#A8207A',
  secondaryContainer: 'rgba(212, 67, 154, 0.12)',

  error: '#D93025',
  errorContainer: 'rgba(217, 48, 37, 0.1)',
  warning: '#E8760A',
  warningContainer: 'rgba(232, 118, 10, 0.12)',
  success: '#2E7D32',
  successContainer: 'rgba(46, 125, 50, 0.1)',

  textPrimary: '#2D1A0E',
  textSecondary: '#6B4230CC',
  textTertiary: '#6B42307A',
  textDisabled: '#6B423040',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  focusTimer: '#E8761A',
  habitActive: '#D4439A',
  taskHighPriority: '#D93025',
  taskMediumPriority: '#E8760A',
  taskLowPriority: '#2E7D32',
  xpBar: '#E8761A',
  streakFire: '#E8760A',
};

/**
 * Dusk theme (18:00–20:59) — Deep teal-navy twilight palette.
 * A warmer, richer variant of the navy theme for evening wind-down.
 */
export const duskColors: ThemeColors = {
  background: '#060F1A',   // Deepest navy twilight
  surface: '#0A1828',
  card: '#0E2035',
  cardElevated: '#122642',
  border: '#1A3550',
  divider: '#112840',

  primary: '#C77DFF',      // Soft violet dusk accent
  primaryLight: '#E0B3FF',
  primaryDark: '#9B51D4',
  primaryContainer: 'rgba(199, 125, 255, 0.15)',

  secondary: '#4DD9E0',    // Teal-cyan consistent with brand
  secondaryLight: '#8EEEF3',
  secondaryDark: '#2AACB8',
  secondaryContainer: 'rgba(77, 217, 224, 0.15)',

  error: '#FF5252',
  errorContainer: 'rgba(255, 82, 82, 0.15)',
  warning: '#FFB74D',
  warningContainer: 'rgba(255, 183, 77, 0.15)',
  success: '#4DD9A0',
  successContainer: 'rgba(77, 217, 160, 0.15)',

  textPrimary: '#DDE8F0',
  textSecondary: '#8AAFC4CC',
  textTertiary: '#4E7A95AA',
  textDisabled: '#2A5070',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#091520',

  focusTimer: '#C77DFF',
  habitActive: '#4DD9E0',
  taskHighPriority: '#FF5252',
  taskMediumPriority: '#FFB74D',
  taskLowPriority: '#4DD9A0',
  xpBar: '#C77DFF',
  streakFire: '#FFB74D',
};
