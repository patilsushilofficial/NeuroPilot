import { TabParamList } from '../navigation/types';
import type { IconName } from '../components/common/Icon';

/**
 * Tab-bar entries. The `name` lines up with `TabParamList` so the navigator
 * can drive both the screens and the custom tab bar from the same array.
 *
 * Icons are referenced by `IconName` so the curated `<Icon>` wrapper
 * (Feather glyphs) stays the single source of truth and we get autocomplete
 * + a type error if a key is removed from the icon set.
 */
export interface TabItem {
  name: keyof TabParamList;
  label: string;
  icon: IconName;
}

export const TAB_ITEMS: readonly TabItem[] = [
  { name: 'Home', label: 'Home', icon: 'home' },
  { name: 'TasksTab', label: 'Tasks', icon: 'list' },
  { name: 'Focus', label: 'Focus', icon: 'target' },
  { name: 'HabitsTab', label: 'Habits', icon: 'repeat' },
  { name: 'Progress', label: 'Stats', icon: 'bar-chart-2' },
] as const;
