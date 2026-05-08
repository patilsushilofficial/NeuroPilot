import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useSettings } from '../../hooks/useSettings';
import { Card } from '../../components/common/Card';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { avatarSizes, borderWidths, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

const ROW_EMOJI_WIDTH = moderateScale(28);

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
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowContent}>
        <Text
          style={[
            theme.text.bodyMedium,
            styles.rowLabel,
            danger ? styles.rowLabelDanger : styles.rowLabelDefault,
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={[theme.text.bodySmall, styles.rowDescription]}>{description}</Text>
        )}
      </View>
      {onToggle !== undefined ? (
        <Switch
          testID={`switch-${label}`}
          value={value}
          onValueChange={(v) => {
            haptics.light();
            onToggle(v);
          }}
          trackColor={styles.switchTrackColors}
          thumbColor="white"
          accessible
        />
      ) : (
        <Text style={[theme.text.bodySmall, styles.rowChevron]}>{rightText ?? '›'}</Text>
      )}
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <Text style={[theme.text.labelSmall, styles.sectionHeader]}>{title}</Text>;
};

export const SettingsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    settings,
    profile,
    themeLabel,
    handleThemeChange,
    handleResetData,
    handleRateApp,
    toggleHaptics,
    updateSettings,
    navigation,
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.h2, styles.screenTitle]}>Settings</Text>

        <View>
          <SectionHeader title="PROFILE" />
          <Card>
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{profile?.avatar ?? '🧠'}</Text>
              </View>
              <View>
                <Text style={[theme.text.h4, styles.profileName]}>{profile?.name ?? 'Pilot'}</Text>
                <Text style={[theme.text.bodySmall, styles.profileMode]}>
                  {profile?.mode === 'child' ? '👶 Child Mode' : '💼 Adult Mode'}
                </Text>
              </View>
            </View>
          </Card>
          <Card noPadding style={styles.cardSpaced}>
            <SettingsRow
              emoji="✏️"
              label="Edit Profile"
              description="Change your name, avatar, and mode"
              onPress={() => navigation.navigate('EditProfile')}
            />
          </Card>
        </View>

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
            <View style={styles.divider} />
            <SettingsRow
              emoji="🏃"
              label="Reduced Motion"
              description="Minimize animations (for sensory sensitivity)"
              value={settings.reducedMotion}
              onToggle={(v) => updateSettings({ reducedMotion: v })}
            />
            <View style={styles.divider} />
            <SettingsRow
              emoji="💬"
              label="Motivational Quotes"
              description="Daily quotes on the home screen"
              value={settings.showMotivationalQuotes}
              onToggle={(v) => updateSettings({ showMotivationalQuotes: v })}
            />
          </Card>
        </View>

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

        <View>
          <SectionHeader title="ABOUT" />
          <Card noPadding>
            <SettingsRow emoji="🧠" label="NeuroPilot" description="v1.0.0 · Built for ADHD brains" rightText="💜" />
            <View style={styles.divider} />
            <SettingsRow
              emoji="🔒"
              label="Privacy"
              description="All data stored on your device only. No internet required."
              rightText="100% Offline"
            />
            <View style={styles.divider} />
            <SettingsRow
              emoji="🌟"
              label="Rate on Play Store"
              onPress={handleRateApp}
            />
          </Card>
        </View>

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

        <Text style={[theme.text.bodySmall, styles.footerText]}>
          Made with 💜 for neurodivergent minds.{'\n'}
          All data lives on your device. No servers. No tracking.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => {
  // Switch's `trackColor` is a typed object literal, not a style key. We
  // pre-allocate it once per theme so JSX can reference it like any other
  // stylesheet entry without rebuilding it on every render.
  const switchTrackColors = { false: theme.colors.border, true: theme.colors.primary };

  return Object.assign(
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      content: {
        padding: spacing.md,
        gap: spacing.sm,
        paddingBottom: spacing['7xl'],
      },
      screenTitle: { color: theme.colors.textPrimary },
      sectionHeader: {
        color: theme.colors.textTertiary,
        paddingHorizontal: spacing['2xs'],
        paddingTop: spacing.xs,
      },
      profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
      },
      avatarCircle: {
        width: avatarSizes.lg,
        height: avatarSizes.lg,
        borderRadius: avatarSizes.lg / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryContainer,
      },
      avatarEmoji: { fontSize: iconSizes['2xl'] },
      profileName: { color: theme.colors.textPrimary },
      profileMode: { color: theme.colors.textSecondary },
      cardSpaced: { marginTop: spacing.xs },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
      },
      rowEmoji: {
        fontSize: iconSizes.lg,
        width: ROW_EMOJI_WIDTH,
      },
      rowContent: {
        flex: 1,
        gap: spacing['3xs'],
      },
      rowLabel: { fontWeight: fontWeights.medium },
      rowLabelDefault: { color: theme.colors.textPrimary },
      rowLabelDanger: { color: theme.colors.error },
      rowDescription: { color: theme.colors.textTertiary },
      rowChevron: { color: theme.colors.textTertiary },
      divider: {
        height: borderWidths.hairline,
        marginLeft: spacing['4xl'],
        backgroundColor: theme.colors.divider,
      },
      footerText: {
        color: theme.colors.textDisabled,
        textAlign: 'center',
      },
    }),
    { switchTrackColors }
  );
};
