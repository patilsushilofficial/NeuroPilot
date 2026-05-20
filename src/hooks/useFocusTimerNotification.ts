import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import BackgroundTimer from 'react-native-background-timer';

import { useAppStore, selectActiveFocus, selectSettings } from '../store';
import {
  dismissFocusTimerNotification,
  handleFocusTimerNotificationResponse,
  registerFocusTimerNativeActionHandler,
  registerFocusTimerNotifeeForegroundHandler,
  syncFocusTimerNotificationFromStore,
  usesNativeCountdownNotification,
} from '../services/focusTimerNotification';

const BACKGROUND_STATES: AppStateStatus[] = ['background', 'inactive'];
const IOS_SYNC_MS = 1000;
/** Native chronometer ticks locally; refresh segments on this interval. */
const ANDROID_SYNC_MS = 15000;

const isBackgrounded = (state: AppStateStatus) => BACKGROUND_STATES.includes(state);

const isActiveSession = (active: ReturnType<typeof selectActiveFocus>) =>
  active.sessionId !== null && (active.status === 'running' || active.status === 'paused');

const getBackgroundSyncIntervalMs = () =>
  Platform.OS === 'ios' ? IOS_SYNC_MS : ANDROID_SYNC_MS;

const shouldRunBackgroundSync = () =>
  Platform.OS === 'ios' || usesNativeCountdownNotification();

/**
 * Shows a themed, ongoing focus-timer notification while the app is
 * backgrounded, with Pause / Resume / Stop actions. Dismisses when the user
 * returns to the app or the session ends.
 */
export const useFocusTimerNotification = () => {
  const pauseFocus = useAppStore((s) => s.pauseFocus);
  const resumeFocus = useAppStore((s) => s.resumeFocus);
  const abandonFocus = useAppStore((s) => s.abandonFocus);
  const reconcileFocusTimerFromClock = useAppStore((s) => s.reconcileFocusTimerFromClock);
  const tickSecond = useAppStore((s) => s.tickSecond);

  const active = useAppStore(selectActiveFocus);
  const settings = useAppStore(selectSettings);

  const appStateRef = useRef(AppState.currentState);
  const backgroundTimerActive = useRef(false);

  const stopBackgroundSync = () => {
    if (!backgroundTimerActive.current) return;
    BackgroundTimer.stopBackgroundTimer();
    backgroundTimerActive.current = false;
  };

  const startBackgroundSync = () => {
    if (!shouldRunBackgroundSync()) return;
    stopBackgroundSync();

    backgroundTimerActive.current = true;
    BackgroundTimer.runBackgroundTimer(() => {
      const state = useAppStore.getState();
      const currentActive = selectActiveFocus(state);

      if (Platform.OS === 'ios' && currentActive.status === 'running') {
        tickSecond();
      }

      void syncFocusTimerNotificationFromStore();
    }, getBackgroundSyncIntervalMs());
  };

  const applyBackgroundPolicy = (nextState: AppStateStatus) => {
    appStateRef.current = nextState;

    if (!isBackgrounded(nextState)) {
      stopBackgroundSync();
      if (usesNativeCountdownNotification()) {
        reconcileFocusTimerFromClock();
      }
      void dismissFocusTimerNotification();
      return;
    }

    const state = useAppStore.getState();
    if (!selectSettings(state).notificationsEnabled || !isActiveSession(selectActiveFocus(state))) {
      stopBackgroundSync();
      void dismissFocusTimerNotification();
      return;
    }

    void syncFocusTimerNotificationFromStore();

    if (selectActiveFocus(state).status === 'running') {
      startBackgroundSync();
    } else {
      stopBackgroundSync();
    }
  };

  useEffect(() => {
    if (!isBackgrounded(appStateRef.current)) return;

    const state = useAppStore.getState();
    if (!selectSettings(state).notificationsEnabled || !isActiveSession(selectActiveFocus(state))) {
      stopBackgroundSync();
      void dismissFocusTimerNotification();
      return;
    }

    void syncFocusTimerNotificationFromStore();

    if (selectActiveFocus(state).status === 'running') {
      startBackgroundSync();
    } else {
      stopBackgroundSync();
    }
  }, [
    active.sessionId,
    active.status,
    active.phase,
    active.runningEndsAt,
    active.secondsRemaining,
    active.totalSeconds,
    active.presetId,
    settings.notificationsEnabled,
    settings.theme,
    tickSecond,
    reconcileFocusTimerFromClock,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', applyBackgroundPolicy);
    return () => {
      subscription.remove();
      stopBackgroundSync();
      void dismissFocusTimerNotification();
    };
  }, [reconcileFocusTimerFromClock, tickSecond]);

  useEffect(() => {
    const unsubscribeNative = registerFocusTimerNativeActionHandler(() => {
      void syncFocusTimerNotificationFromStore();
    });
    const unsubscribeNotifee = registerFocusTimerNotifeeForegroundHandler(() => {
      void syncFocusTimerNotificationFromStore();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const handled = handleFocusTimerNotificationResponse(
        response.actionIdentifier,
        pauseFocus,
        resumeFocus,
        abandonFocus
      );
      if (!handled) return;

      void syncFocusTimerNotificationFromStore();

      const { active: currentActive } = useAppStore.getState();
      if (currentActive.status === 'running' && isBackgrounded(appStateRef.current)) {
        startBackgroundSync();
      } else {
        stopBackgroundSync();
      }
    });

    return () => {
      unsubscribeNative();
      unsubscribeNotifee();
      subscription.remove();
    };
  }, [pauseFocus, resumeFocus, abandonFocus]);
};
