import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useSettings } from '../../hooks/useSettings';
import { Card } from '../../components/common/Card';
import { SettingsItemList } from '../../components/settings/SettingsItemList';
import { SettingsRow } from '../../components/settings/SettingsRow';
import { SettingsSection } from '../../components/settings/SettingsSection';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { avatarSizes, borderWidths, iconSizes } from '../../theme/tokens';
import {
  EDIT_PROFILE_ROW,
  NOTIFICATIONS_ROW,
  RESET_ROW,
  SETTINGS_SCREEN_COPY,
  THEME_ROW,
} from './constants';
import { useSettingsSections } from './useSettingsSections';

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

  const { accessibilityItems, aboutItems } = useSettingsSections({
    settings,
    toggleHaptics,
    updateSettings,
    handleRateApp,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View>
            <Text style={[theme.text.h2, styles.screenTitle]}>{SETTINGS_SCREEN_COPY.title}</Text>
            <Text style={[theme.text.bodySmall, styles.screenSubtitle]}>
              {SETTINGS_SCREEN_COPY.subtitle}
            </Text>
          </View>
        </View>

        <SettingsSection title="PROFILE">
          <Card variant="glass" elevated style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{profile?.avatar ?? '🧠'}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={[theme.text.h4, styles.profileName]}>{profile?.name ?? 'Pilot'}</Text>
                <Text style={[theme.text.bodySmall, styles.profileMode]}>
                  {profile?.mode === 'child' ? '👶 Child Mode' : '💼 Adult Mode'}
                </Text>
              </View>
            </View>
          </Card>
          <Card noPadding style={styles.cardSpaced}>
            <SettingsRow
              emoji={EDIT_PROFILE_ROW.emoji}
              label={EDIT_PROFILE_ROW.label}
              description={EDIT_PROFILE_ROW.description}
              onPress={() => navigation.navigate('EditProfile')}
            />
          </Card>
        </SettingsSection>

        <SettingsSection title="APPEARANCE">
          <Card noPadding>
            <SettingsRow
              emoji={THEME_ROW.emoji}
              label={THEME_ROW.label}
              description={THEME_ROW.description}
              onPress={handleThemeChange}
              rightText={themeLabel}
            />
          </Card>
        </SettingsSection>

        <SettingsSection title="ACCESSIBILITY">
          <Card noPadding>
            <SettingsItemList items={accessibilityItems} />
          </Card>
        </SettingsSection>

        <SettingsSection title="NOTIFICATIONS">
          <Card noPadding>
            <SettingsRow
              emoji={NOTIFICATIONS_ROW.emoji}
              label={NOTIFICATIONS_ROW.label}
              description={NOTIFICATIONS_ROW.description}
              value={settings.notificationsEnabled}
              onToggle={(v) => updateSettings({ notificationsEnabled: v })}
            />
          </Card>
        </SettingsSection>

        <SettingsSection title="ABOUT">
          <Card noPadding>
            <SettingsItemList items={aboutItems} />
          </Card>
        </SettingsSection>

        <SettingsSection title="DANGER ZONE">
          <Card noPadding>
            <SettingsRow
              emoji={RESET_ROW.emoji}
              label={RESET_ROW.label}
              description={RESET_ROW.description}
              onPress={handleResetData}
              danger={RESET_ROW.danger}
            />
          </Card>
        </SettingsSection>

        <Card variant="surface" style={styles.footerCard}>
          <Text style={[theme.text.bodySmall, styles.footerText]}>
            {SETTINGS_SCREEN_COPY.footer}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: spacing.md,
      gap: spacing.lg,
      paddingBottom: spacing['7xl'],
    },
    screenTitle: { color: theme.colors.textPrimary },
    screenSubtitle: {
      color: theme.colors.textSecondary,
      marginTop: spacing['3xs'],
    },
    hero: {
      gap: spacing.xs,
    },
    profileCard: {
      borderRadius: borderRadius['2xl'],
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
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.primary,
    },
    avatarEmoji: { fontSize: iconSizes['2xl'] },
    profileCopy: { flex: 1, gap: spacing['3xs'] },
    profileName: { color: theme.colors.textPrimary },
    profileMode: { color: theme.colors.textSecondary },
    cardSpaced: { marginTop: spacing.xs },
    footerText: {
      color: theme.colors.textDisabled,
      textAlign: 'center',
    },
    footerCard: {
      borderRadius: borderRadius.xl,
    },
  });
};
