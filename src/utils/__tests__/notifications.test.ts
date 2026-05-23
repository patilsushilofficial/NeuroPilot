import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleTaskReminder,
  scheduleHabitReminder,
  scheduleFocusTransitionAlert,
  triggerImmediateFocusAlert,
  cancelNotification,
  cancelAllNotifications,
  setupNotificationChannels,
} from '../notifications';

jest.mock('../../services/focusTimerNotification', () => ({
  setupFocusTimerNotificationCategories: jest.fn().mockResolvedValue(undefined),
  setupFocusTimerAndroidNotificationChannel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notif_id'),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 4, DEFAULT: 3, LOW: 2 },
}));

// Capture the handler installed at module load before any clearAllMocks() runs.
const installedHandler = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0]?.[0];

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermissions', () => {
    it('returns true when already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await expect(requestNotificationPermissions()).resolves.toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission when not yet granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await expect(requestNotificationPermissions()).resolves.toBe(true);
    });

    it('returns false when the user denies', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      await expect(requestNotificationPermissions()).resolves.toBe(false);
    });
  });

  describe('scheduleTaskReminder', () => {
    it('schedules a reminder before the due date', async () => {
      const dueDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const id = await scheduleTaskReminder('t1', 'Write report', dueDate, 30);
      expect(id).toBe('notif_id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('returns null when the fire date has already passed', async () => {
      const dueDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      const id = await scheduleTaskReminder('t1', 'Past', dueDate, 30);
      expect(id).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleHabitReminder', () => {
    it('schedules a recurring reminder at the chosen time', async () => {
      const id = await scheduleHabitReminder('h1', 'Meditate', '🧘', '07:30');
      expect(id).toBe('notif_id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ hour: 7, minute: 30, repeats: true }),
        })
      );
    });
  });

  describe('scheduleFocusTransitionAlert', () => {
    it('returns the notification id when scheduling a focus heads-up', async () => {
      const id = await scheduleFocusTransitionAlert('focus', 30);
      // The id round-trips so callers can cancel later — the focus
      // transition service relies on this contract.
      expect(id).toBe('notif_id');
      const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(arg.content.body).toContain('Focus session');
    });

    it('returns the notification id when scheduling a break heads-up', async () => {
      const id = await scheduleFocusTransitionAlert('break', 10);
      expect(id).toBe('notif_id');
      const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(arg.content.body).toContain('Break ending');
    });

    it('returns null and skips scheduling when the alert would fire in the past', async () => {
      const id = await scheduleFocusTransitionAlert('focus', 1);
      expect(id).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('triggerImmediateFocusAlert', () => {
    it('schedules an immediate notification', async () => {
      const id = await triggerImmediateFocusAlert('Done!');
      expect(id).toBe('notif_id');
      const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(arg.trigger).toBeNull();
    });
  });

  describe('cancel helpers', () => {
    it('cancels a single notification by id', async () => {
      await cancelNotification('xyz');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('xyz');
    });

    it('cancels all notifications', async () => {
      await cancelAllNotifications();
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('setupNotificationChannels', () => {
    const originalOS = Platform.OS;
    afterEach(() => {
      Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
    });

    it('is a no-op on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
      await setupNotificationChannels();
      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });

    it('creates Android channels on Android', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
      await setupNotificationChannels();
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledTimes(3);
    });
  });

  it('configures the notification handler at module load', async () => {
    expect(installedHandler).toBeDefined();
    await expect(
      installedHandler.handleNotification({
        request: { content: { data: { type: 'task_reminder' } } },
      })
    ).resolves.toEqual({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });

  it('suppresses banner UI for live focus timer updates', async () => {
    await expect(
      installedHandler.handleNotification({
        request: { content: { data: { type: 'focus_timer_live' } } },
      })
    ).resolves.toEqual({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    });
  });
});
