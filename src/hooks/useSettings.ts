import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store';
import {
  DEFAULT_THEME_LABEL,
  RESET_DATA_PROMPT,
  RATE_APP_PROMPT,
  THEME_OPTIONS,
} from '../constants/settings';
import { useHaptics } from './useHaptics';

/**
 * View-model for the Settings screen. Wraps the store actions the screen
 * needs and orchestrates the confirmation dialogs (theme picker, reset,
 * rate-app). Copy/options come from `constants/settings`.
 */
export const useSettings = () => {
  const haptics = useHaptics();
  const navigation = useNavigation<any>();
  const { settings, updateSettings, toggleHaptics, profile, resetAllData } = useAppStore();

  const handleThemeChange = useCallback(() => {
    Alert.alert(
      'App Theme',
      'Choose your preferred theme',
      THEME_OPTIONS.map((opt) => ({
        text: opt.label + (settings.theme === opt.key ? ' ✓' : ''),
        onPress: () => {
          haptics.light();
          updateSettings({ theme: opt.key });
        },
      }))
    );
  }, [settings.theme, updateSettings, haptics]);

  const handleResetData = useCallback(() => {
    Alert.alert(RESET_DATA_PROMPT.title, RESET_DATA_PROMPT.message, [
      { text: RESET_DATA_PROMPT.cancelLabel, style: 'cancel' },
      {
        text: RESET_DATA_PROMPT.confirmLabel,
        style: 'destructive',
        onPress: async () => {
          haptics.warning();
          try {
            await resetAllData();
            Alert.alert(RESET_DATA_PROMPT.successTitle, RESET_DATA_PROMPT.successMessage);
          } catch {
            Alert.alert(RESET_DATA_PROMPT.errorTitle, RESET_DATA_PROMPT.errorMessage);
          }
        },
      },
    ]);
  }, [haptics, resetAllData]);

  const handleRateApp = useCallback(() => {
    haptics.light();
    Alert.alert(RATE_APP_PROMPT.title, RATE_APP_PROMPT.message);
  }, [haptics]);

  const themeLabel =
    THEME_OPTIONS.find((t) => t.key === settings.theme)?.label ?? DEFAULT_THEME_LABEL;

  return {
    settings,
    profile,
    themeLabel,
    handleThemeChange,
    handleResetData,
    handleRateApp,
    toggleHaptics,
    updateSettings,
    navigation,
  };
};
