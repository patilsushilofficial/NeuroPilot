export interface SettingsRowProps {
  emoji: string;
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  rightText?: string;
  danger?: boolean;
}

export type SettingsRowItem = Omit<SettingsRowProps, 'value' | 'onToggle'> & {
  kind: 'action';
};

export type SettingsToggleItem = Omit<SettingsRowProps, 'onPress' | 'rightText'> & {
  kind: 'toggle';
  value: boolean;
  onToggle: (v: boolean) => void;
};

export type SettingsItem = SettingsRowItem | SettingsToggleItem;
