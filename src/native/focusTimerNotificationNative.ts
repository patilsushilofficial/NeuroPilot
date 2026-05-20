import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import type { FocusTimerNotificationDisplayModel } from '../constants/focusTimerNotificationUi';

const { FocusTimerNotification } = NativeModules;

export const FOCUS_TIMER_NATIVE_EVENT = 'FocusTimerNotificationAction';

export const isFocusTimerNativeAvailable =
  Platform.OS === 'android' && FocusTimerNotification != null;

export const displayFocusTimerNativeNotification = async (
  model: FocusTimerNotificationDisplayModel
): Promise<void> => {
  if (!isFocusTimerNativeAvailable) {
    return;
  }

  try {
    await FocusTimerNotification.display(model);
  } catch (error) {
    console.warn('[NeuroPilot] Native focus notification display failed:', error);
    throw error;
  }
};

export const dismissFocusTimerNativeNotification = (): Promise<void> => {
  if (!isFocusTimerNativeAvailable) {
    return Promise.resolve();
  }
  return FocusTimerNotification.dismiss();
};

export const subscribeFocusTimerNotificationActions = (
  handler: (actionId: string) => void
): (() => void) => {
  if (!isFocusTimerNativeAvailable) {
    return () => undefined;
  }

  const emitter = new NativeEventEmitter(FocusTimerNotification);
  const subscription = emitter.addListener(FOCUS_TIMER_NATIVE_EVENT, handler);
  return () => subscription.remove();
};
