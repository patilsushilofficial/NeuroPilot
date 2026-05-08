import { UserMode } from '../types';

/**
 * Profile-related option lists. Shared between `OnboardingScreen` and
 * `EditProfileScreen` so the avatar set and mode descriptions never drift.
 */

export const PROFILE_AVATARS = [
  '🧠', '🚀', '⚡', '🎯', '🌊', '🦋', '🔥', '✨', '🎮', '🌟',
  '🦁', '🐬', '🦅', '🌈', '💎',
] as const;

/** Fewer options surfaced during onboarding to reduce decision fatigue. */
export const ONBOARDING_AVATARS = PROFILE_AVATARS.slice(0, 10);

export const DEFAULT_AVATAR: string = PROFILE_AVATARS[0];

export interface UserModeOption {
  key: UserMode;
  emoji: string;
  /** Used by Edit Profile (e.g. "Adult"). */
  label: string;
  /** Used by Onboarding hero card (e.g. "Adult Mode"). */
  title: string;
  /** Compact one-liner for Edit Profile. */
  shortDescription: string;
  /** Longer pitch for Onboarding. */
  description: string;
}

export const USER_MODE_OPTIONS: readonly UserModeOption[] = [
  {
    key: 'adult',
    emoji: '💼',
    label: 'Adult',
    title: 'Adult Mode',
    shortDescription: 'Professional & focused',
    description: 'Professional productivity, complex task management, deep work sessions',
  },
  {
    key: 'child',
    emoji: '🌈',
    label: 'Child',
    title: 'Child Mode',
    shortDescription: 'Fun & encouraging',
    description: 'Visual schedules, fun rewards, simple habit tracking for ages 6–17',
  },
] as const;
