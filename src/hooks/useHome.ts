import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore, selectStats, selectTodaysTasks, selectTodaysHabits, selectActiveFocus } from '../store';
import { getXPProgressInLevel, MOTIVATIONAL_QUOTES } from '../constants/focusPresets';
import { useQuickCapture } from './useQuickCapture';

export const useHome = () => {
  const navigation = useNavigation<any>();

  // Avatar spring animation
  const avatarScale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: avatarScale.value }] }));

  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore(selectStats);
  const todaysTasks = useAppStore(selectTodaysTasks);
  const todaysHabits = useAppStore(selectTodaysHabits);
  const activeFocus = useAppStore(selectActiveFocus);
  const { recordTaskComplete, addXP, isHabitCompletedToday } = useAppStore();
  const settings = useAppStore((s) => s.settings);

  // Random quote for today
  const todayQuote = useMemo(() => {
    const dayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[dayIndex];
  }, []);

  const completedTodayTasks = todaysTasks.filter((t) => t.status === 'completed').length;
  const completedHabits = todaysHabits.filter((h) => isHabitCompletedToday(h.id)).length;
  const xpProgress = getXPProgressInLevel(stats.totalXP);

  const { handleQuickCapture } = useQuickCapture();

  const handleAvatarPress = () => {
    avatarScale.value = withSpring(0.88, { damping: 8 }, () => {
      avatarScale.value = withSpring(1);
    });
    navigation.navigate('Settings', { screen: 'EditProfile' });
  };

  const quickActions = useMemo(
    () => [
      {
        emoji: '📋',
        label: 'Add Task',
        onPress: () => navigation.navigate('TasksTab', { screen: 'AddTask' }),
      },
      {
        emoji: '🎯',
        label: 'Start Focus',
        onPress: () => navigation.navigate('Focus'),
      },
      {
        emoji: '🔥',
        label: 'My Habits',
        onPress: () => navigation.navigate('HabitsTab'),
      },
      {
        emoji: '📈',
        label: 'Progress',
        onPress: () => navigation.navigate('Progress'),
      },
    ],
    [navigation]
  );

  return {
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
  };
};
