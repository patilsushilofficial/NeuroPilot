import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { setupNotificationChannels, requestNotificationPermissions } from './src/utils/notifications';
import { useAppStore } from './src/store';
import { useAppTheme } from './src/hooks/useAppTheme';
import { format } from 'date-fns';

// Keep splash screen visible during initialization
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const theme = useAppTheme();
  const { settings, lastActiveDate, setLastActiveDate, updateDailyStreak } = useAppStore();

  const initialize = useCallback(async () => {
    try {
      // Set up Android notification channels
      await setupNotificationChannels();

      // Request notification permissions (non-blocking)
      if (settings.notificationsEnabled) {
        await requestNotificationPermissions();
      }

      // Check daily streak
      const today = format(new Date(), 'yyyy-MM-dd');
      if (lastActiveDate !== today) {
        updateDailyStreak();
        setLastActiveDate(today);
      }
    } catch (error) {
      // Non-fatal — app works fully offline without notifications
      console.warn('[NeuroPilot] Initialization warning:', error);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
