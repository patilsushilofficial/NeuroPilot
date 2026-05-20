import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

import {
  FOCUS_TIMER_ACTION_END,
  FOCUS_TIMER_ACTION_PAUSE,
  FOCUS_TIMER_ACTION_RESUME,
  FOCUS_TIMER_CATEGORY_PAUSED,
  FOCUS_TIMER_CATEGORY_RUNNING,
  FOCUS_TIMER_CHANNEL_ID,
  FOCUS_TIMER_NOTIFICATION_ID,
  FOCUS_TIMER_NOTIFICATION_TYPE,
} from '../constants/focusTimerNotification';
import { buildFocusTimerNotificationDisplayModel } from '../constants/focusTimerNotificationUi';
import { FOCUS_PHASE_EMOJIS, FOCUS_PHASE_LABELS } from '../constants/focus';
import { getPresetById } from '../constants/focusPresets';
import {
  dismissFocusTimerNativeNotification,
  displayFocusTimerNativeNotification,
  isFocusTimerNativeAvailable,
  subscribeFocusTimerNotificationActions,
} from '../native/focusTimerNotificationNative';
import { useAppStore, selectActiveFocus, selectSettings } from '../store';
import { ActiveFocusState, AppSettings } from '../types';
import { formatTimerDisplay } from '../utils/dateUtils';
import { computeRunningEndsAt, getEffectiveSecondsRemaining } from '../utils/focusTimerClock';
import { resolveAppTheme } from '../utils/resolveAppTheme';
import { Theme } from '../theme';

export interface FocusTimerNotificationSnapshot {
  active: ActiveFocusState;
  themePreference: AppSettings['theme'];
}

const isActiveSession = (active: ActiveFocusState) =>
  active.sessionId !== null && (active.status === 'running' || active.status === 'paused');

const isBackgrounded = () => {
  const state = AppState.currentState;
  return state === 'background' || state === 'inactive';
};

/** Android custom layout with a native chronometer; iOS uses expo-notifications. */
export const usesNativeCountdownNotification = () =>
  Platform.OS === 'android' && isFocusTimerNativeAvailable;

let androidChannelReady = false;

/** Registers the focus-timer channel via Expo (permissions + fallback path). */
export const setupFocusTimerAndroidNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android' || androidChannelReady) return;

  await Notifications.setNotificationChannelAsync(FOCUS_TIMER_CHANNEL_ID, {
    name: 'Focus Timer',
    description: 'Live countdown while a focus session runs in the background',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0],
    sound: null,
    enableVibrate: false,
    showBadge: false,
  });

  androidChannelReady = true;
};

let notifeeChannelReady = false;

const setupFocusTimerNotifeeChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android' || notifeeChannelReady) return;

  await notifee.createChannel({
    id: FOCUS_TIMER_CHANNEL_ID,
    name: 'Focus Timer',
    description: 'Live countdown while a focus session runs in the background',
    importance: AndroidImportance.DEFAULT,
    vibration: false,
  });

  notifeeChannelReady = true;
};

export const buildFocusTimerNotificationLine = (
  active: ActiveFocusState,
  now = Date.now(),
  includeTimerInLine = !usesNativeCountdownNotification()
): string => {
  const preset = getPresetById(active.presetId);
  const phaseLabel = FOCUS_PHASE_LABELS[active.phase];
  const phaseEmoji = FOCUS_PHASE_EMOJIS[active.phase];

  if (!includeTimerInLine) {
    if (active.status === 'paused') {
      const timeLabel = formatTimerDisplay(getEffectiveSecondsRemaining(active, now));
      return `${phaseEmoji} ${phaseLabel} · Paused ${timeLabel} · ${preset.name}`;
    }
    return `${phaseEmoji} ${phaseLabel} · ${preset.name}`;
  }

  const timeLabel = formatTimerDisplay(getEffectiveSecondsRemaining(active, now));
  if (active.status === 'paused') {
    return `${phaseEmoji} ${phaseLabel} · Paused ${timeLabel} · ${preset.name}`;
  }
  return `${phaseEmoji} ${phaseLabel} · ${timeLabel} · ${preset.name}`;
};

export const buildFocusTimerNotificationContent = (
  snapshot: FocusTimerNotificationSnapshot,
  theme: Theme = resolveAppTheme(snapshot.themePreference),
  now = Date.now()
): Notifications.NotificationContentInput => {
  const { active } = snapshot;
  const isRunning = active.status === 'running';
  const line = buildFocusTimerNotificationLine(active, now, true);

  return {
    title: line,
    subtitle: null,
    body: null,
    data: {
      type: FOCUS_TIMER_NOTIFICATION_TYPE,
      phase: active.phase,
      status: active.status,
      presetId: active.presetId,
      secondsRemaining: getEffectiveSecondsRemaining(active, now),
    },
    sound: false,
    color: theme.colors.focusTimer,
    priority: Notifications.AndroidNotificationPriority.HIGH,
    sticky: true,
    autoDismiss: false,
    categoryIdentifier: isRunning
      ? FOCUS_TIMER_CATEGORY_RUNNING
      : FOCUS_TIMER_CATEGORY_PAUSED,
    ...(Platform.OS === 'android' ? { channelId: FOCUS_TIMER_CHANNEL_ID } : {}),
  };
};

const presentAndroidNotificationWithNotifee = async (
  snapshot: FocusTimerNotificationSnapshot,
  theme: Theme
): Promise<void> => {
  await setupFocusTimerNotifeeChannel();

  const { active } = snapshot;
  const title = buildFocusTimerNotificationLine(active, Date.now(), false);
  const endsAt =
    active.runningEndsAt ?? computeRunningEndsAt(getEffectiveSecondsRemaining(active));

  const androidBase = {
    channelId: FOCUS_TIMER_CHANNEL_ID,
    ongoing: true,
    autoCancel: false,
    color: theme.colors.focusTimer,
    pressAction: { id: 'default' as const },
  };

  if (active.status === 'running') {
    await notifee.displayNotification({
      id: FOCUS_TIMER_NOTIFICATION_ID,
      title,
      android: {
        ...androidBase,
        showChronometer: true,
        chronometerDirection: 'down',
        timestamp: endsAt,
        actions: [
          { title: 'Pause', pressAction: { id: FOCUS_TIMER_ACTION_PAUSE } },
          { title: 'Stop', pressAction: { id: FOCUS_TIMER_ACTION_END } },
        ],
      },
    });
    return;
  }

  await notifee.displayNotification({
    id: FOCUS_TIMER_NOTIFICATION_ID,
    title,
    android: {
      ...androidBase,
      showChronometer: false,
      actions: [
        { title: 'Resume', pressAction: { id: FOCUS_TIMER_ACTION_RESUME } },
        { title: 'Stop', pressAction: { id: FOCUS_TIMER_ACTION_END } },
      ],
    },
  });
};

const presentAndroidNotification = async (
  snapshot: FocusTimerNotificationSnapshot,
  theme: Theme,
  now = Date.now()
): Promise<void> => {
  if (isFocusTimerNativeAvailable) {
    try {
      const model = buildFocusTimerNotificationDisplayModel(snapshot.active, theme, now);
      await displayFocusTimerNativeNotification(model);
      return;
    } catch {
      console.warn('[NeuroPilot] Falling back to Notifee focus notification');
    }
  }

  await presentAndroidNotificationWithNotifee(snapshot, theme);
};

const presentIosNotification = async (
  snapshot: FocusTimerNotificationSnapshot,
  theme: Theme
): Promise<void> => {
  const content = buildFocusTimerNotificationContent(snapshot, theme);
  await Notifications.presentNotificationAsync(content, FOCUS_TIMER_NOTIFICATION_ID);
};

export const setupFocusTimerNotificationCategories = async (): Promise<void> => {
  if (Platform.OS === 'android') return;

  await Notifications.setNotificationCategoryAsync(FOCUS_TIMER_CATEGORY_RUNNING, [
    {
      identifier: FOCUS_TIMER_ACTION_PAUSE,
      buttonTitle: '⏸ Pause',
      options: { opensAppToForeground: false },
    },
    {
      identifier: FOCUS_TIMER_ACTION_END,
      buttonTitle: '■ Stop',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);

  await Notifications.setNotificationCategoryAsync(FOCUS_TIMER_CATEGORY_PAUSED, [
    {
      identifier: FOCUS_TIMER_ACTION_RESUME,
      buttonTitle: '▶ Resume',
      options: { opensAppToForeground: false },
    },
    {
      identifier: FOCUS_TIMER_ACTION_END,
      buttonTitle: '■ Stop',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);
};

export const presentFocusTimerNotification = async (
  snapshot: FocusTimerNotificationSnapshot
): Promise<void> => {
  const theme = resolveAppTheme(snapshot.themePreference);

  if (Platform.OS === 'android') {
    await presentAndroidNotification(snapshot, theme);
    return;
  }

  await presentIosNotification(snapshot, theme);
};

export const dismissFocusTimerNotification = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      if (isFocusTimerNativeAvailable) {
        await dismissFocusTimerNativeNotification();
      } else {
        await notifee.cancelNotification(FOCUS_TIMER_NOTIFICATION_ID);
      }
    } else {
      await Notifications.dismissNotificationAsync(FOCUS_TIMER_NOTIFICATION_ID);
    }
  } catch {
    // Tray may not contain our notification — safe to ignore.
  }
};

export const syncFocusTimerNotificationFromStore = async (): Promise<void> => {
  const state = useAppStore.getState();
  const active = selectActiveFocus(state);
  const settings = selectSettings(state);

  if (!settings.notificationsEnabled || !isActiveSession(active) || !isBackgrounded()) {
    await dismissFocusTimerNotification();
    return;
  }

  if (Platform.OS === 'android') {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[NeuroPilot] Focus timer notification skipped — permission denied');
        return;
      }
    }
    await setupFocusTimerAndroidNotificationChannel();
  }

  try {
    await presentFocusTimerNotification({
      active,
      themePreference: settings.theme,
    });
  } catch (error) {
    console.warn('[NeuroPilot] Failed to show focus timer notification:', error);
  }
};

export const handleFocusTimerNotificationResponse = (
  actionIdentifier: string,
  pauseFocus: () => void,
  resumeFocus: () => void,
  abandonFocus: () => void
): boolean => {
  if (actionIdentifier === FOCUS_TIMER_ACTION_PAUSE) {
    pauseFocus();
    return true;
  }
  if (actionIdentifier === FOCUS_TIMER_ACTION_RESUME) {
    resumeFocus();
    return true;
  }
  if (actionIdentifier === FOCUS_TIMER_ACTION_END) {
    abandonFocus();
    return true;
  }
  return false;
};

/** Wire Notifee foreground actions when using the Notifee fallback path. */
export const registerFocusTimerNotifeeForegroundHandler = (
  onActionHandled: () => void
): (() => void) => {
  if (Platform.OS !== 'android' || isFocusTimerNativeAvailable) {
    return () => undefined;
  }

  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type !== EventType.ACTION_PRESS) return;

    const actionId = detail.pressAction?.id;
    if (!actionId || actionId === 'default') return;

    const state = useAppStore.getState();
    const handled = handleFocusTimerNotificationResponse(
      actionId,
      state.pauseFocus,
      state.resumeFocus,
      state.abandonFocus
    );

    if (handled) {
      onActionHandled();
    }
  });
};

/** Wire native module action presses (custom layout path). */
export const registerFocusTimerNativeActionHandler = (
  onActionHandled: () => void
): (() => void) => {
  if (!isFocusTimerNativeAvailable) {
    return () => undefined;
  }

  return subscribeFocusTimerNotificationActions((actionId) => {
    const state = useAppStore.getState();
    const handled = handleFocusTimerNotificationResponse(
      actionId,
      state.pauseFocus,
      state.resumeFocus,
      state.abandonFocus
    );

    if (handled) {
      onActionHandled();
    }
  });
};
