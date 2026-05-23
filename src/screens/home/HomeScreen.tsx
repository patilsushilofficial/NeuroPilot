import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHome } from '../../hooks/useHome';
import { QuickCapture } from '../../components/tasks/QuickCapture';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { durations } from '../../theme/tokens';

import { HomeHero } from '../../components/home/HomeHero';
import { TodayList } from '../../components/home/TodayList';
import { FocusActiveBanner } from '../../components/home/FocusActiveBanner';
import { QuickActionsGrid } from '../../components/home/QuickActionsGrid';
import { QuoteCard } from '../../components/home/QuoteCard';
import { SectionHeader } from '../../components/common/SectionHeader';

const ENTRY_STAGGER_MS = 60;

export const HomeScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    profile,
    stats,
    activeFocus,
    settings,
    todayQuote,
    refreshQuote,
    xpProgress,
    handleQuickCapture,
    handleAvatarPress,
    handleSettingsPress,
    avatarAnimStyle,
    navigation,
    topTodayItems,
    todayTotalCount,
    handleToggleTaskFromHome,
    handleToggleHabitFromHome,
    handleViewAllTasks,
    handleStartFocus,
    handleAddTask,
    handleViewHabits,
    handleViewProgress,
  } = useHome();

  const focusActive = activeFocus.status === 'running' || activeFocus.status === 'paused';

  // Stagger entrance animations so the eye lands on the hero first, then
  // each section settles in. Index increases as we go down the page.
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
          <HomeHero
            profileName={profile?.name}
            avatarEmoji={profile?.avatar ?? '🧠'}
            level={stats.level}
            totalXP={stats.totalXP}
            xpToNextLevel={stats.xpToNextLevel}
            xpProgress={xpProgress}
            currentStreak={stats.currentStreak}
            onSettingsPress={handleSettingsPress}
            onAvatarPress={handleAvatarPress}
            avatarAnimStyle={avatarAnimStyle}
          />
        </Animated.View>

        {focusActive && (
          <Animated.View entering={FadeInDown.duration(durations.base).delay(nextDelay())}>
            <FocusActiveBanner active={activeFocus} onPress={() => navigation.navigate('Focus')} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(durations.base).delay(nextDelay())}>
          <QuickCapture onCapture={handleQuickCapture} />
        </Animated.View>

        <Animated.View
          style={styles.section}
          entering={FadeInDown.duration(durations.base).delay(nextDelay())}
        >
          <SectionHeader
            title="Today"
            actionLabel={todayTotalCount > 0 ? 'View all' : undefined}
            onAction={todayTotalCount > 0 ? handleViewAllTasks : undefined}
          />
          <TodayList
            items={topTodayItems}
            totalCount={todayTotalCount}
            onToggleTask={handleToggleTaskFromHome}
            onToggleHabit={handleToggleHabitFromHome}
            onViewAllTasks={handleViewAllTasks}
          />
        </Animated.View>

        <Animated.View
          style={styles.section}
          entering={FadeInDown.duration(durations.base).delay(nextDelay())}
        >
          <SectionHeader title="Quick Actions" />
          <QuickActionsGrid
            onStartFocus={handleStartFocus}
            onAddTask={handleAddTask}
            onViewHabits={handleViewHabits}
            onViewProgress={handleViewProgress}
          />
        </Animated.View>

        {settings.showMotivationalQuotes && (
          <Animated.View entering={FadeInDown.duration(durations.base).delay(nextDelay())}>
            <QuoteCard text={todayQuote.text} author={todayQuote.author} onRefresh={refreshQuote} />
          </Animated.View>
        )}

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
