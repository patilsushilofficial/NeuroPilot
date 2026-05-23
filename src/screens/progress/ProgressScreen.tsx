import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useProgressScreen } from '../../hooks/useProgressScreen';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { durations } from '../../theme/tokens';

import { SectionHeader } from '../../components/common/SectionHeader';
import { ProgressHero } from '../../components/progress/ProgressHero';
import { HeadlineStats } from '../../components/progress/HeadlineStats';
import { WeeklyActivityCard } from '../../components/progress/WeeklyActivityCard';
import { AchievementsSection } from '../../components/progress/AchievementsSection';

const ENTRY_STAGGER_MS = 60;

/**
 * Progress screen — a one-stop "how am I doing?" recap.
 *
 *   1. Hero: identity (avatar + level), XP velocity (ring + bar), streak.
 *   2. Headline stats: marquee totals (tasks / habits / focus).
 *   3. Weekly activity: chart with XP/tasks toggle and today highlight.
 *   4. Achievements: unlocked cards, then locked rows you're working on.
 *
 * Each section fades in with a staggered delay so the eye lands on the
 * hero first and the secondary content settles in afterwards.
 */
export const ProgressScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const {
    profile,
    stats,
    xpProgress,
    xpInLevel,
    xpForLevel,
    headlineStats,
    unlockedAchievements,
    lockedAchievements,
    achievementsUnlockedCount,
    achievementsTotal,
    weeklyXPTotal,
    weeklyTasksTotal,
    todayWeekIndex,
  } = useProgressScreen();

  // Stagger entrance animations top-down so the hero is the first thing
  // to settle. Index increases as we walk down the page.
  let stagger = 0;
  const nextDelay = () => {
    const delay = stagger * ENTRY_STAGGER_MS;
    stagger += 1;
    return delay;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(durations.base).delay(nextDelay())}>
          <ProgressHero
            profileName={profile?.name}
            avatarEmoji={profile?.avatar ?? '🧠'}
            level={stats.level}
            totalXP={stats.totalXP}
            xpToNextLevel={stats.xpToNextLevel}
            xpInLevel={xpInLevel}
            xpForLevel={xpForLevel}
            xpProgress={xpProgress}
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(durations.base).delay(nextDelay())}>
          <HeadlineStats
            tasks={headlineStats.tasks}
            habits={headlineStats.habits}
            focus={headlineStats.focus}
          />
        </Animated.View>

        <Animated.View
          style={styles.section}
          entering={FadeInDown.duration(durations.base).delay(nextDelay())}
        >
          <SectionHeader title="Activity" />
          <WeeklyActivityCard
            weeklyXP={stats.weeklyXP}
            weeklyTasks={stats.weeklyTasks}
            weeklyXPTotal={weeklyXPTotal}
            weeklyTasksTotal={weeklyTasksTotal}
            todayWeekIndex={todayWeekIndex}
          />
        </Animated.View>

        <Animated.View
          style={styles.section}
          entering={FadeInDown.duration(durations.base).delay(nextDelay())}
        >
          <SectionHeader
            title="Achievements"
            actionLabel={`${achievementsUnlockedCount} / ${achievementsTotal}`}
          />
          <AchievementsSection unlocked={unlockedAchievements} locked={lockedAchievements} />
        </Animated.View>

        <View style={styles.bottomSpacer} />
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
      gap: spacing.lg,
    },
    section: {
      gap: spacing.sm,
    },
    bottomSpacer: {
      height: spacing['4xl'],
    },
  });
