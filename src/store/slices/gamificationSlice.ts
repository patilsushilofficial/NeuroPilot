import { StateCreator } from 'zustand';
import { UserStats } from '../../types';
import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from '../../constants/achievements';
import { getLevelFromXP, getXPToNextLevel } from '../../constants/focusPresets';

export interface GamificationSlice {
  stats: UserStats;
  pendingAchievements: string[]; // IDs of newly unlocked achievements to show

  addXP: (amount: number) => void;
  recordTaskComplete: () => void;
  recordHabitComplete: () => void;
  recordFocusMinutes: (minutes: number) => void;
  checkAndUnlockAchievements: () => string[]; // returns newly unlocked IDs
  clearPendingAchievements: () => void;
  updateDailyStreak: () => void;
}

export const initialStats: UserStats = {
  totalXP: 0,
  level: 1,
  xpToNextLevel: 100,
  tasksCompleted: 0,
  habitsCompleted: 0,
  focusMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  unlockedAchievements: [],
  weeklyXP: [0, 0, 0, 0, 0, 0, 0],
  weeklyTasks: [0, 0, 0, 0, 0, 0, 0],
};

export const initialGamificationState: Pick<GamificationSlice, 'stats' | 'pendingAchievements'> = {
  stats: initialStats,
  pendingAchievements: [],
};

export const createGamificationSlice: StateCreator<GamificationSlice, [], [], GamificationSlice> = (
  set,
  get
) => ({
  ...initialGamificationState,

  addXP: (amount) => {
    set((s) => {
      const newXP = s.stats.totalXP + amount;
      const dayIdx = new Date().getDay();
      const weeklyXP = [...s.stats.weeklyXP];
      weeklyXP[dayIdx] = (weeklyXP[dayIdx] ?? 0) + amount;

      return {
        stats: {
          ...s.stats,
          totalXP: newXP,
          level: getLevelFromXP(newXP),
          xpToNextLevel: getXPToNextLevel(newXP),
          weeklyXP,
        },
      };
    });
    get().checkAndUnlockAchievements();
  },

  recordTaskComplete: () => {
    const dayIdx = new Date().getDay();
    set((s) => {
      const weeklyTasks = [...s.stats.weeklyTasks];
      weeklyTasks[dayIdx] = (weeklyTasks[dayIdx] ?? 0) + 1;
      return {
        stats: {
          ...s.stats,
          tasksCompleted: s.stats.tasksCompleted + 1,
          weeklyTasks,
        },
      };
    });
    get().checkAndUnlockAchievements();
  },

  recordHabitComplete: () => {
    set((s) => ({
      stats: { ...s.stats, habitsCompleted: s.stats.habitsCompleted + 1 },
    }));
  },

  recordFocusMinutes: (minutes) => {
    set((s) => ({
      stats: { ...s.stats, focusMinutes: s.stats.focusMinutes + minutes },
    }));
    get().checkAndUnlockAchievements();
  },

  checkAndUnlockAchievements: () => {
    const { stats } = get();
    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (stats.unlockedAchievements.includes(achievement.id)) continue;

      let shouldUnlock = false;
      const { type, value } = achievement.requirement;

      switch (type) {
        case 'task_count':
          shouldUnlock = stats.tasksCompleted >= value;
          break;
        case 'focus_minutes':
          shouldUnlock = stats.focusMinutes >= value;
          break;
        case 'xp_total':
          shouldUnlock = stats.totalXP >= value;
          break;
        case 'level':
          shouldUnlock = stats.level >= value;
          break;
        case 'habit_streak':
          shouldUnlock = stats.currentStreak >= value || stats.longestStreak >= value;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        newlyUnlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      const totalBonusXP = newlyUnlocked.reduce(
        (acc, id) => acc + (ACHIEVEMENT_MAP[id]?.xpReward ?? 0),
        0
      );
      const newXP = stats.totalXP + totalBonusXP;

      set((s) => ({
        stats: {
          ...s.stats,
          totalXP: newXP,
          level: getLevelFromXP(newXP),
          xpToNextLevel: getXPToNextLevel(newXP),
          unlockedAchievements: [...s.stats.unlockedAchievements, ...newlyUnlocked],
        },
        pendingAchievements: [...s.pendingAchievements, ...newlyUnlocked],
      }));
    }

    return newlyUnlocked;
  },

  clearPendingAchievements: () => {
    set({ pendingAchievements: [] });
  },

  updateDailyStreak: () => {
    set((s) => {
      const newStreak = s.stats.currentStreak + 1;
      return {
        stats: {
          ...s.stats,
          currentStreak: newStreak,
          longestStreak: Math.max(s.stats.longestStreak, newStreak),
        },
      };
    });
    get().checkAndUnlockAchievements();
  },
});
