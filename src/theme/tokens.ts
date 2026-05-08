import { StyleSheet } from 'react-native';
import { moderateScale } from '../utils/responsive';

/**
 * NeuroPilot Design Tokens
 *
 * Centralized, scaled, semantic primitives for visual styling.
 *
 * Rule of thumb: every numeric style value (`borderWidth`, `width`, `height`,
 * `fontSize`, `padding`, `margin`, `gap`, `top`/`bottom`/`left`/`right`,
 * `lineHeight`, etc.) must come from a token unless it's a percentage,
 * a runtime-computed value, or an animation interim. If you need a value
 * that isn't here, add it here first.
 *
 * All sizes go through `moderateScale` so the layout adapts gracefully
 * across device widths instead of rendering at iPhone-12-class proportions
 * everywhere.
 */

/**
 * Stroke widths for borders / dividers.
 * `hairline` is the platform's true 1-physical-pixel value (~0.5pt on @2x).
 */
export const borderWidths = {
  none: 0,
  hairline: StyleSheet.hairlineWidth,
  thin: moderateScale(1),
  base: moderateScale(1.5),
  thick: moderateScale(2),
  extraThick: moderateScale(3),
} as const;

/**
 * Standalone glyph sizes for emoji <Text> and inline icons.
 * Use these for `fontSize` of an icon-only Text node.
 */
export const iconSizes = {
  xs: moderateScale(11),
  sm: moderateScale(13),
  md: moderateScale(16),
  lg: moderateScale(20),
  xl: moderateScale(24),
  '2xl': moderateScale(28),
  '3xl': moderateScale(32),
  '4xl': moderateScale(40),
  '5xl': moderateScale(48),
  '6xl': moderateScale(56),
  '7xl': moderateScale(72),
} as const;

/**
 * Square avatar sizes / large profile pictures.
 * Pair `width: avatarSizes.md` with `height: avatarSizes.md`.
 */
export const avatarSizes = {
  xs: moderateScale(24),
  sm: moderateScale(32),
  md: moderateScale(44),
  lg: moderateScale(56),
  xl: moderateScale(72),
  '2xl': moderateScale(96),
  '3xl': moderateScale(120),
} as const;

/**
 * Heights / dimensions for interactive controls. These keep tap targets
 * comfortably above the 44pt accessibility floor on every device.
 */
export const controlSizes = {
  buttonHeight: {
    sm: moderateScale(36),
    md: moderateScale(44),
    lg: moderateScale(52),
  },
  inputHeight: {
    sm: moderateScale(40),
    md: moderateScale(48),
    lg: moderateScale(56),
  },
  pillHeight: moderateScale(28),
  toggleWidth: moderateScale(40),
  toggleHeight: moderateScale(24),
  toggleThumb: moderateScale(18),
  toggleThumbTravel: moderateScale(14),
  fab: moderateScale(56),
  tabIcon: moderateScale(36),
  emojiCircle: moderateScale(80),
  emojiChip: moderateScale(48),
  colorDot: moderateScale(32),
  presetCard: moderateScale(120),
  pomodoroDot: moderateScale(10),
  shieldIcon: moderateScale(52),
} as const;

/** Hit slop presets to expand small tap targets to a comfortable size. */
export const hitSlop = {
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
  md: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

/** Opacity scale for interactive states / disabled UI / glass surfaces. */
export const opacity = {
  none: 0,
  disabled: 0.4,
  ghost: 0.6,
  pressed: 0.7,
  hover: 0.85,
  full: 1,
} as const;

/** Animation durations in milliseconds. */
export const durations = {
  instant: 0,
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
  long: 1000,
} as const;

/** Spring presets for react-native-reanimated. */
export const springs = {
  gentle: { damping: 15, stiffness: 150 },
  standard: { damping: 15, stiffness: 300 },
  snappy: { damping: 12, stiffness: 400 },
  bouncy: { damping: 8, stiffness: 200 },
} as const;

/** Stacking order — keep all custom z-indexes here so layering stays sane. */
export const zIndex = {
  base: 0,
  raised: 1,
  sticky: 5,
  overlay: 10,
  drawer: 50,
  modal: 100,
  toast: 1000,
} as const;
