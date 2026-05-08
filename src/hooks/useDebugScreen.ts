import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useAppStore } from '../store';
import { triggerImmediateFocusAlert, scheduleTaskReminder } from '../utils/notifications';
import { useHaptics } from './useHaptics';

/** Delay before the scheduled-notification test fires, in ms. */
const SCHEDULED_TEST_DELAY_MS = 5000;
/** Amount of XP granted by the gamification debug button. */
const DEBUG_XP_GRANT = 100;

type HapticTestVariant = 'success' | 'warning' | 'error' | 'heavy';

/**
 * View-model for the developer-only Debug screen. Holds the manual triggers
 * for notifications, haptics, and gamification so the screen file is just a
 * grid of `<Button>`s.
 */
export const useDebugScreen = () => {
  const haptics = useHaptics();
  const addXP = useAppStore((s) => s.addXP);

  const testImmediateNotification = useCallback(async () => {
    haptics.light();
    await triggerImmediateFocusAlert(
      'This is a test notification from the Debug menu! 🚀'
    );
  }, [haptics]);

  const testScheduledNotification = useCallback(async () => {
    haptics.light();
    const futureDate = new Date(Date.now() + SCHEDULED_TEST_DELAY_MS);
    const id = await scheduleTaskReminder('debug_task', 'Debug Task', futureDate, 0);
    if (id) {
      Alert.alert(
        'Success',
        `Notification scheduled for ${SCHEDULED_TEST_DELAY_MS / 1000} seconds from now!`
      );
    } else {
      Alert.alert('Error', 'Failed to schedule notification. Check permissions.');
    }
  }, [haptics]);

  const testHaptic = useCallback(
    (variant: HapticTestVariant) => {
      switch (variant) {
        case 'success':
          haptics.success();
          break;
        case 'warning':
          haptics.warning();
          break;
        case 'error':
          haptics.error();
          break;
        case 'heavy':
          haptics.heavy();
          break;
      }
    },
    [haptics]
  );

  const grantTestXP = useCallback(() => {
    haptics.achievement();
    addXP(DEBUG_XP_GRANT);
  }, [haptics, addXP]);

  return {
    testImmediateNotification,
    testScheduledNotification,
    testHaptic,
    grantTestXP,
    debugXpGrant: DEBUG_XP_GRANT,
    scheduledTestDelaySeconds: SCHEDULED_TEST_DELAY_MS / 1000,
  };
};
