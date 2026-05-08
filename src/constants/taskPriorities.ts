import { TaskPriority } from '../types';

/**
 * Canonical metadata for the three task priorities. Owned here so the chip
 * renderers in `QuickCapture`, `TaskCard`, and `AddTaskScreen` all read from
 * a single source of truth — no drift if labels or emojis change.
 */
export interface TaskPriorityOption {
  key: TaskPriority;
  emoji: string;
  /** Compact label, suitable for chip-style affordances (e.g. quick capture). */
  shortLabel: string;
  /** Full label, suitable for choice cards in form screens. */
  label: string;
  /** Helper sentence explaining when to pick this priority. */
  description: string;
}

export const TASK_PRIORITY_OPTIONS: readonly TaskPriorityOption[] = [
  { key: 'high', emoji: '🔴', shortLabel: 'High', label: 'High', description: 'Must do today' },
  { key: 'medium', emoji: '🟡', shortLabel: 'Med', label: 'Medium', description: 'Important but flexible' },
  { key: 'low', emoji: '🟢', shortLabel: 'Low', label: 'Low', description: 'Nice to do' },
] as const;

/** Compact options for inline pickers like `QuickCapture`. */
export const QUICK_CAPTURE_PRIORITY_OPTIONS = TASK_PRIORITY_OPTIONS.map(({ key, emoji, shortLabel }) => ({
  key,
  emoji,
  label: shortLabel,
}));

/**
 * `Badge` variant to use when displaying a task's priority chip. Centralised
 * here so cards, lists, and notifications stay visually consistent.
 */
export type PriorityBadgeVariant = 'error' | 'warning' | 'secondary';

const PRIORITY_BADGE_VARIANTS: Record<TaskPriority, PriorityBadgeVariant> = {
  high: 'error',
  medium: 'warning',
  low: 'secondary',
};

export const getPriorityBadgeVariant = (
  priority: TaskPriority
): PriorityBadgeVariant => PRIORITY_BADGE_VARIANTS[priority];
