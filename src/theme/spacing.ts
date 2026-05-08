import { moderateScale } from '../utils/responsive';

/**
 * NeuroPilot Spacing System — 8pt grid
 * Consistent spatial rhythm reduces cognitive dissonance in layout scanning.
 */

export const spacing = {
  px: 1,
  0.5: moderateScale(4),
  1: moderateScale(8),
  1.5: moderateScale(12),
  2: moderateScale(16),
  2.5: moderateScale(20),
  3: moderateScale(24),
  3.5: moderateScale(28),
  4: moderateScale(32),
  5: moderateScale(40),
  6: moderateScale(48),
  7: moderateScale(56),
  8: moderateScale(64),
  10: moderateScale(80),
  12: moderateScale(96),
  16: moderateScale(128),
} as const;

export const borderRadius = {
  none: 0,
  sm: moderateScale(6),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(32),
  full: 9999,
} as const;

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#050D14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#050D14',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;

export const layout = {
  screenPaddingH: spacing[2],
  screenPaddingV: spacing[2],
  tabBarHeight: 72,
  headerHeight: 56,
  cardGap: spacing[1.5],
  sectionGap: spacing[3],
} as const;
