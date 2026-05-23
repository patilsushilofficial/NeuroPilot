import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useAppStore } from '../store';
import { triggerImmediateFocusAlert, scheduleTaskReminder } from '../utils/notifications';
import { useHaptics } from './useHaptics';
import { useToast } from './useToast';
import type { ToastPosition, ToastVariant } from '../services/toast';

/** Delay before the scheduled-notification test fires, in ms. */
const SCHEDULED_TEST_DELAY_MS = 5000;
/** Amount of XP granted by the gamification debug button. */
const DEBUG_XP_GRANT = 100;

type HapticTestVariant = 'success' | 'warning' | 'error' | 'heavy';

/**
 * Pre-canned demo copy per variant. Lives next to the trigger so the
 * Debug button strings stay short and the message + title pair reads
 * sensibly for QA without copy-pasta in the screen file.
 */
const TOAST_DEMO_COPY: Record<ToastVariant, { title: string; message: string }> = {
  default: {
    title: 'Heads up',
    message: 'A neutral toast — neither good nor bad news.',
  },
  info: {
    title: 'Did you know?',
    message: 'Toasts can also slide in from the top of the screen.',
  },
  success: {
    title: 'Nice work',
    message: 'Action completed — XP awarded and streak preserved.',
  },
  warning: {
    title: 'Heads up',
    message: 'Battery saver is on; some background sync may be deferred.',
  },
  error: {
    title: 'Something went wrong',
    message: "Couldn't reach the sync service. Working offline.",
  },
};

/**
 * View-model for the developer-only Debug screen. Holds the manual triggers
 * for notifications, haptics, and gamification so the screen file is just a
 * grid of `<Button>`s.
 */
export const useDebugScreen = () => {
  const haptics = useHaptics();
  const toast = useToast();
  const addXP = useAppStore((s) => s.addXP);

  const testImmediateNotification = useCallback(async () => {
    haptics.light();
    await triggerImmediateFocusAlert('This is a test notification from the Debug menu! 🚀');
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

  /**
   * Single trigger covering both axes (position × variant) — the
   * Debug screen renders one button per (position, variant) pair so
   * QA can verify the slide direction *and* the variant accent in
   * the same place.
   */
  const testToast = useCallback(
    (position: ToastPosition, variant: ToastVariant) => {
      haptics.light();
      const { title, message } = TOAST_DEMO_COPY[variant];
      toast.show({ title, message, variant, position });
    },
    [haptics, toast]
  );

  return {
    testImmediateNotification,
    testScheduledNotification,
    testHaptic,
    testToast,
    grantTestXP,
    debugXpGrant: DEBUG_XP_GRANT,
    scheduledTestDelaySeconds: SCHEDULED_TEST_DELAY_MS / 1000,
  };
};
