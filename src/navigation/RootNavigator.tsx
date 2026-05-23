import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from './types';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { TabNavigator } from './TabNavigator';
import { DebugScreen } from '../screens/debug/DebugScreen';
import { useAppStore } from '../store';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNavigationScreenTracker } from '../hooks/useNavigationScreenTracker';
import { Theme } from '../theme';
import { spacing, borderRadius } from '../theme/spacing';
import { borderWidths, opacity, zIndex, durations } from '../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Hoisted to module scope so the navigator doesn't allocate a new options
// object on every render.
const SCREEN_OPTIONS = { headerShown: false, animation: 'fade' as const };
const DEBUG_SCREEN_OPTIONS = {
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
};

export const RootNavigator: React.FC = () => {
  const profile = useAppStore((s) => s.profile);
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {
    navigationRef,
    currentScreen,
    navigationTheme,
    openDebug,
    handleReady,
    handleStateChange,
  } = useNavigationScreenTracker();

  // The dev badge top offset depends on the device's safe-area inset, which
  // can't be known at module load. We memoize per-inset to avoid creating a
  // new object every render.
  const badgeOffsetStyle = useMemo<ViewStyle>(
    () => ({ top: Math.max(insets.top, spacing.xs) }),
    [insets.top]
  );

  return (
    <View style={styles.fill}>
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        onReady={handleReady}
        onStateChange={handleStateChange}
      >
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
          {!profile?.onboardingComplete ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <Stack.Screen name="Main" component={TabNavigator} />
          )}
          <Stack.Screen name="Debug" component={DebugScreen} options={DEBUG_SCREEN_OPTIONS} />
        </Stack.Navigator>
      </NavigationContainer>

      {/*
        Dev-only screen-name badge.
        Long-press opens the hidden Debug menu (the only way to reach it now).
      */}
      {__DEV__ && currentScreen && (
        <Pressable
          onLongPress={openDebug}
          delayLongPress={durations.slower + 100}
          accessibilityRole="button"
          accessibilityLabel={`Current screen: ${currentScreen}. Long press to open debug menu.`}
          testID="screen-name-badge"
          style={({ pressed }) => [
            styles.debugBadge,
            badgeOffsetStyle,
            pressed ? styles.debugBadgePressed : styles.debugBadgeIdle,
          ]}
        >
          <Text style={styles.debugText}>📍 {currentScreen}</Text>
        </Pressable>
      )}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    fill: { flex: 1 },
    debugBadge: {
      position: 'absolute',
      alignSelf: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing['3xs'],
      borderRadius: borderRadius.md,
      zIndex: zIndex.toast,
      borderWidth: borderWidths.thin,
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.6)',
    },
    debugBadgeIdle: { opacity: opacity.full },
    debugBadgePressed: { opacity: opacity.ghost },
    debugText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacings.wide,
      color: '#FFF',
    },
  });
