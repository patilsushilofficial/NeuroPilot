import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store';
import { useHaptics } from './useHaptics';
import { HABIT_FILTER_TABS, type HabitFilterKey } from '../constants/habitsUi';
import type { Habit } from '../types';

/**
 * One contiguous group rendered as a `SectionList` section on the
 * Habits screen. Owning the shape here (not in the screen) keeps the
 * grouping rules — what counts as "To do" vs "Completed" — testable in
 * isolation and out of the render path.
 */
export interface HabitSection {
  /** Stable key the screen uses for `SectionList.keyExtractor`. */
  id: 'pending' | 'done';
  title: string;
  /** Accent colour key from the theme — drives the `ListSectionHeader`
   *  dot + count chip tint. */
  accent: 'primary' | 'success';
  data: Habit[];
}

/**
 * View-model for the Habits list screen. Owns:
 *  - The filter selection.
 *  - Derived list (today's habits, partitioned into Pending / Done).
 *  - Counts and progress (used by the progress card and subtitle).
 *  - The toggle orchestration (haptics + XP + streak) and navigation
 *    handlers used by the screen.
 *
 * The screen renders this state; it does not mutate the store directly.
 */
export const useHabitsScreen = () => {
  const haptics = useHaptics();
  const navigation = useNavigation<any>();

  const {
    getTodaysHabits,
    completeHabit,
    uncompleteHabit,
    isHabitCompletedToday,
    addXP,
    recordHabitComplete,
  } = useAppStore();

  const [filter, setFilter] = useState<HabitFilterKey>('all');

  const todaysHabits = getTodaysHabits();

  // Pre-partition once so every downstream selector (counts, progress,
  // sections, filtered list) reads from the same source of truth.
  const { pending, done } = useMemo(() => {
    const pendingList: Habit[] = [];
    const doneList: Habit[] = [];
    for (const habit of todaysHabits) {
      if (isHabitCompletedToday(habit.id)) doneList.push(habit);
      else pendingList.push(habit);
    }
    return { pending: pendingList, done: doneList };
  }, [todaysHabits, isHabitCompletedToday]);

  const completedCount = done.length;
  const pendingCount = pending.length;
  const totalCount = todaysHabits.length;

  const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
  const isPerfectDay = totalCount > 0 && completionRate === 1;

  /**
   * Section partitioning — the only place the "what counts as a group"
   * rule lives. Pending/Done filters each render a single section so
   * the user sees only that tile of the day.
   */
  const sections = useMemo<HabitSection[]>(() => {
    if (filter === 'pending') {
      if (pending.length === 0) return [];
      return [{ id: 'pending', title: 'To do', accent: 'primary', data: pending }];
    }
    if (filter === 'done') {
      if (done.length === 0) return [];
      return [{ id: 'done', title: 'Completed', accent: 'success', data: done }];
    }
    // 'all' — show both groups, To do first so the next action is
    // always at the top of the screen.
    const result: HabitSection[] = [];
    if (pending.length > 0) {
      result.push({ id: 'pending', title: 'To do', accent: 'primary', data: pending });
    }
    if (done.length > 0) {
      result.push({ id: 'done', title: 'Completed', accent: 'success', data: done });
    }
    return result;
  }, [filter, pending, done]);

  /**
   * Pretty label for the active filter (used as the screen's eyebrow).
   * Same rationale as `useTasksScreen.activeFilterLabel`: derivation
   * lives in the hook so the JSX stays free of `.find()` calls and
   * lookup constants.
   */
  const activeFilterLabel = useMemo(
    () => HABIT_FILTER_TABS.find((t) => t.key === filter)?.label ?? '',
    [filter]
  );

  const selectFilter = useCallback(
    (next: HabitFilterKey) => {
      haptics.light();
      setFilter(next);
    },
    [haptics]
  );

  const handleToggle = useCallback(
    (habitId: string) => {
      const isAlreadyDone = isHabitCompletedToday(habitId);
      if (isAlreadyDone) {
        uncompleteHabit(habitId);
        return;
      }
      const xp = completeHabit(habitId);
      if (xp > 0) {
        addXP(xp);
        recordHabitComplete();
        haptics.success();
      }
    },
    [completeHabit, uncompleteHabit, isHabitCompletedToday, addXP, recordHabitComplete, haptics]
  );

  const openAddHabit = useCallback(() => navigation.navigate('AddHabit'), [navigation]);

  const openHabitDetail = useCallback(
    (habitId: string) => navigation.navigate('AddHabit', { habitId }),
    [navigation]
  );

  return {
    filter,
    activeFilterLabel,
    selectFilter,
    sections,
    completedCount,
    pendingCount,
    totalCount,
    completionRate,
    isPerfectDay,
    handleToggle,
    openAddHabit,
    openHabitDetail,
  };
};
