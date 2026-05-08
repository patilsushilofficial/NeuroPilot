import { HabitCategory, HabitFrequency } from '../types';

/**
 * Static config for the Add/Edit Habit form. Pulled out of the screen so the
 * UI and the form hook can share the same option lists.
 */

export const HABIT_EMOJIS = [
  '💪', '🧘', '📚', '🏃', '💧', '🌿', '🎯', '✍️', '🧹', '🛌',
  '🥗', '🎮', '🎵', '🌅', '🙏',
] as const;

export const HABIT_COLORS = [
  '#7B6CF6', '#4ECDC4', '#FF6B6B', '#FFD43B', '#51CF66',
  '#FF8C42', '#A9DEF9', '#E27396',
] as const;

export interface HabitCategoryOption {
  key: HabitCategory;
  emoji: string;
  label: string;
}

export const HABIT_CATEGORIES: readonly HabitCategoryOption[] = [
  { key: 'health', emoji: '💊', label: 'Health' },
  { key: 'focus', emoji: '🎯', label: 'Focus' },
  { key: 'movement', emoji: '🏃', label: 'Movement' },
  { key: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { key: 'sleep', emoji: '🛌', label: 'Sleep' },
  { key: 'social', emoji: '👥', label: 'Social' },
  { key: 'routine', emoji: '📋', label: 'Routine' },
  { key: 'custom', emoji: '⭐', label: 'Custom' },
] as const;

export interface HabitFrequencyOption {
  key: HabitFrequency;
  label: string;
  description: string;
}

export const HABIT_FREQUENCY_OPTIONS: readonly HabitFrequencyOption[] = [
  { key: 'daily', label: 'Every Day', description: 'Daily' },
  { key: 'weekdays', label: 'Weekdays', description: 'Mon–Fri' },
  { key: 'weekends', label: 'Weekends', description: 'Sat–Sun' },
] as const;

export const DEFAULT_HABIT_EMOJI: string = HABIT_EMOJIS[0];
export const DEFAULT_HABIT_COLOR: string = HABIT_COLORS[0];
export const DEFAULT_HABIT_CATEGORY: HabitCategory = 'routine';
export const DEFAULT_HABIT_FREQUENCY: HabitFrequency = 'daily';
