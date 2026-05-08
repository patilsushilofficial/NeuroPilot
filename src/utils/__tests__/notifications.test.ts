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
const installedHandler =
  (Notifications.setNotificationHandler as jest.Mock).mock.calls[0]?.[0];

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
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await expect(requestNotificationPermissions()).resolves.toBe(true);
    });

    it('returns false when the user denies', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
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
    it('schedules a focus alert in the future', async () => {
      await scheduleFocusTransitionAlert('focus', 30);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(arg.content.body).toContain('Focus session');
    });

    it('schedules a break-end alert in the future', async () => {
      await scheduleFocusTransitionAlert('break', 10);
      const arg = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(arg.content.body).toContain('Break ending');
    });

    it('skips when alert would already be in the past', async () => {
      await scheduleFocusTransitionAlert('focus', 1);
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
    await expect(installedHandler.handleNotification()).resolves.toEqual({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});
