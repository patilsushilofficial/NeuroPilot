import { TextStyle } from 'react-native';
import { moderateScale } from '../utils/responsive';

/**
 * NeuroPilot Typography System
 * Optimized for ADHD readability:
 * - Large, scannable headers (clear hierarchy reduces cognitive load)
 * - Generous line heights (prevent visual cramping)
 * - Lexend font (proven to improve reading proficiency, especially for
 *   readers with dyslexia / attention difficulties)
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

/**
 * Lexend variants — each weight is shipped as a separately-named TTF.
 * Using an explicit family per weight avoids Android's automatic
 * weight synthesis (which produces blurry/distorted glyphs).
 */
export const fontFamilies = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
  extrabold: 'Lexend_800ExtraBold',
} as const;

/** Default font family for any `<Text>` that doesn't specify its own. */
export const defaultFontFamily = fontFamilies.regular;

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
    fontFamily: fontFamilies.extrabold,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  } as TextStyle,

  displayMedium: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  // Headings
  h1: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,

  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.xl * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  h3: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  h4: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  } as TextStyle,

  labelMedium: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  } as TextStyle,

  labelSmall: {
    fontFamily: fontFamilies.semibold,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,

  // Special
  timerDisplay: {
    fontFamily: fontFamilies.extrabold,
    fontSize: moderateScale(72),
    fontWeight: fontWeights.extrabold,
    lineHeight: moderateScale(72) * lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  } as TextStyle,

  xpDisplay: {
    fontFamily: fontFamilies.extrabold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  } as TextStyle,
} as const;
