import { darkColors, lightColors, dawnColors, duskColors, ThemeColors } from './colors';
import { textStyles, fontSizes, fontWeights } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';

export type ThemeMode = 'dark' | 'light' | 'dawn' | 'dusk';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  text: typeof textStyles;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  layout: typeof layout;
}

const buildTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors:
    mode === 'dark' ? darkColors :
    mode === 'dawn' ? dawnColors :
    mode === 'dusk' ? duskColors :
    lightColors,
  text: textStyles,
  fontSizes,
  fontWeights,
  spacing,
  borderRadius,
  shadows,
  layout,
});

export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');
export const dawnTheme = buildTheme('dawn');
export const duskTheme = buildTheme('dusk');

export { darkColors, lightColors, dawnColors, duskColors, textStyles, spacing, borderRadius, shadows, layout, fontSizes, fontWeights };
export type { ThemeColors };
