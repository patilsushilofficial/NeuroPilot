import { useMemo } from 'react';

import { AppSettings } from '../../types';
import { SettingsItem } from './types';

interface UseSettingsSectionsArgs {
  settings: AppSettings;
  toggleHaptics: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  handleRateApp: () => void;
}

export const useSettingsSections = ({
  settings,
  toggleHaptics,
  updateSettings,
  handleRateApp,
}: UseSettingsSectionsArgs) => {
  const accessibilityItems = useMemo<SettingsItem[]>(
    () => [
      {
        kind: 'toggle',
        emoji: '📳',
        label: 'Haptic Feedback',
        description: 'Tactile reinforcement for task completion',
        value: settings.hapticsEnabled,
        onToggle: () => toggleHaptics(),
      },
      {
        kind: 'toggle',
        emoji: '🏃',
        label: 'Reduced Motion',
        description: 'Minimize animations (for sensory sensitivity)',
        value: settings.reducedMotion,
        onToggle: (v) => updateSettings({ reducedMotion: v }),
      },
      {
        kind: 'toggle',
        emoji: '💬',
        label: 'Motivational Quotes',
        description: 'Daily quotes on the home screen',
        value: settings.showMotivationalQuotes,
        onToggle: (v) => updateSettings({ showMotivationalQuotes: v }),
      },
    ],
    [settings.hapticsEnabled, settings.reducedMotion, settings.showMotivationalQuotes, toggleHaptics, updateSettings]
  );

  const aboutItems = useMemo<SettingsItem[]>(
    () => [
      {
        kind: 'action',
        emoji: '🧠',
        label: 'NeuroPilot',
        description: 'v1.0.0 · Built for ADHD brains',
        rightText: '💜',
      },
      {
        kind: 'action',
        emoji: '🔒',
        label: 'Privacy',
        description: 'All data stored on your device only. No internet required.',
        rightText: '100% Offline',
      },
      {
        kind: 'action',
        emoji: '🌟',
        label: 'Rate on Play Store',
        onPress: handleRateApp,
      },
    ],
    [handleRateApp]
  );

  return { accessibilityItems, aboutItems };
};
