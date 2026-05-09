import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { TabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FocusScreen } from '../screens/focus/FocusScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { TasksNavigator } from './stacks/TasksNavigator';
import { HabitsNavigator } from './stacks/HabitsNavigator';
import { SettingsNavigator } from './stacks/SettingsNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

// Adapt React Navigation's `BottomTabBarProps` to the narrower contract
// `CustomTabBar` declares — we only need `state` and `navigation`, so we
// pluck them off rather than depending on RN's full prop surface.
const renderTabBar = ({ state, navigation }: BottomTabBarProps) => (
  <CustomTabBar state={state} navigation={navigation} />
);
const TAB_NAVIGATOR_OPTIONS = { headerShown: false };
const HIDDEN_TAB_OPTIONS = { tabBarButton: () => null };

/**
 * Bottom-tab navigator. Wiring only: the visual treatment lives in
 * `CustomTabBar` (which composes `TabBarItem`s), so this file stays a
 * thin map of route → screen.
 */
export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={renderTabBar} screenOptions={TAB_NAVIGATOR_OPTIONS}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="TasksTab" component={TasksNavigator} />
    <Tab.Screen name="Focus" component={FocusScreen} />
    <Tab.Screen name="HabitsTab" component={HabitsNavigator} />
    <Tab.Screen name="Progress" component={ProgressScreen} />
    <Tab.Screen
      name="Settings"
      component={SettingsNavigator}
      options={HIDDEN_TAB_OPTIONS}
    />
  </Tab.Navigator>
);
