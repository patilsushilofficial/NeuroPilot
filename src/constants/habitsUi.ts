import type { SegmentedFilterOption } from '../components/common/SegmentedFilterBar';
import type { FilterEmptyStateCopy } from './tasksUi';

/**
 * UI configuration for the Habits list screen. Mirrors the Tasks
 * pattern: filter tab descriptors and per-filter empty-state copy live
 * here so the screen file stays free of lookup tables and the view-
 * model hook never imports presentational copy.
 */
export type HabitFilterKey = 'all' | 'pending' | 'done';

export const HABIT_FILTER_TABS: readonly SegmentedFilterOption<HabitFilterKey>[] = [
  { key: 'all', label: 'All', icon: 'list', a11y: "today's habits" },
  { key: 'pending', label: 'To do', icon: 'circle', a11y: 'pending habits' },
  { key: 'done', label: 'Done', icon: 'check-circle', a11y: 'completed habits' },
] as const;

/**
 * Per-filter empty-state copy keyed by the filter key. The shape is
 * shared with Tasks via `FilterEmptyStateCopy` so the EmptyState
 * component contract (`emoji` + `title` + `subtitle`, no CTA) is
 * declared once.
 */
export const HABIT_FILTER_EMPTY_STATE: Record<HabitFilterKey, FilterEmptyStateCopy> = {
  all: {
    emoji: '🌱',
    title: 'No habits yet',
    subtitle:
      'Small daily habits rewire your brain over time. Tap "Add habit" to start with just one.',
  },
  pending: {
    emoji: '✨',
    title: 'All habits done!',
    subtitle: 'Nothing left for today — beautifully done.',
  },
  done: {
    emoji: '🌅',
    title: 'Nothing completed yet',
    subtitle: 'Tick a habit off and it will land here as a quick win.',
  },
};
