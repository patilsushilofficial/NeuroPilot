import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { TabBarItem } from './TabBarItem';
import { TAB_ITEMS } from '../constants/tabBar';
import { useAppTheme } from '../hooks/useAppTheme';
import { useIsFocusRunning } from '../hooks/useIsFocusRunning';
import { useTabBarPress } from '../hooks/useTabBarPress';
import { Theme } from '../theme';
import { spacing, shadows } from '../theme/spacing';

// React Navigation's `BottomTabBarProps` carries a few fields the custom
// bar doesn't actually need (`descriptors`, `insets`). Pulling the props
// off RN's type means we stay compatible with whatever it sends without
// re-declaring its emit/navigate signatures by hand (those are generic
// and easy to drift away from).
type CustomTabBarProps = Pick<BottomTabBarProps, 'state' | 'navigation'>;

/**
 * Custom bottom tab bar — composition + state read.
 *
 * The bar is the *only* layer that reaches into the store (for the
 * focus-running cue) and into navigation (via `useTabBarPress`). Each
 * `TabBarItem` stays purely presentational and gets handed a precomputed
 * `onPress` plus the cue flags it needs.
 *
 * Layout choices:
 *  - Full-width footprint preserves the bottom-spacer math the screens
 *    already do (`spacing['4xl']`); a floating/inset bar would silently
 *    hide content under itself on every screen.
 *  - `cardElevated` background + a soft upward shadow visually lift the
 *    bar above the page without a hard top border.
 *  - The safe-area inset is applied via inline style so the stylesheet
 *    stays a pure function of the theme.
 */
export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  navigation,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { getOnPress } = useTabBarPress({ navigation });
  const isFocusRunning = useIsFocusRunning();

  const tabBarInsetStyle = useMemo<ViewStyle>(
    () => ({ paddingBottom: Math.max(insets.bottom, spacing.xs) }),
    [insets.bottom]
  );

  return (
    <View style={[styles.tabBar, tabBarInsetStyle]}>
      {state.routes.map((route, index) => {
        const item = TAB_ITEMS.find((t) => t.name === route.name);
        if (!item) return null;

        const isFocused = state.index === index;
        return (
          <TabBarItem
            key={route.key}
            item={item}
            focused={isFocused}
            onPress={getOnPress(route.key, route.name, isFocused)}
            showRunningIndicator={item.name === 'Focus' && isFocusRunning}
          />
        );
      })}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingTop: spacing.sm,
      paddingHorizontal: spacing['2xs'],
      backgroundColor: theme.colors.cardElevated,
      // Soft upward shadow lifts the bar off the screen content without a
      // hard top border (which read as a divider in the old design and
      // clashed with the rounded card surfaces above).
      ...shadows.md,
      shadowOffset: { width: 0, height: -4 },
    },
  });
