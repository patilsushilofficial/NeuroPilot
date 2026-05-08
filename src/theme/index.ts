import { darkColors, lightColors, dawnColors, duskColors, ThemeColors } from './colors';
import { textStyles, fontSizes, fontWeights, fontFamilies } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';
import {
  borderWidths,
  iconSizes,
  avatarSizes,
  controlSizes,
  hitSlop,
  opacity,
  durations,
  springs,
  zIndex,
} from './tokens';

export type ThemeMode = 'dark' | 'light' | 'dawn' | 'dusk';

/**
 * Reduced two-value scheme that maps every `ThemeMode` to either `'dark'`
 * or `'light'`. Useful for native components and OS chrome that only
 * understand a binary scheme — `DateTimePicker`'s `themeVariant`,
 * `StatusBar`'s `barStyle`, `TextInput`'s `keyboardAppearance`, etc.
 */
export type ColorScheme = 'dark' | 'light';

/**
 * Source of truth for the `mode` → `colorScheme` mapping. `dusk` reads as
 * dark (deep violets, low brightness); `dawn` reads as light (warm
 * peaches, high brightness).
 */
const COLOR_SCHEME_BY_MODE: Record<ThemeMode, ColorScheme> = {
  dark: 'dark',
  dusk: 'dark',
  light: 'light',
  dawn: 'light',
};

export const getColorScheme = (mode: ThemeMode): ColorScheme =>
  COLOR_SCHEME_BY_MODE[mode];

export interface Theme {
  mode: ThemeMode;
  /** Reduced light/dark classification — see {@link ColorScheme}. */
  colorScheme: ColorScheme;
  colors: ThemeColors;
  text: typeof textStyles;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  fontFamilies: typeof fontFamilies;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  borderWidths: typeof borderWidths;
  iconSizes: typeof iconSizes;
  avatarSizes: typeof avatarSizes;
  controlSizes: typeof controlSizes;
  hitSlop: typeof hitSlop;
  opacity: typeof opacity;
  durations: typeof durations;
  springs: typeof springs;
  zIndex: typeof zIndex;
  shadows: typeof shadows;
  layout: typeof layout;
}

const buildTheme = (mode: ThemeMode): Theme => ({
  mode,
  colorScheme: getColorScheme(mode),
  colors:
    mode === 'dark' ? darkColors :
    mode === 'dawn' ? dawnColors :
    mode === 'dusk' ? duskColors :
    lightColors,
  text: textStyles,
  fontSizes,
  fontWeights,
  fontFamilies,
  spacing,
  borderRadius,
  borderWidths,
  iconSizes,
  avatarSizes,
  controlSizes,
  hitSlop,
  opacity,
  durations,
  springs,
  zIndex,
  shadows,
  layout,
});

export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');
export const dawnTheme = buildTheme('dawn');
export const duskTheme = buildTheme('dusk');

export {
  darkColors,
  lightColors,
  dawnColors,
  duskColors,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  layout,
  fontSizes,
  fontWeights,
  fontFamilies,
  borderWidths,
  iconSizes,
  avatarSizes,
  controlSizes,
  hitSlop,
  opacity,
  durations,
  springs,
  zIndex,
};
export type { ThemeColors };
