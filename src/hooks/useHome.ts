import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  useAppStore,
  selectStats,
  selectTodaysTasks,
  selectTodaysHabits,
  selectActiveFocus,
} from '../store';
import { getXPProgressInLevel, MOTIVATIONAL_QUOTES } from '../constants/focusPresets';
import { useQuickCapture } from './useQuickCapture';
import { useHaptics } from './useHaptics';
import { TaskPriority } from '../types';
import type { TodayItem } from '../components/home/TodayList';

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const TODAY_VISIBLE_LIMIT = 3;

export const useHome = () => {
  const navigation = useNavigation<any>();
  const haptics = useHaptics();

  const avatarScale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore(selectStats);
  const todaysTasks = useAppStore(selectTodaysTasks);
  const todaysHabits = useAppStore(selectTodaysHabits);
  const activeFocus = useAppStore(selectActiveFocus);
  const settings = useAppStore((s) => s.settings);
  const {
    completeTask,
    completeHabit,
    uncompleteHabit,
    addXP,
    recordTaskComplete,
    recordHabitComplete,
    isHabitCompletedToday,
  } = useAppStore();

  // Quote rotation — defaults to a deterministic per-day pick so two
  // launches on the same day land on the same quote, but the user can
  // refresh to roll a new one without waiting until tomorrow.
  const [quoteIndex, setQuoteIndex] = useState(
    () => new Date().getDate() % MOTIVATIONAL_QUOTES.length
  );
  const todayQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  const refreshQuote = useCallback(() => {
    haptics.light();
    setQuoteIndex((current) => {
      if (MOTIVATIONAL_QUOTES.length <= 1) return current;
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      }
      return next;
    });
  }, [haptics]);

  const completedTodayTasks = todaysTasks.filter((t) => t.status === 'completed').length;
  const completedHabits = todaysHabits.filter((h) => isHabitCompletedToday(h.id)).length;
  const xpProgress = getXPProgressInLevel(stats.totalXP);

  // Build the unified "today" feed: incomplete tasks first (by priority),
  // then incomplete habits, then completed habits at the bottom so the
  // checkmarks act as visible reinforcement without dominating the list.
  const todayItems = useMemo<TodayItem[]>(() => {
    const taskItems: TodayItem[] = [...todaysTasks]
      .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
      .map((t) => ({
        type: 'task',
        id: t.id,
        title: t.title,
        priority: t.priority,
        completed: t.status === 'completed',
      }));

    const habitItems: TodayItem[] = todaysHabits.map((h) => ({
      type: 'habit',
      id: h.id,
      title: h.title,
      emoji: h.emoji,
      completed: isHabitCompletedToday(h.id),
    }));

    const incompleteHabits = habitItems.filter((h) => !h.completed);
    const completedHabitsList = habitItems.filter((h) => h.completed);

    return [...taskItems, ...incompleteHabits, ...completedHabitsList];
  }, [todaysTasks, todaysHabits, isHabitCompletedToday]);

  const todayTotalCount = todayItems.length;
  const topTodayItems = useMemo(() => todayItems.slice(0, TODAY_VISIBLE_LIMIT), [todayItems]);

  const { handleQuickCapture } = useQuickCapture();

  const handleAvatarPress = useCallback(() => {
    avatarScale.value = withSpring(0.88, { damping: 8 }, () => {
      avatarScale.value = withSpring(1);
    });
    navigation.navigate('Settings', { screen: 'EditProfile' });
  }, [avatarScale, navigation]);

  const handleSettingsPress = useCallback(() => {
    // Explicitly target `SettingsMain` rather than just `'Settings'`. Without
    // the inner screen, React Navigation simply switches to the Settings tab
    // and leaves its existing stack state alone — so if the user previously
    // navigated to EditProfile (e.g. via the avatar), tapping the settings
    // cog would land them back on EditProfile instead of the settings root.
    // Targeting SettingsMain pops anything above it in the native stack.
    navigation.navigate('Settings', { screen: 'SettingsMain' });
  }, [navigation]);

  const handleToggleTaskFromHome = useCallback(
    (id: string) => {
      const xp = completeTask(id);
      if (xp > 0) {
        addXP(xp);
        recordTaskComplete();
        haptics.success();
      }
    },
    [completeTask, addXP, recordTaskComplete, haptics]
  );

  const handleToggleHabitFromHome = useCallback(
    (id: string) => {
      if (isHabitCompletedToday(id)) {
        uncompleteHabit(id);
        haptics.light();
        return;
      }
      const xp = completeHabit(id);
      if (xp > 0) {
        addXP(xp);
        recordHabitComplete();
        haptics.success();
      }
    },
    [completeHabit, uncompleteHabit, isHabitCompletedToday, addXP, recordHabitComplete, haptics]
  );

  const handleViewAllTasks = useCallback(() => {
    navigation.navigate('TasksTab', { screen: 'TasksList' });
  }, [navigation]);

  const handleStartFocus = useCallback(() => {
    navigation.navigate('Focus');
  }, [navigation]);

  const handleAddTask = useCallback(() => {
    navigation.navigate('TasksTab', { screen: 'AddTask' });
  }, [navigation]);

  const handleViewHabits = useCallback(() => {
    navigation.navigate('HabitsTab');
  }, [navigation]);

  const handleViewProgress = useCallback(() => {
    navigation.navigate('Progress');
  }, [navigation]);

  // Backwards-compat: existing tests still assert on `quickActions[]`
  // (label-keyed). Build the same array AND a tiered structure so the
  // new screen can render the visual hierarchy without breaking the
  // hook contract.
  const quickActions = useMemo(
    () => [
      { emoji: '📋', label: 'Add Task', onPress: handleAddTask },
      { emoji: '🎯', label: 'Start Focus', onPress: handleStartFocus },
      { emoji: '🔥', label: 'My Habits', onPress: handleViewHabits },
      { emoji: '📈', label: 'Progress', onPress: handleViewProgress },
    ],
    [handleAddTask, handleStartFocus, handleViewHabits, handleViewProgress]
  );

  return {
    profile,
    stats,
    todaysTasks,
    todaysHabits,
    activeFocus,
    settings,
    todayQuote,
    refreshQuote,
    completedTodayTasks,
    completedHabits,
    xpProgress,
    handleQuickCapture,
    handleAvatarPress,
    handleSettingsPress,
    avatarAnimStyle,
    navigation,
    quickActions,
    topTodayItems,
    todayTotalCount,
    handleToggleTaskFromHome,
    handleToggleHabitFromHome,
    handleViewAllTasks,
    handleStartFocus,
    handleAddTask,
    handleViewHabits,
    handleViewProgress,
  };
};
