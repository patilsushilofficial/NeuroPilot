import { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '../store';
import { setupNotificationChannels, requestNotificationPermissions } from '../utils/notifications';
import { getTodayStr } from '../utils/dateUtils';

export const useAppInitialization = () => {
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
      const today = getTodayStr();
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
  }, [settings.notificationsEnabled, lastActiveDate, setLastActiveDate, updateDailyStreak]);

  useEffect(() => {
    initialize();
  }, [initialize]);
};
