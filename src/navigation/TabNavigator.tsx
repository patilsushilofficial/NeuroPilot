import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TasksNavigator } from './stacks/TasksNavigator';
import { HabitsNavigator } from './stacks/HabitsNavigator';
import { SettingsNavigator } from './stacks/SettingsNavigator';
import { useAppTheme } from '../hooks/useAppTheme';
import { useHaptics } from '../hooks/useHaptics';
import { useAppStore } from '../store';
import { spacing, borderRadius, shadows } from '../theme/spacing';

const Tab = createBottomTabNavigator<TabParamList>();

type TabItem = {
  name: keyof TabParamList;
  label: string;
  emoji: string;
  activeEmoji: string;
};

const TAB_ITEMS: TabItem[] = [
  { name: 'Home', label: 'Home', emoji: '🏠', activeEmoji: '🏠' },
  { name: 'TasksTab', label: 'Tasks', emoji: '📋', activeEmoji: '📋' },
  { name: 'Focus', label: 'Focus', emoji: '🎯', activeEmoji: '🎯' },
  { name: 'HabitsTab', label: 'Habits', emoji: '🔥', activeEmoji: '🔥' },
  { name: 'Progress', label: 'Stats', emoji: '📈', activeEmoji: '📈' },
];

interface TabIconProps {
  item: TabItem;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ item, focused }) => {
  const theme = useAppTheme();
  const scale = useSharedValue(focused ? 1.15 : 1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 15, stiffness: 200 });
  }, [focused]);

  return (
    <Animated.View style={[styles.tabIcon, animStyle]}>
      <Text style={{ fontSize: 20 }}>{focused ? item.activeEmoji : item.emoji}</Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? theme.colors.primary : theme.colors.textTertiary },
        ]}
      >
        {item.label}
      </Text>
    </Animated.View>
  );
};

/**
 * Custom tab bar — flat, visible, labeled.
 * ADHD principle: consistent navigation, no hidden icons.
 */
function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          ...shadows.md,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const item = TAB_ITEMS.find(t => t.name === route.name);

        if (!item) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            haptics.light();
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={item.label}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {/* Active indicator pill */}
            {isFocused && (
              <View style={[styles.activePill, { backgroundColor: theme.colors.primaryContainer }]} />
            )}
            <TabIcon item={item} focused={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export const TabNavigator: React.FC = () => {
  const theme = useAppTheme();
  const activeSessions = useAppStore((s) =>
    s.active.status === 'running' ? 1 : 0
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="TasksTab" component={TasksNavigator} />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarBadge: activeSessions > 0 ? '●' : undefined,
        }}
      />
      <Tab.Screen name="HabitsTab" component={HabitsNavigator} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsNavigator} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  activePill: {
    position: 'absolute',
    top: -4,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  tabIcon: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
