import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

/**
 * FocusShieldService
 * Manages "distraction-free" mode by:
 *  1. Cancelling all pending app notifications (cross-platform)
 *  2. Opening system DND/Focus settings so the user can silence the phone
 */
class FocusShieldService {
  private _cancelledNotifications: Notifications.NotificationRequest[] = [];

  async activate(): Promise<void> {
    // 1. Cancel all pending app notifications and store them for restoration
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    this._cancelledNotifications = pending;
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 2. Open system DND / Focus Assist settings
    if (Platform.OS === 'android') {
      await Linking.openSettings(); // Opens Android App Notification settings
    } else if (Platform.OS === 'ios') {
      // iOS cannot programmatically enable DND; open Settings as guidance
      await Linking.openURL('App-prefs:DO_NOT_DISTURB');
    }
  }

  async deactivate(): Promise<void> {
    // Re-schedule all notifications that were cancelled
    for (const notif of this._cancelledNotifications) {
      const trigger = notif.trigger as any;
      if (trigger) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: notif.content,
            trigger,
          });
        } catch {
          // Notification may have already passed — skip silently
        }
      }
    }
    this._cancelledNotifications = [];
  }

  async openDNDSettings(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Try to open the DND specific settings page
        await Linking.sendIntent('android.settings.ZEN_MODE_PRIORITY_SETTINGS');
      } catch {
        await Linking.openSettings();
      }
    } else {
      await Linking.openURL('App-prefs:DO_NOT_DISTURB');
    }
  }
}

export const focusShieldService = new FocusShieldService();
