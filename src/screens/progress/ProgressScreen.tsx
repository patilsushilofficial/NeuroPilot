import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useProgressScreen } from '../../hooks/useProgressScreen';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';
import { WeeklyBarChart } from '../../components/progress/WeeklyBarChart';
import { getLevelTitle, formatFocusTime } from '../../utils/dateUtils';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  avatarSizes,
  borderWidths,
  iconSizes,
  opacity as opacityTokens,
} from '../../theme/tokens';

export const ProgressScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    profile,
    stats,
    xpProgress,
    xpInLevel,
    xpForLevel,
    unlockedAchievements,
    lockedAchievements,
  } = useProgressScreen();

  const statTiles: Array<{
    emoji: string;
    value: string | number;
    label: string;
    tone: TextStyle;
  }> = [
    { emoji: '✅', value: stats.tasksCompleted, label: 'Tasks Done', tone: styles.statSuccess },
    { emoji: '🔥', value: stats.habitsCompleted, label: 'Habits Done', tone: styles.statStreak },
    { emoji: '⏱️', value: formatFocusTime(stats.focusMinutes), label: 'Focus Time', tone: styles.statPrimary },
    { emoji: '🏅', value: stats.longestStreak, label: 'Best Streak', tone: styles.statWarning },
    { emoji: '⚡', value: stats.totalXP.toLocaleString(), label: 'Total XP', tone: styles.statPrimaryLight },
    { emoji: '🏆', value: unlockedAchievements.length, label: 'Achievements', tone: styles.statSecondary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>{profile?.avatar ?? '🧠'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[theme.text.h2, styles.profileName]}>{profile?.name ?? 'Pilot'}</Text>
            <Text style={[theme.text.bodySmall, styles.profileSubtitle]}>
              Level {stats.level} · {getLevelTitle(stats.level)}
            </Text>
            {stats.currentStreak > 0 && (
              <Text style={[theme.text.bodySmall, styles.profileStreak]}>
                🔥 {stats.currentStreak}-day streak
              </Text>
            )}
          </View>
        </View>

        <Card>
          <View style={styles.xpHeader}>
            <Text style={[theme.text.labelSmall, styles.subtleLabel]}>
              LEVEL {stats.level} PROGRESS
            </Text>
            <Text style={[theme.text.labelMedium, styles.xpHeaderValue]}>
              {xpInLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
            </Text>
          </View>
          <ProgressBar progress={xpProgress} color={theme.colors.primary} style={styles.xpBar} />
          <Text style={[theme.text.bodySmall, styles.xpFooter]}>
            🚀 {stats.xpToNextLevel.toLocaleString()} XP to Level {stats.level + 1}
          </Text>
        </Card>

        <View style={styles.statsGrid}>
          {statTiles.map((stat) => (
            <Card key={stat.label} style={styles.statCard} elevated>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={[theme.text.h3, stat.tone]}>{stat.value}</Text>
              <Text style={[theme.text.labelSmall, styles.subtleLabel]}>
                {stat.label.toUpperCase()}
              </Text>
            </Card>
          ))}
        </View>

        <Card>
          <Text style={[theme.text.h4, styles.cardHeading]}>This Week</Text>
          <WeeklyBarChart data={stats.weeklyXP} color={theme.colors.primary} label="XP Earned" />
          <View style={styles.chartGap} />
          <WeeklyBarChart data={stats.weeklyTasks} color={theme.colors.success} label="Tasks Completed" />
        </Card>

        {unlockedAchievements.length > 0 && (
          <View>
            <Text style={[theme.text.h4, styles.sectionHeading]}>
              🏆 Unlocked ({unlockedAchievements.length})
            </Text>
            <View style={styles.achievementGrid}>
              {unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} style={styles.achievementCard} elevated>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <Text style={[theme.text.labelMedium, styles.centerText, styles.textPrimary]}>
                    {achievement.title}
                  </Text>
                  <Text style={[theme.text.bodySmall, styles.centerText, styles.textTertiary]}>
                    {achievement.description}
                  </Text>
                  <Badge label={`+${achievement.xpReward} XP`} variant="primary" />
                </Card>
              ))}
            </View>
          </View>
        )}

        {lockedAchievements.length > 0 && (
          <View>
            <Text style={[theme.text.h4, styles.sectionHeading]}>
              🔒 Coming Up ({lockedAchievements.length})
            </Text>
            <View style={styles.lockedList}>
              {lockedAchievements.slice(0, 6).map((achievement) => (
                <View key={achievement.id} style={styles.lockedItem}>
                  <Text style={[styles.achievementEmoji, styles.lockedEmoji]}>
                    {achievement.emoji}
                  </Text>
                  <View style={styles.lockedTextWrap}>
                    <Text style={[theme.text.labelMedium, styles.textTertiary]}>
                      {achievement.title}
                    </Text>
                    <Text style={[theme.text.bodySmall, styles.textDisabled]}>
                      {achievement.description}
                    </Text>
                  </View>
                  <Badge label={`+${achievement.xpReward} XP`} variant="neutral" />
                </View>
              ))}
            </View>
          </View>
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
      paddingBottom: spacing['7xl'],
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatarLarge: {
      width: avatarSizes.xl,
      height: avatarSizes.xl,
      borderRadius: avatarSizes.xl / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryContainer,
    },
    avatarEmoji: { fontSize: iconSizes['4xl'] },
    profileInfo: {
      gap: spacing['3xs'],
    },
    profileName: { color: theme.colors.textPrimary },
    profileSubtitle: { color: theme.colors.textSecondary },
    profileStreak: { color: theme.colors.streakFire },
    xpHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subtleLabel: { color: theme.colors.textTertiary },
    xpHeaderValue: { color: theme.colors.primary },
    xpBar: { marginVertical: spacing.xs },
    xpFooter: { color: theme.colors.textSecondary },
    cardHeading: {
      color: theme.colors.textPrimary,
      marginBottom: spacing.sm,
    },
    sectionHeading: {
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    statCard: {
      width: '30%',
      alignItems: 'center',
      gap: spacing['3xs'],
      flexGrow: 1,
      paddingVertical: spacing.sm,
    },
    statEmoji: { fontSize: iconSizes.xl },
    statSuccess: { color: theme.colors.success },
    statStreak: { color: theme.colors.streakFire },
    statPrimary: { color: theme.colors.primary },
    statPrimaryLight: { color: theme.colors.primaryLight },
    statWarning: { color: theme.colors.warning },
    statSecondary: { color: theme.colors.secondary },
    achievementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    achievementCard: {
      width: '47%',
      alignItems: 'center',
      gap: spacing['2xs'],
      flexGrow: 1,
    },
    achievementEmoji: { fontSize: iconSizes['3xl'] },
    centerText: { textAlign: 'center' },
    textPrimary: { color: theme.colors.textPrimary },
    textTertiary: { color: theme.colors.textTertiary },
    textDisabled: { color: theme.colors.textDisabled },
    lockedList: { gap: spacing['2xs'] },
    lockedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    lockedEmoji: { opacity: opacityTokens.disabled },
    lockedTextWrap: { flex: 1 },
    chartGap: { height: spacing.md },
  });
