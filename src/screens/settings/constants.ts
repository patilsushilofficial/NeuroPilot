import { SettingsRowProps } from './types';

export const SETTINGS_SCREEN_COPY = {
  title: 'Settings',
  subtitle: 'Personalize NeuroPilot for your focus style.',
  footer:
    'Made with 💜 for neurodivergent minds.\nAll data lives on your device. No servers. No tracking.',
} as const;

export const EDIT_PROFILE_ROW: SettingsRowProps = {
  emoji: '✏️',
  label: 'Edit Profile',
  description: 'Change your name, avatar, and mode',
};

export const THEME_ROW: SettingsRowProps = {
  emoji: '🎨',
  label: 'Theme',
  description: 'Choose light, dark, or system',
};

export const NOTIFICATIONS_ROW: Omit<SettingsRowProps, 'value' | 'onToggle'> = {
  emoji: '🔔',
  label: 'Enable Notifications',
  description: 'Reminders and focus alerts (local only)',
};

export const RESET_ROW: SettingsRowProps = {
  emoji: '🗑️',
  label: 'Reset All Data',
  description: 'Permanently delete everything',
  danger: true,
};
