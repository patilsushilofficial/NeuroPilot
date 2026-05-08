import { Task, TaskPriority } from '../types';

/**
 * Pure ordering primitives for tasks. Lifted out of `TasksScreen` so the
 * comparator can be unit-tested and reused without dragging React in.
 */

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Sorts a list of tasks so that:
 *  1. Active tasks come before completed ones.
 *  2. Within each group, higher-priority tasks rank above lower-priority ones.
 *
 * Returns a new array; the input is not mutated.
 */
export const sortTasksByPriorityAndCompletion = (tasks: readonly Task[]): Task[] =>
  [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  });
