import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, G } from 'react-native-svg';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore, selectStats } from '../../store';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';
import { ACHIEVEMENTS } from '../../constants/achievements';
import {
  getLevelTitle,
  formatFocusTime,
  getWeekDayLabels,
} from '../../utils/dateUtils';
import {
  getXPProgressInLevel,
  getLevelThreshold,
  getXPToNextLevel,
} from '../../constants/focusPresets';
import { spacing, borderRadius } from '../../theme/spacing';

/** Mini bar chart for weekly data */
const WeeklyBarChart: React.FC<{
  data: number[];
  color: string;
  label: string;
  height?: number;
}> = ({ data, color, label, height = 80 }) => {
  const theme = useAppTheme();
  const days = getWeekDayLabels();
  const max = Math.max(...data, 1);
  const barWidth = 28;
  const gap = 8;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <View>
      <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: 8 }]}>
        {label.toUpperCase()}
      </Text>
      <Svg width={chartWidth} height={height + 20}>
        <G>
          {data.map((val, i) => {
            const barH = (val / max) * height;
            const x = i * (barWidth + gap);
            const y = height - barH;
            return (
              <G key={i}>
                <Rect
                  x={x}
                  y={0}
                  width={barWidth}
                  height={height}
                  rx={6}
                  fill={theme.colors.border}
                />
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx={6}
                  fill={color}
                  opacity={0.85}
                />
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={styles.dayLabels}>
        {days.map((d, i) => (
          <Text key={i} style={[styles.dayLabel, { color: theme.colors.textTertiary, width: barWidth + gap }]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const ProgressScreen: React.FC = () => {
  const theme = useAppTheme();
  const stats = useAppStore(selectStats);
  const profile = useAppStore((s) => s.profile);

  const xpProgress = getXPProgressInLevel(stats.totalXP);
  const xpInLevel = stats.totalXP - getLevelThreshold(stats.level);
  const xpForLevel = getLevelThreshold(stats.level + 1) - getLevelThreshold(stats.level);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => stats.unlockedAchievements.includes(a.id)),
    [stats.unlockedAchievements]
  );

  const lockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => !stats.unlockedAchievements.includes(a.id) && !a.secret),
    [stats.unlockedAchievements]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={{ fontSize: 40 }}>{profile?.avatar ?? '🧠'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>
              {profile?.name ?? 'Pilot'}
            </Text>
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
              Level {stats.level} · {getLevelTitle(stats.level)}
            </Text>
            {stats.currentStreak > 0 && (
              <Text style={[theme.text.bodySmall, { color: theme.colors.streakFire }]}>
                🔥 {stats.currentStreak}-day streak
              </Text>
            )}
          </View>
        </View>

        {/* XP Progress */}
        <Card>
          <View style={styles.xpHeader}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>
              LEVEL {stats.level} PROGRESS
            </Text>
            <Text style={[theme.text.labelMedium, { color: theme.colors.primary }]}>
              {xpInLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
            </Text>
          </View>
          <ProgressBar progress={xpProgress} color={theme.colors.primary} height={10} style={{ marginVertical: 8 }} />
          <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
            🚀 {stats.xpToNextLevel.toLocaleString()} XP to Level {stats.level + 1}
          </Text>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { emoji: '✅', value: stats.tasksCompleted, label: 'Tasks Done', color: theme.colors.success },
            { emoji: '🔥', value: stats.habitsCompleted, label: 'Habits Done', color: theme.colors.streakFire },
            { emoji: '⏱️', value: formatFocusTime(stats.focusMinutes), label: 'Focus Time', color: theme.colors.primary },
            { emoji: '🏅', value: stats.longestStreak, label: 'Best Streak', color: theme.colors.warning },
            { emoji: '⚡', value: stats.totalXP.toLocaleString(), label: 'Total XP', color: theme.colors.primaryLight },
            { emoji: '🏆', value: unlockedAchievements.length, label: 'Achievements', color: theme.colors.secondary },
          ].map((stat) => (
            <Card key={stat.label} style={styles.statCard} elevated>
              <Text style={{ fontSize: 22 }}>{stat.emoji}</Text>
              <Text style={[theme.text.h3, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>
                {stat.label.toUpperCase()}
              </Text>
            </Card>
          ))}
        </View>

        {/* Weekly Charts */}
        <Card>
          <Text style={[theme.text.h4, { color: theme.colors.textPrimary, marginBottom: spacing[1.5] }]}>
            This Week
          </Text>
          <WeeklyBarChart data={stats.weeklyXP} color={theme.colors.primary} label="XP Earned" />
          <View style={{ height: spacing[2] }} />
          <WeeklyBarChart data={stats.weeklyTasks} color={theme.colors.success} label="Tasks Completed" />
        </Card>

        {/* Achievements */}
        {unlockedAchievements.length > 0 && (
          <View>
            <Text style={[theme.text.h4, { color: theme.colors.textPrimary, marginBottom: spacing[1] }]}>
              🏆 Unlocked ({unlockedAchievements.length})
            </Text>
            <View style={styles.achievementGrid}>
              {unlockedAchievements.map((achievement) => (
                <Card key={achievement.id} style={styles.achievementCard} elevated>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <Text style={[theme.text.labelMedium, { color: theme.colors.textPrimary, textAlign: 'center' }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
                    {achievement.description}
                  </Text>
                  <Badge label={`+${achievement.xpReward} XP`} variant="primary" />
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View>
            <Text style={[theme.text.h4, { color: theme.colors.textPrimary, marginBottom: spacing[1] }]}>
              🔒 Coming Up ({lockedAchievements.length})
            </Text>
            <View style={styles.lockedList}>
              {lockedAchievements.slice(0, 6).map((achievement) => (
                <View
                  key={achievement.id}
                  style={[styles.lockedItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.achievementEmoji, { opacity: 0.3 }]}>{achievement.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.text.labelMedium, { color: theme.colors.textTertiary }]}>
                      {achievement.title}
                    </Text>
                    <Text style={[theme.text.bodySmall, { color: theme.colors.textDisabled }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing[2],
    gap: spacing[2],
    paddingBottom: spacing[8],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 4,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  statCard: {
    width: '30%',
    alignItems: 'center',
    gap: 4,
    flexGrow: 1,
    paddingVertical: spacing[1.5],
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    gap: 6,
    flexGrow: 1,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  lockedList: {
    gap: spacing[0.5],
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[1.5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  dayLabels: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});
