import { useCallback } from 'react';
import { Alert } from 'react-native';

import { focusShieldService } from '../services/FocusShieldService';
import {
  FOCUS_SHIELD_ACTIVATE_PROMPT,
  FOCUS_SHIELD_DEACTIVATE_PROMPT,
} from '../constants/focusShield';
import { useHaptics } from './useHaptics';

interface UseFocusShieldActionsArgs {
  isActive: boolean;
  onToggle: (next: boolean) => void;
}

interface FocusShieldActions {
  /** Show the activate/deactivate confirmation dialog. */
  requestToggle: () => void;
  /** Open system Do Not Disturb settings (used when shield is active). */
  openDNDSettings: () => Promise<void>;
}

/**
 * Encapsulates the toggle-confirmation flow and DND escape hatch for the
 * Focus Shield component. The component stays purely presentational —
 * animations, colors, layout — and lets this hook own:
 *  - confirmation Alerts (copy in `constants/focusShield`)
 *  - haptic feedback per branch
 *  - calls into the underlying `focusShieldService`
 */
export const useFocusShieldActions = ({
  isActive,
  onToggle,
}: UseFocusShieldActionsArgs): FocusShieldActions => {
  const haptics = useHaptics();

  const requestToggle = useCallback(() => {
    haptics.heavy();
    if (!isActive) {
      Alert.alert(
        FOCUS_SHIELD_ACTIVATE_PROMPT.title,
        FOCUS_SHIELD_ACTIVATE_PROMPT.message,
        [
          { text: FOCUS_SHIELD_ACTIVATE_PROMPT.cancelLabel, style: 'cancel' },
          {
            text: FOCUS_SHIELD_ACTIVATE_PROMPT.confirmLabel,
            onPress: async () => {
              haptics.achievement();
              onToggle(true);
              await focusShieldService.activate();
            },
          },
        ]
      );
      return;
    }
    Alert.alert(
      FOCUS_SHIELD_DEACTIVATE_PROMPT.title,
      FOCUS_SHIELD_DEACTIVATE_PROMPT.message,
      [
        { text: FOCUS_SHIELD_DEACTIVATE_PROMPT.cancelLabel, style: 'cancel' },
        {
          text: FOCUS_SHIELD_DEACTIVATE_PROMPT.confirmLabel,
          style: 'destructive',
          onPress: async () => {
            haptics.medium();
            onToggle(false);
            await focusShieldService.deactivate();
          },
        },
      ]
    );
  }, [isActive, onToggle, haptics]);

  const openDNDSettings = useCallback(async () => {
    haptics.light();
    await focusShieldService.openDNDSettings();
  }, [haptics]);

  return { requestToggle, openDNDSettings };
};
