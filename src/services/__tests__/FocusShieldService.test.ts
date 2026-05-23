import { focusShieldService } from '../FocusShieldService';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: {
    openSettings: jest.fn().mockResolvedValue(true),
    openURL: jest.fn().mockResolvedValue(true),
    sendIntent: jest.fn().mockResolvedValue(true),
  },
}));

describe('FocusShieldService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should activate on Android', async () => {
    Platform.OS = 'android';
    await focusShieldService.activate();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('should activate on iOS', async () => {
    Platform.OS = 'ios';
    await focusShieldService.activate();
    expect(Linking.openURL).toHaveBeenCalledWith('App-prefs:DO_NOT_DISTURB');
  });

  it('should deactivate and restore notifications', async () => {
    const mockNotif = { content: {}, trigger: { type: 'daily' } };
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([mockNotif]);

    // First activate to capture notifications
    await focusShieldService.activate();

    // Then deactivate
    await focusShieldService.deactivate();

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('should open DND settings on Android', async () => {
    Platform.OS = 'android';
    await focusShieldService.openDNDSettings();
    expect(Linking.sendIntent).toHaveBeenCalledWith('android.settings.ZEN_MODE_PRIORITY_SETTINGS');
  });

  it('should open DND settings on iOS', async () => {
    Platform.OS = 'ios';
    await focusShieldService.openDNDSettings();
    expect(Linking.openURL).toHaveBeenCalledWith('App-prefs:DO_NOT_DISTURB');
  });

  it('should fallback to openSettings if sendIntent fails on Android', async () => {
    Platform.OS = 'android';
    (Linking.sendIntent as jest.Mock).mockRejectedValue(new Error('Intent failed'));

    await focusShieldService.openDNDSettings();
    expect(Linking.openSettings).toHaveBeenCalled();
  });

  it('skips a notification with no trigger when deactivating', async () => {
    Platform.OS = 'android';
    const triggerless = { content: {}, trigger: null };
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([triggerless]);
    await focusShieldService.activate();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockClear();
    await focusShieldService.deactivate();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('silently swallows errors from re-scheduling on deactivate', async () => {
    Platform.OS = 'android';
    const expired = { content: {}, trigger: { type: 'date' } };
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([expired]);
    await focusShieldService.activate();
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('expired')
    );
    await expect(focusShieldService.deactivate()).resolves.toBeUndefined();
  });
});
