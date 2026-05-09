import type { SegmentedFilterOption } from '../components/common/SegmentedFilterBar';

/**
 * UI configuration for the Tasks list screen. The screen renders these
 * as filter segments via the shared `SegmentedFilterBar`; the hook
 * (`useTasksScreen`) uses the `key` to drive the filter selection.
 *
 * Keeping the tabs and the per-filter empty-state copy in this single
 * config module means the screen never holds raw lookup tables in its
 * JSX file and the hook never knows about presentational labels.
 */
export type TaskFilterKey = 'all' | 'today' | 'completed';

export const TASK_FILTER_TABS: readonly SegmentedFilterOption<TaskFilterKey>[] = [
  { key: 'all', label: 'All', icon: 'list', a11y: 'all tasks' },
  { key: 'today', label: 'Today', icon: 'calendar', a11y: "today's tasks" },
  { key: 'completed', label: 'Done', icon: 'check-circle', a11y: 'completed tasks' },
] as const;

/** Shape of the per-filter empty-state copy (no CTA — the extended FAB
 *  is the screen's only primary affordance). */
export interface FilterEmptyStateCopy {
  emoji: string;
  title: string;
  subtitle: string;
}

/**
 * Per-filter empty-state copy keyed by the filter key. Adding a new
 * filter means one entry here instead of a JSX conditional in the
 * screen.
 */
export const TASK_FILTER_EMPTY_STATE: Record<TaskFilterKey, FilterEmptyStateCopy> = {
  all: {
    emoji: '🧠',
    title: 'Brain clear!',
    subtitle: 'Nothing on your plate. Tap "Add task" to capture a thought.',
  },
  today: {
    emoji: '☀️',
    title: 'Nothing due today',
    subtitle: "You're free — or you can plan ahead with a new task.",
  },
  completed: {
    emoji: '🌱',
    title: 'No completed tasks yet',
    subtitle: 'Complete a task and it will land here as a quick win.',
  },
};
