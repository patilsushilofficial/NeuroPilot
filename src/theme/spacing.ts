import { moderateScale } from '../utils/responsive';

/**
 * NeuroPilot Spacing System — 4pt grid, t-shirt-sized.
 *
 * Every value is run through `moderateScale` so layouts stay proportional
 * across device widths instead of locking to a single mockup width.
 *
 * Naming follows the t-shirt convention used by Tailwind, Chakra, and
 * Radix — readers immediately understand the relative size from the key:
 *
 *   spacing.xs  <  spacing.sm  <  spacing.md  <  spacing.lg  <  spacing.xl
 *                                                                <  spacing['2xl']
 *
 * `none` (0) and `hairline` (1) are used for resets and crisp dividers,
 * the `Nxl` tier exists for screen-level gutters that genuinely need it
 * (modal insets, onboarding hero gaps). Prefer reusing existing tokens
 * over fabricating new sizes — drift here means drift everywhere.
 */
export const spacing = {
  /** 0 — collapse a margin or zero a default padding. */
  none: 0,
  /** 1px — hairline rules (dividers, fine borders). Not scaled. */
  hairline: 1,
  /** 2 — micro adjustment, tight chips, half-step inside compact rows. */
  '3xs': moderateScale(2),
  /** 4 — minimal gap (e.g. emoji ↔ text inside a badge). */
  '2xs': moderateScale(4),
  /** 8 — small gap, dense lists. */
  xs: moderateScale(8),
  /** 12 — compact card padding, between meta items. */
  sm: moderateScale(12),
  /** 16 — DEFAULT card / screen padding. Reach for this first. */
  md: moderateScale(16),
  /** 20 — generous internal padding. */
  lg: moderateScale(20),
  /** 24 — section-internal padding, between groups in a card. */
  xl: moderateScale(24),
  /** 28 — between groups inside a screen. */
  '2xl': moderateScale(28),
  /** 32 — between major blocks. */
  '3xl': moderateScale(32),
  /** 40 — large gap between sections. */
  '4xl': moderateScale(40),
  /** 48 — top-of-screen offset, header drop. */
  '5xl': moderateScale(48),
  /** 56 — hero spacing inside a card. */
  '6xl': moderateScale(56),
  /** 64 — extra-large hero spacing. */
  '7xl': moderateScale(64),
  /** 80 — modal/screen vertical inset. */
  '8xl': moderateScale(80),
  /** 96 — onboarding hero gap. */
  '9xl': moderateScale(96),
  /** 128 — empty-state mascot frame. */
  '10xl': moderateScale(128),
} as const;

/**
 * Corner-radius scale.
 *
 *   borderRadius.sm  <  borderRadius.md  <  borderRadius.lg  <  borderRadius.xl
 *                                                                <  borderRadius['2xl']
 *
 * `full` is a sentinel value for pill-shaped elements (chips, FABs).
 */
export const borderRadius = {
  /** 0 — sharp corner. */
  none: 0,
  /** 6 — input fields, small chips. */
  sm: moderateScale(6),
  /** 12 — compact buttons, badges. */
  md: moderateScale(12),
  /** 16 — list rows, segmented controls. */
  lg: moderateScale(16),
  /** 20 — primary buttons, secondary cards. */
  xl: moderateScale(20),
  /** 24 — DEFAULT card radius. */
  '2xl': moderateScale(24),
  /** 32 — hero cards, modals. */
  '3xl': moderateScale(32),
  /** Pill / circle. Use a number > maxDimension to guarantee fully round. */
  full: 9999,
} as const;

/**
 * Drop-shadow + elevation presets, matched in pairs so iOS and Android
 * read the same depth.
 *
 *   shadows.sm   ←  resting cards
 *   shadows.md   ←  elevated cards (mid-level surfaces)
 *   shadows.lg   ←  modals / sheets
 *   shadows.glow ←  accent glow tinted by a caller-supplied colour
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#091520',
    shadowOffset: { width: 0, height: moderateScale(2) },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  md: {
    shadowColor: '#050D14',
    shadowOffset: { width: 0, height: moderateScale(8) },
    shadowOpacity: 0.6,
    shadowRadius: moderateScale(24),
    elevation: 6,
  },
  lg: {
    shadowColor: '#050D14',
    shadowOffset: { width: 0, height: moderateScale(16) },
    shadowOpacity: 0.7,
    shadowRadius: moderateScale(32),
    elevation: 10,
  },
  /**
   * Accent glow shadow tinted by the caller. Used to cue an active state
   * (e.g. focus shield, achievement card).
   */
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(16),
    elevation: 8,
  }),
} as const;

/**
 * Layout-level constants — the dimensions and gutters that frame an
 * entire screen. Keys are spelled-out (no `H` / `V` abbreviations) so
 * a reader never has to guess what an axis suffix means.
 */
export const layout = {
  /** Default left/right inset of a screen body. */
  screenPaddingHorizontal: spacing.md,
  /** Default top/bottom inset of a screen body. */
  screenPaddingVertical: spacing.md,
  /** Custom tab-bar height. */
  tabBarHeight: moderateScale(72),
  /** Default header height. */
  headerHeight: moderateScale(56),
  /** Vertical gap between cards in a feed. */
  cardGap: spacing.sm,
  /** Vertical gap between top-level sections on a screen. */
  sectionGap: spacing.xl,
} as const;
