import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAppStore } from '../store';
import { TASK_FILTER_TABS, TaskFilterKey } from '../constants/tasksUi';
import { sortTasksByPriorityAndCompletion } from '../utils/taskSorting';
import { useHaptics } from './useHaptics';
import type { Task } from '../types';

/**
 * One contiguous group rendered as a `SectionList` section on the
 * Tasks screen. Owning the shape here (not in the screen) keeps the
 * grouping rules — what counts as "Overdue" vs "Pending" — testable in
 * isolation and out of the render path.
 */
export interface TaskSection {
  /** Stable key the screen uses for `SectionList.keyExtractor`. */
  id: 'overdue' | 'pending' | 'today' | 'completed';
  title: string;
  /** Optional accent colour key from the theme (red for Overdue, etc).
   *  The header uses it to tint a small leading dot. */
  accent?: 'error' | 'primary' | 'success';
  data: Task[];
}

/**
 * View-model for the Tasks list screen. Owns:
 *  - The filter selection.
 *  - Derived list (filtered + sorted) and counters (pending / overdue).
 *  - **Sections** consumed by the `SectionList` — the screen never
 *    decides how to split or label groups.
 *  - Task lifecycle handlers (complete, delete) including XP/streak
 *    side effects and haptic feedback.
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

  const pendingCount = useMemo(() => tasks.filter((t) => t.status !== 'completed').length, [tasks]);

  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks]);
  const overdueCount = overdueTasks.length;

  /**
   * Section partitioning — the only place the "what counts as a group"
   * rule lives. Today/Completed filters render as a single section; the
   * All filter splits Overdue out so it gets its own header (red dot
   * + count) and lands at the top, exactly where ADHD users need it.
   */
  const sections = useMemo<TaskSection[]>(() => {
    if (filter === 'today') {
      if (sortedTasks.length === 0) return [];
      return [{ id: 'today', title: 'Today', accent: 'primary', data: sortedTasks }];
    }
    if (filter === 'completed') {
      if (sortedTasks.length === 0) return [];
      return [{ id: 'completed', title: 'Completed', accent: 'success', data: sortedTasks }];
    }
    // 'all' — split overdue from the rest. We rely on `getOverdueTasks`
    // (the store's authoritative definition) to decide membership rather
    // than re-deriving it inline; keeps the rule in one place.
    const overdueIds = new Set(overdueTasks.map((t) => t.id));
    const overdue: Task[] = [];
    const pending: Task[] = [];
    for (const task of sortedTasks) {
      if (overdueIds.has(task.id)) overdue.push(task);
      else pending.push(task);
    }
    const result: TaskSection[] = [];
    if (overdue.length > 0) {
      result.push({ id: 'overdue', title: 'Overdue', accent: 'error', data: overdue });
    }
    if (pending.length > 0) {
      result.push({ id: 'pending', title: 'Pending', accent: 'primary', data: pending });
    }
    return result;
  }, [filter, sortedTasks, overdueTasks]);

  /**
   * The pretty label for the active filter (used as the screen's
   * eyebrow). Derivation lives here — not in the screen — so the
   * mapping from key → label is the hook's responsibility, keeping
   * the JSX free of `.find()` calls and lookup constants.
   */
  const activeFilterLabel = useMemo(
    () => TASK_FILTER_TABS.find((t) => t.key === filter)?.label ?? '',
    [filter]
  );

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
    activeFilterLabel,
    selectFilter,
    sections,
    pendingCount,
    overdueCount,
    handleComplete,
    handleDelete,
    openAddTask,
    openTaskDetail,
  };
};
