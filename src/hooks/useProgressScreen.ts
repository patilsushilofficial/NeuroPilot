import { useMemo } from 'react';

import { useAppStore, selectStats } from '../store';
import { ACHIEVEMENTS } from '../constants/achievements';
import { getXPProgressInLevel, getLevelThreshold } from '../constants/focusPresets';
import { Achievement } from '../types';
import { formatFocusTime } from '../utils/dateUtils';

/**
 * Display-ready strings for the three "headline" stat tiles. Computed in
 * the view-model (rather than in the tile component) so the component
 * stays purely presentational and the formatting choice — e.g. "4h 30m"
 * vs. "270 minutes" — lives next to the rest of the domain logic.
 */
export interface HeadlineStats {
  tasks: string;
  habits: string;
  focus: string;
}

interface ProgressViewModel {
  profile: ReturnType<typeof useAppStore.getState>['profile'];
  stats: ReturnType<typeof selectStats>;
  /** Fraction of the way through the current level (0–1). */
  xpProgress: number;
  /** XP earned within the current level (e.g. "230 / 500"). */
  xpInLevel: number;
  /** XP required to advance from the current level to the next. */
  xpForLevel: number;
  /** Pre-formatted strings for the marquee tile row. */
  headlineStats: HeadlineStats;
  unlockedAchievements: Achievement[];
  /** Locked, non-secret achievements the user is working toward. */
  lockedAchievements: Achievement[];
  /** Total visible (non-secret) achievements + how many are unlocked. */
  achievementsUnlockedCount: number;
  achievementsTotal: number;
  /** Sum of `weeklyXP` and `weeklyTasks` for the rolling 7-day window. */
  weeklyXPTotal: number;
  weeklyTasksTotal: number;
  /** Index (Sun=0..Sat=6) of "today" inside the weekly arrays. */
  todayWeekIndex: number;
}

/**
 * View-model for the Progress screen. Computes XP-window math, partitions
 * the achievement set, rolls up the weekly totals, and surfaces the
 * profile/stats slice the screen needs. Pure derivations only — no side
 * effects, no haptics, no navigation.
 */
export const useProgressScreen = (): ProgressViewModel => {
  const stats = useAppStore(selectStats);
  const profile = useAppStore((s) => s.profile);

  const xpProgress = getXPProgressInLevel(stats.totalXP);
  const xpInLevel = stats.totalXP - getLevelThreshold(stats.level);
  const xpForLevel = getLevelThreshold(stats.level + 1) - getLevelThreshold(stats.level);

  const unlockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => stats.unlockedAchievements.includes(a.id)),
    [stats.unlockedAchievements]
  );

  const lockedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((a) => !stats.unlockedAchievements.includes(a.id) && !a.secret),
    [stats.unlockedAchievements]
  );

  // Visible total excludes `secret` achievements so the count the user
  // sees ("3 / 17") matches the cards we actually render. Including
  // secrets would make the denominator drift mysteriously.
  const achievementsTotal = useMemo(() => ACHIEVEMENTS.filter((a) => !a.secret).length, []);

  const weeklyXPTotal = useMemo(
    () => stats.weeklyXP.reduce((sum, v) => sum + v, 0),
    [stats.weeklyXP]
  );
  const weeklyTasksTotal = useMemo(
    () => stats.weeklyTasks.reduce((sum, v) => sum + v, 0),
    [stats.weeklyTasks]
  );

  const todayWeekIndex = new Date().getDay();

  const headlineStats = useMemo<HeadlineStats>(
    () => ({
      tasks: stats.tasksCompleted.toLocaleString(),
      habits: stats.habitsCompleted.toLocaleString(),
      focus: formatFocusTime(stats.focusMinutes),
    }),
    [stats.tasksCompleted, stats.habitsCompleted, stats.focusMinutes]
  );

  return {
    profile,
    stats,
    xpProgress,
    xpInLevel,
    xpForLevel,
    headlineStats,
    unlockedAchievements,
    lockedAchievements,
    achievementsUnlockedCount: unlockedAchievements.length,
    achievementsTotal,
    weeklyXPTotal,
    weeklyTasksTotal,
    todayWeekIndex,
  };
};
