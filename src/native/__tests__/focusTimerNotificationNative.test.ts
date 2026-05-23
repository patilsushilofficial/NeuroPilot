import { NativeModules, Platform } from 'react-native';

describe('focusTimerNotificationNative', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('reports unavailable when the native module is missing', () => {
    NativeModules.FocusTimerNotification = undefined as never;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

    const {
      isFocusTimerNativeAvailable,
      subscribeFocusTimerNotificationActions,
    } = require('../focusTimerNotificationNative');

    expect(isFocusTimerNativeAvailable).toBe(false);
    expect(subscribeFocusTimerNotificationActions(jest.fn())).toEqual(expect.any(Function));
  });

  it('calls native display and dismiss when available', async () => {
    const display = jest.fn().mockResolvedValue(undefined);
    const dismiss = jest.fn().mockResolvedValue(undefined);
    NativeModules.FocusTimerNotification = { display, dismiss };
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });

    const {
      displayFocusTimerNativeNotification,
      dismissFocusTimerNativeNotification,
      subscribeFocusTimerNotificationActions,
    } = require('../focusTimerNotificationNative');

    await displayFocusTimerNativeNotification({ title: 'Focus' } as never);
    await dismissFocusTimerNativeNotification();

    const remove = subscribeFocusTimerNotificationActions(jest.fn());
    expect(typeof remove).toBe('function');
    remove();

    expect(display).toHaveBeenCalled();
    expect(dismiss).toHaveBeenCalled();
  });
});
