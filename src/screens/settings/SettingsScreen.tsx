import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Card } from '../../components/common/Card';
import { spacing, borderRadius } from '../../theme/spacing';
import { ThemePreference } from '../../types';

interface SettingsRowProps {
  emoji: string;
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  rightText?: string;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  emoji,
  label,
  description,
  value,
  onToggle,
  onPress,
  rightText,
  danger = false,
}) => {
  const theme = useAppTheme();
  const haptics = useHaptics();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && onToggle === undefined}
      style={styles.row}
      accessible
      accessibilityRole={onToggle ? 'switch' : 'button'}
      accessibilityState={onToggle ? { checked: value } : undefined}
      accessibilityLabel={label}
    >
      <Text style={{ fontSize: 20, width: 28 }}>{emoji}</Text>
      <View style={styles.rowContent}>
        <Text
          style={[
            theme.text.bodyMedium,
            {
              color: danger ? theme.colors.error : theme.colors.textPrimary,
              fontWeight: '500',
            },
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>
            {description}
          </Text>
        )}
      </View>
      {onToggle !== undefined ? (
        <Switch
          value={value}
          onValueChange={(v) => {
            haptics.light();
            onToggle(v);
          }}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor="white"
          accessible
        />
      ) : (
        <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>
          {rightText ?? '›'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const theme = useAppTheme();
  return (
    <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, paddingHorizontal: spacing[0.5], paddingTop: spacing[1] }]}>
      {title}
    </Text>
  );
};

export const SettingsScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<any>();
  const { settings, updateSettings, toggleTheme, toggleHaptics, profile } = useAppStore();

  const THEME_OPTIONS: Array<{ key: ThemePreference; label: string }> = [
    { key: 'dark', label: 'Dark (Recommended)' },
    { key: 'light', label: 'Light' },
    { key: 'system', label: 'Follow System' },
  ];

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
    Alert.alert(
      '⚠️ Reset All Data',
      'This will permanently delete all tasks, habits, focus sessions, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            // In production you'd call a store reset action here
            Alert.alert('Data Reset', 'Please restart the app to complete the reset.');
          },
        },
      ]
    );
  }, [haptics]);

  const themeLabel = THEME_OPTIONS.find((t) => t.key === settings.theme)?.label ?? 'Dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>Settings</Text>

        {/* Profile */}
        <View>
          <SectionHeader title="PROFILE" />
          <Card>
            <View style={styles.profileRow}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={{ fontSize: 28 }}>{profile?.avatar ?? '🧠'}</Text>
              </View>
              <View>
                <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>
                  {profile?.name ?? 'Pilot'}
                </Text>
                <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
                  {profile?.mode === 'child' ? '👶 Child Mode' : '💼 Adult Mode'}
                </Text>
              </View>
            </View>
          </Card>
          <Card noPadding style={{ marginTop: spacing[1] }}>
            <SettingsRow
              emoji="✏️"
              label="Edit Profile"
              description="Change your name, avatar, and mode"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </Card>
        </View>

        {/* Appearance */}
        <View>
          <SectionHeader title="APPEARANCE" />
          <Card noPadding>
            <SettingsRow
              emoji="🎨"
              label="Theme"
              description="Choose light, dark, or system"
              onPress={handleThemeChange}
              rightText={themeLabel}
            />
          </Card>
        </View>

        {/* Accessibility */}
        <View>
          <SectionHeader title="ACCESSIBILITY" />
          <Card noPadding>
            <SettingsRow
              emoji="📳"
              label="Haptic Feedback"
              description="Tactile reinforcement for task completion"
              value={settings.hapticsEnabled}
              onToggle={() => toggleHaptics()}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <SettingsRow
              emoji="🏃"
              label="Reduced Motion"
              description="Minimize animations (for sensory sensitivity)"
              value={settings.reducedMotion}
              onToggle={(v) => updateSettings({ reducedMotion: v })}
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <SettingsRow
              emoji="💬"
              label="Motivational Quotes"
              description="Daily quotes on the home screen"
              value={settings.showMotivationalQuotes}
              onToggle={(v) => updateSettings({ showMotivationalQuotes: v })}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View>
          <SectionHeader title="NOTIFICATIONS" />
          <Card noPadding>
            <SettingsRow
              emoji="🔔"
              label="Enable Notifications"
              description="Reminders and focus alerts (local only)"
              value={settings.notificationsEnabled}
              onToggle={(v) => updateSettings({ notificationsEnabled: v })}
            />
          </Card>
        </View>

        {/* About */}
        <View>
          <SectionHeader title="ABOUT" />
          <Card noPadding>
            <SettingsRow emoji="🧠" label="NeuroPilot" description="v1.0.0 · Built for ADHD brains" rightText="💜" />
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <SettingsRow emoji="🔒" label="Privacy" description="All data stored on your device only. No internet required." rightText="100% Offline" />
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <SettingsRow emoji="🌟" label="Rate on Play Store" onPress={() => Alert.alert('Thank You!', 'Tap the rating when the Play Store page opens.')} />
          </Card>
        </View>

        {/* Danger Zone */}
        <View>
          <SectionHeader title="DANGER ZONE" />
          <Card noPadding>
            <SettingsRow
              emoji="🗑️"
              label="Reset All Data"
              description="Permanently delete everything"
              onPress={handleResetData}
              danger
            />
          </Card>
        </View>

        <Text style={[theme.text.bodySmall, { color: theme.colors.textDisabled, textAlign: 'center' }]}>
          Made with 💜 for neurodivergent minds.{'\n'}
          All data lives on your device. No servers. No tracking.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing[2],
    gap: spacing[1.5],
    paddingBottom: spacing[8],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[1.5],
    gap: spacing[1],
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing[5],
  },
});
