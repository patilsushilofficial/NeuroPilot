import { ThemePreference } from '../types';

/**
 * Theme preference options for the Settings screen. Lives in `constants` so
 * the picker dialog (in `useSettings`) and any future preference UI can
 * import the same list.
 */
export interface ThemeOption {
  key: ThemePreference;
  label: string;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { key: 'dark', label: 'Dark (Recommended)' },
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'Follow System' },
] as const;

export const DEFAULT_THEME_LABEL = 'Dark';

export const RESET_DATA_PROMPT = {
  title: '⚠️ Reset All Data',
  message:
    'This will permanently delete all tasks, habits, focus sessions, and progress. This cannot be undone.',
  cancelLabel: 'Cancel',
  confirmLabel: 'Reset Everything',
  successTitle: 'Data Reset',
  successMessage: 'All your data has been cleared.',
  errorTitle: 'Reset Failed',
  errorMessage: 'Something went wrong while resetting. Please try again.',
};

export const RATE_APP_PROMPT = {
  title: 'Thank You!',
  message: 'Tap the rating when the Play Store page opens.',
};
