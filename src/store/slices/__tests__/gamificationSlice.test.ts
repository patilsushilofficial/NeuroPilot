import { createGamificationSlice } from '../gamificationSlice';

describe('gamificationSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const state = {
      stats: {
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
      },
      pendingAchievements: [],
      checkAndUnlockAchievements: null as any,
    };

    set = jest.fn((fn) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, updates);
    });

    get = jest.fn(() => state);

    slice = createGamificationSlice(set, get, {} as any);
    state.checkAndUnlockAchievements = slice.checkAndUnlockAchievements;
  });

  it('should add XP', () => {
    slice.addXP(50);
    expect(set).toHaveBeenCalled();
    expect(get().stats.totalXP).toBe(50);
  });

  it('should record task complete', () => {
    slice.recordTaskComplete();
    expect(set).toHaveBeenCalled();
    expect(get().stats.tasksCompleted).toBe(1);
  });

  it('should record habit complete', () => {
    slice.recordHabitComplete();
    expect(set).toHaveBeenCalled();
    expect(get().stats.habitsCompleted).toBe(1);
  });

  it('should record focus minutes', () => {
    slice.recordFocusMinutes(30);
    expect(set).toHaveBeenCalled();
    expect(get().stats.focusMinutes).toBe(30);
  });

  it('should clear pending achievements', () => {
    get().pendingAchievements = ['ach_1'];
    slice.clearPendingAchievements();
    expect(set).toHaveBeenCalledWith({ pendingAchievements: [] });
  });

  it('should update daily streak', () => {
    slice.updateDailyStreak();
    expect(set).toHaveBeenCalled();
    expect(get().stats.currentStreak).toBe(1);
  });

  it('should unlock achievements when requirements are met', () => {
    const state = get();
    state.stats.tasksCompleted = 1; // Requirement for first_task is 1

    const newlyUnlocked = slice.checkAndUnlockAchievements();

    expect(newlyUnlocked).toContain('first_task');
    expect(set).toHaveBeenCalled();
  });

  it('does not double-unlock already-unlocked achievements', () => {
    const state = get();
    state.stats.tasksCompleted = 1;
    state.stats.unlockedAchievements = ['first_task'];
    const result = slice.checkAndUnlockAchievements();
    expect(result).not.toContain('first_task');
  });

  it('evaluates focus_minutes, xp_total, level and habit_streak requirements', () => {
    const state = get();
    state.stats.focusMinutes = 100_000;
    state.stats.totalXP = 100_000;
    state.stats.level = 100;
    state.stats.currentStreak = 1_000;
    state.stats.longestStreak = 1_000;
    state.stats.tasksCompleted = 100_000;
    const unlocked = slice.checkAndUnlockAchievements();
    expect(unlocked.length).toBeGreaterThan(1);
  });

  it('records focus minutes and triggers achievement check', () => {
    const state = get();
    state.checkAndUnlockAchievements = jest.fn().mockReturnValue([]);
    slice.recordFocusMinutes(120);
    expect(state.stats.focusMinutes).toBe(120);
  });
});
