import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { FOCUS_TIMER_NOTIFICATION_TYPE } from '../constants/focusTimerNotification';
import {
  setupFocusTimerAndroidNotificationChannel,
  setupFocusTimerNotificationCategories,
} from '../services/focusTimerNotification';

/**
 * NeuroPilot Notification Service — 100% local, 100% offline.
 * All alerts are scheduled on-device; no network required.
 */

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = notification.request.content.data?.type;
    // Live focus timer updates are shown only from the tray while backgrounded.
    if (type === FOCUS_TIMER_NOTIFICATION_TYPE) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  dueDate: Date,
  minutesBefore = 30
): Promise<string | null> => {
  const fireDate = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
  if (fireDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ Task due soon: ${title}`,
      body: `You have ${minutesBefore} minutes before this task is due.`,
      data: { taskId, type: 'task_reminder' },
      sound: true,
    },
    trigger: {
      date: fireDate,
      channelId: 'task-reminders',
    },
  });
  return id;
};

export const scheduleHabitReminder = async (
  habitId: string,
  title: string,
  emoji: string,
  timeStr: string // HH:MM
): Promise<string | null> => {
  const [hours, minutes] = timeStr.split(':').map(Number);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} Habit time: ${title}`,
      body: 'Keep your streak going! Tap to mark as done.',
      data: { habitId, type: 'habit_reminder' },
      sound: true,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
      channelId: 'habit-reminders',
    },
  });
  return id;
};

export const scheduleFocusTransitionAlert = async (
  phase: 'focus' | 'break',
  minutesUntil: number
): Promise<string | null> => {
  // The "wrap up" cue lands 3 minutes before the phase ends. If the
  // phase is already too short for that, we silently no-op so callers
  // can fire-and-forget without guarding the lead time themselves.
  const fireDate = new Date(Date.now() + minutesUntil * 60 * 1000 - 3 * 60 * 1000);
  if (fireDate <= new Date()) return null;

  const message =
    phase === 'focus'
      ? '🧠 Focus session ending in 3 minutes. Start wrapping up.'
      : '☕ Break ending soon. Prepare to refocus.';

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'NeuroPilot Transition Alert',
      body: message,
      data: { type: 'focus_transition' },
      sound: false, // subtle
    },
    trigger: {
      date: fireDate,
      channelId: 'focus-alerts',
    },
  });
};

export const triggerImmediateFocusAlert = async (message: string): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Phase Complete!',
      body: message,
      data: { type: 'focus_complete' },
      sound: true,
    },
    trigger: null, // immediate
  });
  return id;
};


export const cancelNotification = async (id: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const setupNotificationChannels = async (): Promise<void> => {
  await setupFocusTimerNotificationCategories();
  await setupFocusTimerAndroidNotificationChannel();

  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('task-reminders', {
    name: 'Task Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7B6CF6',
  });

  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Habit Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 100, 100, 100],
    lightColor: '#4ECDC4',
  });

  await Notifications.setNotificationChannelAsync('focus-alerts', {
    name: 'Focus Alerts',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0, 50],
    lightColor: '#7B6CF6',
  });
};
