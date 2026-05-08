import { useMemo } from 'react';

import { useAppStore, selectStats } from '../store';
import { ACHIEVEMENTS } from '../constants/achievements';
import {
  getXPProgressInLevel,
  getLevelThreshold,
} from '../constants/focusPresets';
import { Achievement } from '../types';

interface ProgressViewModel {
  profile: ReturnType<typeof useAppStore.getState>['profile'];
  stats: ReturnType<typeof selectStats>;
  /** Fraction of the way through the current level (0–1). */
  xpProgress: number;
  /** XP earned within the current level (e.g. "230 / 500"). */
  xpInLevel: number;
  /** XP required to advance from the current level to the next. */
  xpForLevel: number;
  unlockedAchievements: Achievement[];
  /** Locked, non-secret achievements the user is working toward. */
  lockedAchievements: Achievement[];
}

/**
 * View-model for the Progress screen. Computes XP-window math, partitions
 * the achievement set, and surfaces the profile/stats slice the screen
 * needs. Pure derivations only — no side effects.
 */
export const useProgressScreen = (): ProgressViewModel => {
  const stats = useAppStore(selectStats);
  const profile = useAppStore((s) => s.profile);

  const xpProgress = getXPProgressInLevel(stats.totalXP);
  const xpInLevel = stats.totalXP - getLevelThreshold(stats.level);
  const xpForLevel =
    getLevelThreshold(stats.level + 1) - getLevelThreshold(stats.level);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => stats.unlockedAchievements.includes(a.id)),
    [stats.unlockedAchievements]
  );

  const lockedAchievements = useMemo(
    () =>
      ACHIEVEMENTS.filter(
        (a) => !stats.unlockedAchievements.includes(a.id) && !a.secret
      ),
    [stats.unlockedAchievements]
  );

  return {
    profile,
    stats,
    xpProgress,
    xpInLevel,
    xpForLevel,
    unlockedAchievements,
    lockedAchievements,
  };
};
