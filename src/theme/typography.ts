import { TextStyle } from 'react-native';
import { moderateScale } from '../utils/responsive';

/**
 * NeuroPilot Typography System
 * Optimized for ADHD readability:
 * - Large, scannable headers (clear hierarchy reduces cognitive load)
 * - Generous line heights (prevent visual cramping)
 * - System fonts (no font-loading jank)
 */

export const fontSizes = {
  xs: moderateScale(11),
  sm: moderateScale(13),
  base: moderateScale(15),
  md: moderateScale(17),
  lg: moderateScale(20),
  xl: moderateScale(24),
  '2xl': moderateScale(28),
  '3xl': moderateScale(34),
  '4xl': moderateScale(40),
} as const;

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2.0,
} as const;

export const letterSpacings = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 1.5,
} as const;

/** Pre-built text styles for consistent usage across the app */
export const textStyles = {
  // Display
  displayLarge: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  } as TextStyle,

  displayMedium: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  h2: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  h3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  h4: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  } as TextStyle,

  labelMedium: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  } as TextStyle,

  labelSmall: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,

  // Special
  timerDisplay: {
    fontSize: moderateScale(72),
    fontWeight: fontWeights.extrabold,
    lineHeight: moderateScale(72) * lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  } as TextStyle,

  xpDisplay: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,
} as const;
