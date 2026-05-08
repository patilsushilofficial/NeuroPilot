import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { TabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FocusScreen } from '../screens/focus/FocusScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { TasksNavigator } from './stacks/TasksNavigator';
import { HabitsNavigator } from './stacks/HabitsNavigator';
import { SettingsNavigator } from './stacks/SettingsNavigator';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTabBarPress } from '../hooks/useTabBarPress';
import { useFocusTabBadge } from '../hooks/useFocusTabBadge';
import { TAB_ITEMS, TabItem } from '../constants/tabBar';
import { Theme } from '../theme';
import { spacing, shadows } from '../theme/spacing';
import {
  borderWidths,
  iconSizes,
  opacity,
  springs,
} from '../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import { moderateScale } from '../utils/responsive';

const ACTIVE_PILL_HEIGHT = moderateScale(4);
const ACTIVE_PILL_WIDTH = moderateScale(36);

const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  item: TabItem;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ item, focused }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const scale = useSharedValue(focused ? 1.15 : 1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, springs.gentle);
  }, [focused]);

  return (
    <Animated.View style={[styles.tabIcon, animStyle]}>
      <Text style={styles.tabEmoji}>{focused ? item.activeEmoji : item.emoji}</Text>
      <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
        {item.label}
      </Text>
    </Animated.View>
  );
};

/**
 * Custom tab bar — flat, visible, labeled.
 * ADHD principle: consistent navigation, no hidden icons.
 */
function CustomTabBar({ state, navigation }: any) {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { getOnPress } = useTabBarPress({ navigation });

  // Bottom inset is device-dependent so it's pulled out of the stylesheet,
  // but pre-baked once per inset value to avoid per-render allocations.
  const tabBarInsetStyle = useMemo<ViewStyle>(
    () => ({ paddingBottom: Math.max(insets.bottom, spacing.xs) }),
    [insets.bottom]
  );

  return (
    <View style={[styles.tabBar, tabBarInsetStyle]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const item = TAB_ITEMS.find((t) => t.name === route.name);

        if (!item) return null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={item.label}
            onPress={getOnPress(route.key, route.name, isFocused)}
            style={styles.tabButton}
            activeOpacity={opacity.pressed}
          >
            {isFocused && <View style={styles.activePill} />}
            <TabIcon item={item} focused={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const renderTabBar = (props: any) => <CustomTabBar {...props} />;
const TAB_NAVIGATOR_OPTIONS = { headerShown: false };
const HIDDEN_TAB_OPTIONS = { tabBarButton: () => null };

export const TabNavigator: React.FC = () => {
  const focusOptions = useFocusTabBadge();

  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={TAB_NAVIGATOR_OPTIONS}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="TasksTab" component={TasksNavigator} />
      <Tab.Screen name="Focus" component={FocusScreen} options={focusOptions} />
      <Tab.Screen name="HabitsTab" component={HabitsNavigator} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} options={HIDDEN_TAB_OPTIONS} />
    </Tab.Navigator>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      borderTopWidth: borderWidths.hairline,
      paddingTop: spacing.xs,
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.border,
      ...shadows.md,
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      position: 'relative',
      paddingVertical: spacing['3xs'],
    },
    activePill: {
      position: 'absolute',
      top: -ACTIVE_PILL_HEIGHT,
      width: ACTIVE_PILL_WIDTH,
      height: ACTIVE_PILL_HEIGHT,
      borderRadius: ACTIVE_PILL_HEIGHT / 2,
      backgroundColor: theme.colors.primaryContainer,
    },
    tabIcon: {
      alignItems: 'center',
      gap: spacing['3xs'],
    },
    tabEmoji: { fontSize: iconSizes.lg },
    tabLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.tight,
    },
    tabLabelActive: { color: theme.colors.primary },
    tabLabelInactive: { color: theme.colors.textTertiary },
  });
