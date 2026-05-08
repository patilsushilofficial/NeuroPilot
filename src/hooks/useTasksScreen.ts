import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store';
import { TaskFilterKey } from '../constants/tasksUi';
import { sortTasksByPriorityAndCompletion } from '../utils/taskSorting';
import { useHaptics } from './useHaptics';

/**
 * View-model for the Tasks list screen. Owns:
 *  - The filter selection.
 *  - Derived list (filtered + sorted) and counters (pending / overdue).
 *  - Task lifecycle handlers (complete, delete) including XP/streak side
 *    effects and haptic feedback.
 *
 * The screen renders this state; it does not mutate the store directly.
 */
export const useTasksScreen = () => {
  const haptics = useHaptics();
  const navigation = useNavigation<any>();

  const {
    tasks,
    completeTask,
    deleteTask,
    addXP,
    recordTaskComplete,
    getTodaysTasks,
    getOverdueTasks,
  } = useAppStore();

  const [filter, setFilter] = useState<TaskFilterKey>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'today') return getTodaysTasks();
    if (filter === 'completed') return tasks.filter((t) => t.status === 'completed');
    return tasks.filter((t) => t.status !== 'completed');
  }, [tasks, filter, getTodaysTasks]);

  const sortedTasks = useMemo(
    () => sortTasksByPriorityAndCompletion(filteredTasks),
    [filteredTasks]
  );

  const pendingCount = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').length,
    [tasks]
  );

  const overdueCount = useMemo(() => getOverdueTasks().length, [getOverdueTasks]);

  const selectFilter = useCallback(
    (next: TaskFilterKey) => {
      haptics.light();
      setFilter(next);
    },
    [haptics]
  );

  const handleComplete = useCallback(
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

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            deleteTask(id);
          },
        },
      ]);
    },
    [deleteTask, haptics]
  );

  const openAddTask = useCallback(() => {
    navigation.navigate('AddTask');
  }, [navigation]);

  const openTaskDetail = useCallback(
    (id: string) => {
      navigation.navigate('AddTask', { taskId: id });
    },
    [navigation]
  );

  return {
    filter,
    selectFilter,
    sortedTasks,
    pendingCount,
    overdueCount,
    handleComplete,
    handleDelete,
    openAddTask,
    openTaskDetail,
  };
};
