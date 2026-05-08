/**
 * UI configuration for the Tasks list screen. The screen renders these as
 * filter pills; the hook (`useTasksScreen`) uses the `key` to drive the
 * filter selection.
 */
export type TaskFilterKey = 'all' | 'today' | 'completed';

export interface TaskFilterTab {
  key: TaskFilterKey;
  label: string;
  emoji: string;
}

export const TASK_FILTER_TABS: readonly TaskFilterTab[] = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'today', label: 'Today', emoji: '📅' },
  { key: 'completed', label: 'Done', emoji: '✅' },
] as const;
