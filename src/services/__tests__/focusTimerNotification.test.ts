import notifee from '@notifee/react-native';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

import { useAppStore } from '../../store';
import {
  buildFocusTimerNotificationContent,
  buildFocusTimerNotificationLine,
  dismissFocusTimerNotification,
  handleFocusTimerNotificationResponse,
  presentFocusTimerNotification,
  registerFocusTimerNativeActionHandler,
  registerFocusTimerNotifeeForegroundHandler,
  setupFocusTimerNotificationCategories,
  syncFocusTimerNotificationFromStore,
  usesNativeCountdownNotification,
} from '../focusTimerNotification';
import {
  FOCUS_TIMER_ACTION_END,
  FOCUS_TIMER_ACTION_PAUSE,
  FOCUS_TIMER_ACTION_RESUME,
  FOCUS_TIMER_CATEGORY_PAUSED,
  FOCUS_TIMER_CATEGORY_RUNNING,
  FOCUS_TIMER_NOTIFICATION_ID,
  FOCUS_TIMER_NOTIFICATION_TYPE,
} from '../../constants/focusTimerNotification';
import { darkTheme } from '../../theme';

const mockDisplay = jest.fn().mockResolvedValue(undefined);
const mockDismiss = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn(() => jest.fn());
let mockNativeAvailable = true;

jest.mock('../../native/focusTimerNotificationNative', () => ({
  get isFocusTimerNativeAvailable() {
    return mockNativeAvailable;
  },
  displayFocusTimerNativeNotification: (...args: any[]) => mockDisplay(...args),
  dismissFocusTimerNativeNotification: (...args: any[]) => mockDismiss(...args),
  subscribeFocusTimerNotificationActions: (...args: any[]) => mockSubscribe(...args),
}));

jest.mock('expo-notifications', () => ({
  setNotificationCategoryAsync: jest.fn().mockResolvedValue(undefined),
  presentNotificationAsync: jest.fn().mockResolvedValue('id'),
  dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidNotificationPriority: { HIGH: 4 },
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('../../store', () => ({
  useAppStore: { getState: jest.fn() },
  selectActiveFocus: (s: { active: unknown }) => s.active,
  selectSettings: (s: { settings: unknown }) => s.settings,
}));

describe('focusTimerNotification', () => {
  const runningActive = {
    sessionId: 'focus_1',
    phase: 'focus' as const,
    status: 'running' as const,
    secondsRemaining: 125,
    totalSeconds: 1500,
    completedPomodoros: 0,
    currentTaskId: null,
    presetId: 'classic',
    runningEndsAt: Date.now() + 125_000,
  };

  const pausedActive = {
    ...runningActive,
    status: 'paused' as const,
    runningEndsAt: null,
    secondsRemaining: 125,
  };

  const setPlatform = (os: 'android' | 'ios') => {
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  };

  const setAppState = (state: string) => {
    Object.defineProperty(AppState, 'currentState', { value: state, configurable: true });
  };

  const mockStore = (
    active: typeof runningActive,
    settings = { notificationsEnabled: true, theme: 'dark' as const }
  ) => {
    (useAppStore.getState as jest.Mock).mockReturnValue({
      active,
      settings,
      pauseFocus: jest.fn(),
      resumeFocus: jest.fn(),
      abandonFocus: jest.fn(),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNativeAvailable = true;
    setPlatform('android');
    setAppState('background');
    mockStore(runningActive);
  });

  describe('buildFocusTimerNotificationLine', () => {
    it('omits the timer from the line on Android (native chronometer)', () => {
      expect(usesNativeCountdownNotification()).toBe(true);
      const line = buildFocusTimerNotificationLine(runningActive);
      expect(line).toBe('🧠 FOCUS · Classic Pomodoro');
      expect(line.includes('02:05')).toBe(false);
    });

    it('includes the timer on iOS', () => {
      setPlatform('ios');
      const line = buildFocusTimerNotificationLine(runningActive, Date.now(), true);
      expect(line).toBe('🧠 FOCUS · 02:05 · Classic Pomodoro');
    });

    it('includes paused time on Android without the native timer line', () => {
      const line = buildFocusTimerNotificationLine(pausedActive, Date.now(), false);
      expect(line).toContain('Paused 02:05');
    });
  });

  describe('presentFocusTimerNotification on Android', () => {
    it('uses the native expanded layout module', async () => {
      await presentFocusTimerNotification({
        active: runningActive,
        themePreference: 'dark',
      });

      expect(mockDisplay).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Classic Pomodoro',
          isRunning: true,
          totalSeconds: 1500,
          secondsRemaining: expect.any(Number),
          primaryActionLabel: 'Pause',
          stopActionLabel: 'Stop',
          endsAtMs: runningActive.runningEndsAt,
        })
      );
      expect(Notifications.presentNotificationAsync).not.toHaveBeenCalled();
    });

    it('marks paused state in the native model', async () => {
      await presentFocusTimerNotification({
        active: pausedActive,
        themePreference: 'dark',
      });

      expect(mockDisplay).toHaveBeenCalledWith(
        expect.objectContaining({
          isRunning: false,
          primaryActionLabel: 'Resume',
          pausedTimeText: '02:05',
        })
      );
    });
  });

  describe('presentFocusTimerNotification on iOS', () => {
    it('uses expo presentNotificationAsync with a single title line', async () => {
      setPlatform('ios');
      await presentFocusTimerNotification({
        active: runningActive,
        themePreference: 'dark',
      });

      expect(Notifications.presentNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('02:05'),
        }),
        FOCUS_TIMER_NOTIFICATION_ID
      );
      expect(mockDisplay).not.toHaveBeenCalled();
    });
  });

  describe('setupFocusTimerNotificationCategories', () => {
    it('registers iOS categories only', async () => {
      setPlatform('ios');
      await setupFocusTimerNotificationCategories();

      expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
        FOCUS_TIMER_CATEGORY_RUNNING,
        expect.any(Array)
      );
    });

    it('skips expo categories on Android', async () => {
      await setupFocusTimerNotificationCategories();
      expect(Notifications.setNotificationCategoryAsync).not.toHaveBeenCalled();
    });
  });

  describe('dismissFocusTimerNotification', () => {
    it('dismisses via the native module on Android', async () => {
      await dismissFocusTimerNotification();
      expect(mockDismiss).toHaveBeenCalled();
    });
  });

  describe('handleFocusTimerNotificationResponse', () => {
    it('pauses when the pause action is chosen', () => {
      const pauseFocus = jest.fn();
      const handled = handleFocusTimerNotificationResponse(
        FOCUS_TIMER_ACTION_PAUSE,
        pauseFocus,
        jest.fn(),
        jest.fn()
      );
      expect(handled).toBe(true);
      expect(pauseFocus).toHaveBeenCalled();
    });

    it('resumes when the resume action is chosen', () => {
      const resumeFocus = jest.fn();
      const handled = handleFocusTimerNotificationResponse(
        FOCUS_TIMER_ACTION_RESUME,
        jest.fn(),
        resumeFocus,
        jest.fn()
      );
      expect(handled).toBe(true);
      expect(resumeFocus).toHaveBeenCalled();
    });

    it('abandons when the stop action is chosen', () => {
      const abandonFocus = jest.fn();
      const handled = handleFocusTimerNotificationResponse(
        FOCUS_TIMER_ACTION_END,
        jest.fn(),
        jest.fn(),
        abandonFocus
      );
      expect(handled).toBe(true);
      expect(abandonFocus).toHaveBeenCalled();
    });
  });

  describe('buildFocusTimerNotificationContent', () => {
    it('builds iOS tray content with one title line', () => {
      setPlatform('ios');
      const content = buildFocusTimerNotificationContent(
        { active: runningActive, themePreference: 'dark' },
        darkTheme
      );

      expect(content.title).toContain('02:05');
      expect(content.subtitle).toBeNull();
      expect(content.body).toBeNull();
      expect(content.data?.type).toBe(FOCUS_TIMER_NOTIFICATION_TYPE);
      expect(content.categoryIdentifier).toBe(FOCUS_TIMER_CATEGORY_RUNNING);
    });

    it('uses the paused category when paused', () => {
      setPlatform('ios');
      const content = buildFocusTimerNotificationContent({
        active: pausedActive,
        themePreference: 'dark',
      });
      expect(content.categoryIdentifier).toBe(FOCUS_TIMER_CATEGORY_PAUSED);
    });
  });

  describe('syncFocusTimerNotificationFromStore', () => {
    it('presents when backgrounded with an active session', async () => {
      await syncFocusTimerNotificationFromStore();
      expect(mockDisplay).toHaveBeenCalled();
    });

    it('dismisses when the app is in the foreground', async () => {
      setAppState('active');
      await syncFocusTimerNotificationFromStore();
      expect(mockDismiss).toHaveBeenCalled();
      expect(mockDisplay).not.toHaveBeenCalled();
    });

    it('dismisses when notifications are disabled', async () => {
      mockStore(runningActive, { notificationsEnabled: false, theme: 'dark' });
      await syncFocusTimerNotificationFromStore();
      expect(mockDismiss).toHaveBeenCalled();
    });

    it('skips when Android notification permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      await syncFocusTimerNotificationFromStore();

      expect(mockDisplay).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('logs when presenting the notification throws', async () => {
      mockDisplay.mockRejectedValueOnce(new Error('boom'));
      (notifee.displayNotification as jest.Mock).mockRejectedValueOnce(new Error('boom'));
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      await syncFocusTimerNotificationFromStore();

      expect(warnSpy).toHaveBeenCalledWith(
        '[NeuroPilot] Failed to show focus timer notification:',
        expect.any(Error)
      );
      warnSpy.mockRestore();
    });
  });

  describe('registerFocusTimerNotifeeForegroundHandler', () => {
    it('handles Notifee action presses on the fallback path', () => {
      mockNativeAvailable = false;
      const handler = jest.fn();
      let actionHandler:
        | ((event: { type: number; detail: { pressAction?: { id: string } } }) => void)
        | undefined;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((cb) => {
        actionHandler = cb;
        return jest.fn();
      });

      const unsubscribe = registerFocusTimerNotifeeForegroundHandler(handler);
      actionHandler?.({
        type: 1,
        detail: { pressAction: { id: FOCUS_TIMER_ACTION_PAUSE } },
      });

      expect(useAppStore.getState().pauseFocus).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      unsubscribe();
    });

    it('no-ops when the native module is available', () => {
      expect(registerFocusTimerNotifeeForegroundHandler(jest.fn())()).toBeUndefined();
    });

    it('ignores non-action and default Notifee presses', () => {
      mockNativeAvailable = false;
      const handler = jest.fn();
      let actionHandler:
        | ((event: { type: number; detail: { pressAction?: { id: string } } }) => void)
        | undefined;
      (notifee.onForegroundEvent as jest.Mock).mockImplementation((cb) => {
        actionHandler = cb;
        return jest.fn();
      });

      registerFocusTimerNotifeeForegroundHandler(handler);
      actionHandler?.({ type: 0, detail: { pressAction: { id: FOCUS_TIMER_ACTION_PAUSE } } });
      actionHandler?.({ type: 1, detail: { pressAction: { id: 'default' } } });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('registerFocusTimerNativeActionHandler', () => {
    it('forwards native action events to the store', () => {
      const handler = jest.fn();
      let actionHandler: ((actionId: string) => void) | undefined;
      (mockSubscribe as any).mockImplementation((cb: (actionId: string) => void) => {
        actionHandler = cb;
        return jest.fn();
      });

      registerFocusTimerNativeActionHandler(handler);
      actionHandler?.(FOCUS_TIMER_ACTION_END);

      expect(useAppStore.getState().abandonFocus).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('dismissFocusTimerNotification fallbacks', () => {
    it('dismisses via Notifee when the native module is unavailable', async () => {
      mockNativeAvailable = false;
      await dismissFocusTimerNotification();
      expect(notifee.cancelNotification).toHaveBeenCalledWith(FOCUS_TIMER_NOTIFICATION_ID);
    });

    it('dismisses via expo-notifications on iOS', async () => {
      setPlatform('ios');
      await dismissFocusTimerNotification();
      expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
        FOCUS_TIMER_NOTIFICATION_ID
      );
    });
  });

  describe('presentFocusTimerNotification Notifee fallback', () => {
    it('uses Notifee when native display fails', async () => {
      mockDisplay.mockRejectedValueOnce(new Error('native failed'));
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      await presentFocusTimerNotification({
        active: runningActive,
        themePreference: 'dark',
      });

      expect(notifee.displayNotification).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('uses Notifee when the native module is unavailable', async () => {
      mockNativeAvailable = false;
      await presentFocusTimerNotification({
        active: runningActive,
        themePreference: 'dark',
      });
      expect(notifee.displayNotification).toHaveBeenCalled();
    });

    it('uses Notifee for paused sessions on the fallback path', async () => {
      mockNativeAvailable = false;
      await presentFocusTimerNotification({
        active: pausedActive,
        themePreference: 'dark',
      });
      expect(notifee.displayNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          android: expect.objectContaining({ showChronometer: false }),
        })
      );
    });
  });

  describe('handleFocusTimerNotificationResponse unknown action', () => {
    it('returns false for unknown actions', () => {
      const handled = handleFocusTimerNotificationResponse(
        'UNKNOWN',
        jest.fn(),
        jest.fn(),
        jest.fn()
      );
      expect(handled).toBe(false);
    });
  });

  describe('registerFocusTimerNativeActionHandler unavailable path', () => {
    it('returns a no-op unsubscribe when native actions are unavailable', () => {
      mockNativeAvailable = false;
      expect(registerFocusTimerNativeActionHandler(jest.fn())()).toBeUndefined();
    });
  });
});
