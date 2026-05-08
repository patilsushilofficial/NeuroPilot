import { TabParamList } from '../navigation/types';

/**
 * Tab-bar entries. The `name` lines up with `TabParamList` so the navigator
 * can drive both the screens and the custom tab bar from the same array.
 *
 * `emoji` and `activeEmoji` are split now to make the future swap to
 * dedicated active icons trivial.
 */
export interface TabItem {
  name: keyof TabParamList;
  label: string;
  emoji: string;
  activeEmoji: string;
}

export const TAB_ITEMS: readonly TabItem[] = [
  { name: 'Home', label: 'Home', emoji: '🏠', activeEmoji: '🏠' },
  { name: 'TasksTab', label: 'Tasks', emoji: '📋', activeEmoji: '📋' },
  { name: 'Focus', label: 'Focus', emoji: '🎯', activeEmoji: '🎯' },
  { name: 'HabitsTab', label: 'Habits', emoji: '🔥', activeEmoji: '🔥' },
  { name: 'Progress', label: 'Stats', emoji: '📈', activeEmoji: '📈' },
] as const;
