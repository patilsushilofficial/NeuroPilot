jest.mock('react-native-background-timer', () => ({
  __esModule: true,
  default: {
    runBackgroundTimer: jest.fn(),
    stopBackgroundTimer: jest.fn(),
  },
}));

const mockUsesNativeCountdown = jest.fn(() => false);

jest.mock('../../services/focusTimerNotification', () => ({
  syncFocusTimerNotificationFromStore: jest.fn().mockResolvedValue(undefined),
  dismissFocusTimerNotification: jest.fn().mockResolvedValue(undefined),
  handleFocusTimerNotificationResponse: jest.fn().mockReturnValue(false),
  registerFocusTimerNativeActionHandler: jest.fn(() => jest.fn()),
  registerFocusTimerNotifeeForegroundHandler: jest.fn(() => jest.fn()),
  usesNativeCountdownNotification: () => mockUsesNativeCountdown(),
}));

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

import { renderHook, act } from '@testing-library/react-native';
import { AppState, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import * as Notifications from 'expo-notifications';

import { useFocusTimerNotification } from '../useFocusTimerNotification';
import {
  dismissFocusTimerNotification,
  handleFocusTimerNotificationResponse,
  syncFocusTimerNotificationFromStore,
} from '../../services/focusTimerNotification';

const pauseFocus = jest.fn();
const resumeFocus = jest.fn();
const abandonFocus = jest.fn();
const reconcileFocusTimerFromClock = jest.fn();
const tickSecond = jest.fn();

const baseActive = {
  sessionId: 'focus_1' as string | null,
  phase: 'focus' as const,
  status: 'running' as const,
  secondsRemaining: 600,
  totalSeconds: 1500,
  completedPomodoros: 0,
  currentTaskId: null,
  presetId: 'classic',
  runningEndsAt: Date.now() + 600_000,
};

const baseSettings = {
  notificationsEnabled: true,
  theme: 'dark' as const,
  hapticsEnabled: true,
};

const mockStoreState = {
  active: baseActive,
  settings: baseSettings,
  pauseFocus,
  resumeFocus,
  abandonFocus,
  reconcileFocusTimerFromClock,
  tickSecond,
};

jest.mock('../../store', () => ({
  selectActiveFocus: (s: typeof mockStoreState) => s.active,
  selectSettings: (s: typeof mockStoreState) => s.settings,
  useAppStore: Object.assign(
    jest.fn((selector: (s: typeof mockStoreState) => unknown) => selector(mockStoreState)),
    {
      getState: () => mockStoreState,
    }
  ),
}));

describe('useFocusTimerNotification', () => {
  let appStateHandler: ((state: string) => void) | undefined;
  let notificationHandler: ((response: { actionIdentifier: string }) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsesNativeCountdown.mockReturnValue(false);
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
    appStateHandler = undefined;
    notificationHandler = undefined;
    mockStoreState.active = { ...baseActive };
    mockStoreState.settings = { ...baseSettings };

    (AppState.addEventListener as jest.Mock) = jest.fn((_event, handler) => {
      appStateHandler = handler;
      return { remove: jest.fn() };
    });

    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockImplementation(
      (handler) => {
        notificationHandler = handler;
        return { remove: jest.fn() };
      }
    );
  });

  it('presents the notification when the app moves to the background during a session', () => {
    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    expect(syncFocusTimerNotificationFromStore).toHaveBeenCalled();
  });

  it('starts an iOS background timer while running in the background', () => {
    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    expect(BackgroundTimer.runBackgroundTimer).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('starts an Android background sync timer when the native countdown is available', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockUsesNativeCountdown.mockReturnValue(true);

    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    expect(BackgroundTimer.runBackgroundTimer).toHaveBeenCalledWith(expect.any(Function), 15000);
  });

  it('dismisses the notification when returning to the foreground', () => {
    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });
    act(() => {
      appStateHandler?.('active');
    });

    expect(BackgroundTimer.stopBackgroundTimer).toHaveBeenCalled();
    expect(dismissFocusTimerNotification).toHaveBeenCalled();
  });

  it('reconciles the timer from the clock when returning on Android native countdown', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockUsesNativeCountdown.mockReturnValue(true);

    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });
    act(() => {
      appStateHandler?.('active');
    });

    expect(reconcileFocusTimerFromClock).toHaveBeenCalled();
  });

  it('does not start background sync when the session is paused', () => {
    mockStoreState.active = { ...baseActive, status: 'paused', runningEndsAt: null } as any;

    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    expect(syncFocusTimerNotificationFromStore).toHaveBeenCalled();
    expect(BackgroundTimer.runBackgroundTimer).not.toHaveBeenCalled();
  });

  it('does not present when notifications are disabled', () => {
    mockStoreState.settings = { ...baseSettings, notificationsEnabled: false };

    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    expect(syncFocusTimerNotificationFromStore).not.toHaveBeenCalled();
    expect(dismissFocusTimerNotification).toHaveBeenCalled();
  });

  it('handles notification action responses while backgrounded', () => {
    (handleFocusTimerNotificationResponse as jest.Mock).mockReturnValue(true);

    renderHook(() => useFocusTimerNotification());

    act(() => {
      appStateHandler?.('background');
    });

    act(() => {
      notificationHandler?.({ actionIdentifier: 'FOCUS_TIMER_PAUSE' });
    });

    expect(handleFocusTimerNotificationResponse).toHaveBeenCalledWith(
      'FOCUS_TIMER_PAUSE',
      pauseFocus,
      resumeFocus,
      abandonFocus
    );
    expect(syncFocusTimerNotificationFromStore).toHaveBeenCalledTimes(2);
  });
});
