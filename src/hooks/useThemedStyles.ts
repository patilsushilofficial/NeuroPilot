import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Theme } from '../theme';
import { useAppTheme } from './useAppTheme';

/**
 * Builds a memoized `StyleSheet` from a theme-aware factory.
 *
 * This is the project-wide replacement for inline `style={{ ... }}` objects:
 * declare your styles once at module load, get them recomputed only when the
 * `Theme` reference changes (i.e. when the user switches modes), and keep the
 * JSX free of allocation churn.
 *
 * @example
 *   const styles = useThemedStyles(makeStyles);
 *   // ...
 *   const makeStyles = (theme: Theme) => StyleSheet.create({
 *     container: { backgroundColor: theme.colors.background },
 *   });
 */
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: Theme) => T
): T => {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [theme, factory]);
};
