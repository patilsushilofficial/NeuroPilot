import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHome } from '../../hooks/useHome';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { QuickCapture } from '../../components/tasks/QuickCapture';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  borderWidths,
  iconSizes,
  avatarSizes,
  opacity as opacityTokens,
} from '../../theme/tokens';
import { fontSizes, letterSpacings } from '../../theme/typography';
import {
  getTimeGreeting,
  formatFocusTime,
  getLevelTitle,
  formatHomeHeaderDate,
} from '../../utils/dateUtils';
import { moderateScale } from '../../utils/responsive';

const ICON_BTN_SIZE = moderateScale(40);
const EDIT_BADGE_SIZE = moderateScale(16);
const SUMMARY_ICON_SIZE = moderateScale(36);

export const HomeScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    profile,
    stats,
    todaysTasks,
    todaysHabits,
    activeFocus,
    settings,
    todayQuote,
    completedTodayTasks,
    completedHabits,
    xpProgress,
    handleQuickCapture,
    handleAvatarPress,
    avatarAnimStyle,
    navigation,
    quickActions,
  } = useHome();

  // The avatar's glow shadow is a function of the theme primary, so it's
  // pulled out of `style={...}` and memoized rather than rebuilt every frame.
  const avatarGlowStyle = useMemo<ViewStyle>(
    () => theme.shadows.glow(theme.colors.primary),
    [theme]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[theme.text.h4, styles.dateLabel]}>
              {formatHomeHeaderDate()}
            </Text>
            <Text style={[theme.text.displayMedium, styles.greeting]}>
              {getTimeGreeting(profile?.name)}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.iconBtn}
              accessible
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              <Text style={styles.iconBtnEmoji}>⚙️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={opacityTokens.full}
              accessible
              accessibilityLabel="Edit your profile"
              accessibilityRole="button"
            >
              <Animated.View style={[styles.avatarBtn, avatarGlowStyle, avatarAnimStyle]}>
                <Text style={styles.avatarEmoji}>{profile?.avatar ?? '🧠'}</Text>
              </Animated.View>
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✏</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={styles.section} elevated>
          <View style={styles.xpRow}>
            <View>
              <Text style={[theme.text.labelSmall, styles.levelLabel]}>
                LEVEL {stats.level} · {getLevelTitle(stats.level).toUpperCase()}
              </Text>
              <Text style={[theme.text.xpDisplay, styles.xpDisplay]}>
                {stats.totalXP.toLocaleString()} <Text style={styles.xpUnit}>XP</Text>
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={[theme.text.h3, styles.streakNumber]}>{stats.currentStreak}</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={xpProgress} color={theme.colors.primary} />
            <View style={styles.progressFooter}>
              <Text style={[theme.text.labelSmall, styles.progressLabel]}>PROGRESS</Text>
              <Text style={[theme.text.labelSmall, styles.progressLabel]}>
                {stats.xpToNextLevel} TO GO
              </Text>
            </View>
          </View>
        </Card>

        <QuickCapture onCapture={handleQuickCapture} />

        <Text style={[theme.text.h4, styles.sectionHeading]}>Overview</Text>
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, styles.summaryFlex]} variant="surface">
            <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
              <Text style={styles.summaryEmoji}>✅</Text>
            </View>
            <Text style={[theme.text.h2, styles.summaryValue]}>
              {completedTodayTasks}
              <Text style={styles.summaryDenominator}>/{todaysTasks.length}</Text>
            </Text>
            <Text style={[theme.text.labelSmall, styles.summaryLabel]}>TASKS</Text>
          </Card>

          <Card style={[styles.summaryCard, styles.summaryFlex]} variant="surface">
            <View style={[styles.iconContainer, styles.iconContainerSecondary]}>
              <Text style={styles.summaryEmoji}>🔥</Text>
            </View>
            <Text style={[theme.text.h2, styles.summaryValue]}>
              {completedHabits}
              <Text style={styles.summaryDenominator}>/{todaysHabits.length}</Text>
            </Text>
            <Text style={[theme.text.labelSmall, styles.summaryLabel]}>HABITS</Text>
          </Card>

          <Card style={[styles.summaryCard, styles.summaryFlex]} variant="surface">
            <View style={[styles.iconContainer, styles.iconContainerWarning]}>
              <Text style={styles.summaryEmoji}>⏱️</Text>
            </View>
            <Text style={[theme.text.h2, styles.summaryValue]}>
              {formatFocusTime(stats.focusMinutes)}
            </Text>
            <Text style={[theme.text.labelSmall, styles.summaryLabel]}>FOCUS</Text>
          </Card>
        </View>

        {activeFocus.status === 'running' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Focus')}
            style={styles.focusBanner}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Active focus session — tap to view"
          >
            <Text style={styles.focusBannerEmoji}>🎯</Text>
            <Text style={[theme.text.bodyMedium, styles.focusBannerText]}>
              Focus session in progress…
            </Text>
            <Text style={[theme.text.labelMedium, styles.focusBannerCta]}>View →</Text>
          </TouchableOpacity>
        )}

        <Text style={[theme.text.h4, styles.sectionHeading]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              style={styles.quickAction}
              accessible
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
              <Text style={[theme.text.labelMedium, styles.quickActionLabel]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {settings.showMotivationalQuotes && (
          <Card style={styles.quoteCard}>
            <Text style={[theme.text.bodyMedium, styles.quoteText]}>"{todayQuote.text}"</Text>
            <Text style={[theme.text.labelSmall, styles.quoteAuthor]}>— {todayQuote.author}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing['4xl'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    headerTextContainer: { flex: 1 },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dateLabel: { color: theme.colors.textSecondary },
    greeting: {
      color: theme.colors.textPrimary,
      marginTop: spacing['2xs'],
    },
    avatarBtn: {
      width: avatarSizes.md,
      height: avatarSizes.md,
      borderRadius: avatarSizes.md / 2,
      borderWidth: borderWidths.thick,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
    },
    avatarEmoji: { fontSize: iconSizes.xl },
    iconBtn: {
      width: ICON_BTN_SIZE,
      height: ICON_BTN_SIZE,
      borderRadius: ICON_BTN_SIZE / 2,
      borderWidth: borderWidths.thin,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    iconBtnEmoji: { fontSize: iconSizes.lg },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: EDIT_BADGE_SIZE,
      height: EDIT_BADGE_SIZE,
      borderRadius: EDIT_BADGE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    editBadgeText: {
      fontSize: iconSizes.xs / 1.5,
      color: '#FFF',
    },
    section: {},
    xpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    levelLabel: {
      color: theme.colors.primary,
      letterSpacing: letterSpacings.widest,
    },
    xpDisplay: {
      color: theme.colors.textPrimary,
      marginTop: spacing['2xs'],
    },
    xpUnit: { color: theme.colors.primary },
    streakBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.surface,
    },
    streakEmoji: { fontSize: iconSizes.xl },
    streakNumber: { color: theme.colors.streakFire },
    progressBarContainer: { marginTop: spacing.md },
    progressFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    progressLabel: { color: theme.colors.textTertiary },
    sectionHeading: {
      color: theme.colors.textPrimary,
      marginTop: spacing.xs,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    summaryCard: {
      alignItems: 'flex-start',
      gap: spacing['3xs'],
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    summaryFlex: { flex: 1 },
    iconContainer: {
      width: SUMMARY_ICON_SIZE,
      height: SUMMARY_ICON_SIZE,
      borderRadius: SUMMARY_ICON_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainerPrimary: { backgroundColor: theme.colors.primaryContainer },
    iconContainerSecondary: { backgroundColor: theme.colors.secondaryContainer },
    iconContainerWarning: { backgroundColor: theme.colors.warningContainer },
    summaryEmoji: { fontSize: iconSizes.lg },
    summaryValue: {
      color: theme.colors.textPrimary,
      marginTop: spacing.xs,
    },
    summaryDenominator: {
      color: theme.colors.textTertiary,
      fontSize: fontSizes.md,
    },
    summaryLabel: { color: theme.colors.textTertiary },
    focusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    focusBannerEmoji: { fontSize: iconSizes.lg },
    focusBannerText: {
      color: theme.colors.primaryLight,
      flex: 1,
    },
    focusBannerCta: { color: theme.colors.primary },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    quickAction: {
      width: '48%',
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      alignItems: 'flex-start',
      gap: spacing.xs,
      borderWidth: borderWidths.thin,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    quickActionEmoji: { fontSize: iconSizes.xl },
    quickActionLabel: { color: theme.colors.textSecondary },
    quoteCard: {
      borderLeftWidth: borderWidths.extraThick,
      borderRadius: borderRadius.lg,
      borderLeftColor: theme.colors.primary,
    },
    quoteText: {
      color: theme.colors.textPrimary,
      fontStyle: 'italic',
    },
    quoteAuthor: {
      color: theme.colors.textTertiary,
      marginTop: spacing['2xs'],
    },
  });
