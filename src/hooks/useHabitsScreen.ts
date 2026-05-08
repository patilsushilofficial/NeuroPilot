import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store';
import { useHaptics } from './useHaptics';

/**
 * View-model for the Habits list screen. Owns the daily-habit selection,
 * derived counts/progress, the toggle orchestration (haptics + XP +
 * streak), and navigation handlers used by the screen.
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

  const todaysHabits = getTodaysHabits();

  const completedCount = useMemo(
    () => todaysHabits.filter((h) => isHabitCompletedToday(h.id)).length,
    [todaysHabits, isHabitCompletedToday]
  );

  const completionRate =
    todaysHabits.length > 0 ? completedCount / todaysHabits.length : 0;
  const isPerfectDay = todaysHabits.length > 0 && completionRate === 1;

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
    [
      completeHabit,
      uncompleteHabit,
      isHabitCompletedToday,
      addXP,
      recordHabitComplete,
      haptics,
    ]
  );

  const openAddHabit = useCallback(
    () => navigation.navigate('AddHabit'),
    [navigation]
  );

  const openHabitDetail = useCallback(
    (habitId: string) => navigation.navigate('AddHabit', { habitId }),
    [navigation]
  );

  return {
    todaysHabits,
    completedCount,
    completionRate,
    isPerfectDay,
    isHabitCompletedToday,
    handleToggle,
    openAddHabit,
    openHabitDetail,
  };
};
