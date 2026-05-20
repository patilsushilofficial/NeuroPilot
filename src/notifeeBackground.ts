/**
 * Must be imported at app entry so Notifee notification actions work while
 * the app is backgrounded (fallback path when the custom native module is absent).
 */
import notifee, { EventType } from '@notifee/react-native';

import { isFocusTimerNativeAvailable } from './native/focusTimerNotificationNative';
import { useAppStore } from './store';
import {
  handleFocusTimerNotificationResponse,
  syncFocusTimerNotificationFromStore,
} from './services/focusTimerNotification';

if (!isFocusTimerNativeAvailable) {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
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
      await syncFocusTimerNotificationFromStore();
    }
  });
}
