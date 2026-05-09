import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHabitsScreen, type HabitSection } from '../../hooks/useHabitsScreen';
import { HabitCard } from '../../components/habits/HabitCard';
import { HabitsProgressCard } from '../../components/habits/HabitsProgressCard';
import { SegmentedFilterBar } from '../../components/common/SegmentedFilterBar';
import { ListSectionHeader } from '../../components/common/ListSectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { durations } from '../../theme/tokens';
import {
  HABIT_FILTER_TABS,
  HABIT_FILTER_EMPTY_STATE,
} from '../../constants/habitsUi';
import type { Habit } from '../../types';

/**
 * Habits list screen. Pure composition: the view-model
 * (`useHabitsScreen`) owns the partition into pending/done sections,
 * counts, completion ratio, and navigation handlers. The screen only
 * lays things out and answers two presentational questions: which
 * colour to tint the subtitle on a perfect day, and how to map a
 * `section.id` onto the `HabitCard`'s `isCompletedToday` prop.
 *
 * Why `section.id === 'done'` (not a per-card store query):
 *  - The hook's partition is the single source of truth. Re-querying
 *    the store per card would let the two diverge silently and forces
 *    an extra render-time selector call.
 *  - It also lets us drop `isHabitCompletedToday` from the hook's
 *    public API — fewer escape hatches, fewer ways to get state wrong.
 */
export const HabitsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    filter,
    activeFilterLabel,
    selectFilter,
    sections,
    completedCount,
    totalCount,
    completionRate,
    isPerfectDay,
    handleToggle,
    openAddHabit,
    openHabitDetail,
  } = useHabitsScreen();

  const renderItem = useCallback(
    ({ item, section }: { item: Habit; section: HabitSection }) => (
      <HabitCard
        habit={item}
        isCompletedToday={section.id === 'done'}
        onToggle={handleToggle}
        onLongPress={openHabitDetail}
      />
    ),
    [handleToggle, openHabitDetail]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: HabitSection }) => (
      <Animated.View entering={FadeInDown.duration(durations.base)}>
        <ListSectionHeader
          title={section.title}
          count={section.data.length}
          accent={section.accent}
        />
      </Animated.View>
    ),
    []
  );

  const empty = HABIT_FILTER_EMPTY_STATE[filter];

  // Subtitle counter tints success-green on a perfect day so the
  // celebration is visible even before the user scrolls down to the
  // progress card. Pure presentation decision — the hook only tells us
  // *whether* the day is perfect.
  const subtitleColor = isPerfectDay
    ? theme.colors.success
    : theme.colors.textSecondary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[theme.text.labelSmall, styles.eyebrow]}>
          {activeFilterLabel.toUpperCase()}
        </Text>
        <Text style={[theme.text.h1, styles.title]}>Habits</Text>
        <Text
          style={[theme.text.bodySmall, styles.subtitle, { color: subtitleColor }]}
        >
          {completedCount} of {totalCount} done today
        </Text>
      </View>

      {totalCount > 0 && (
        <View style={styles.progressCardWrap}>
          <HabitsProgressCard
            completedCount={completedCount}
            totalCount={totalCount}
            completionRate={completionRate}
            isPerfectDay={isPerfectDay}
          />
        </View>
      )}

      {totalCount > 0 && (
        <View style={styles.filterRow}>
          <SegmentedFilterBar
            options={HABIT_FILTER_TABS}
            selected={filter}
            onSelect={selectFilter}
          />
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            emoji={empty.emoji}
            title={empty.title}
            subtitle={empty.subtitle}
          />
        }
      />

      <FloatingActionButton
        onPress={openAddHabit}
        label="Add habit"
        accessibilityLabel="Add habit"
      />
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    eyebrow: {
      color: theme.colors.textTertiary,
      marginBottom: spacing['3xs'],
    },
    title: { color: theme.colors.textPrimary },
    subtitle: {
      marginTop: spacing['3xs'],
    },
    progressCardWrap: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    filterRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing['8xl'],
      flexGrow: 1,
    },
  });
