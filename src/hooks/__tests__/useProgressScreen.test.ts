import { renderHook } from '@testing-library/react-native';
import { useProgressScreen } from '../useProgressScreen';
import { ACHIEVEMENTS } from '../../constants/achievements';

const mockState: any = {
  profile: { name: 'Tester', avatar: '🧠' },
  stats: {
    totalXP: 1500,
    level: 4,
    xpToNextLevel: 100,
    tasksCompleted: 12,
    habitsCompleted: 9,
    focusMinutes: 240,
    currentStreak: 6,
    longestStreak: 10,
    unlockedAchievements: ['first_task', 'first_focus'],
    weeklyXP: [10, 20, 30, 40, 50, 60, 70],
    weeklyTasks: [1, 2, 3, 0, 4, 1, 2],
  },
};

jest.mock('../../store', () => ({
  useAppStore: (selector: any) => (selector ? selector(mockState) : mockState),
  selectStats: (s: any) => s.stats,
}));

describe('useProgressScreen', () => {
  it('returns profile and stats untouched', () => {
    const { result } = renderHook(() => useProgressScreen());
    expect(result.current.profile?.name).toBe('Tester');
    expect(result.current.stats.totalXP).toBe(1500);
  });

  it('partitions achievements into unlocked and (visible) locked', () => {
    const { result } = renderHook(() => useProgressScreen());
    const visibleTotal = ACHIEVEMENTS.filter((a) => !a.secret).length;

    expect(result.current.unlockedAchievements.map((a) => a.id)).toEqual(
      expect.arrayContaining(['first_task', 'first_focus'])
    );
    expect(
      result.current.lockedAchievements.every(
        (a) => !a.secret && !['first_task', 'first_focus'].includes(a.id)
      )
    ).toBe(true);
    expect(result.current.achievementsUnlockedCount).toBe(2);
    expect(result.current.achievementsTotal).toBe(visibleTotal);
  });

  it('rolls up the weekly totals from the data slice', () => {
    const { result } = renderHook(() => useProgressScreen());
    expect(result.current.weeklyXPTotal).toBe(10 + 20 + 30 + 40 + 50 + 60 + 70);
    expect(result.current.weeklyTasksTotal).toBe(1 + 2 + 3 + 0 + 4 + 1 + 2);
  });

  it('exposes today index in the 0-6 weekly array', () => {
    const { result } = renderHook(() => useProgressScreen());
    expect(result.current.todayWeekIndex).toBeGreaterThanOrEqual(0);
    expect(result.current.todayWeekIndex).toBeLessThanOrEqual(6);
    expect(result.current.todayWeekIndex).toBe(new Date().getDay());
  });

  it('computes XP-in-level derivations', () => {
    const { result } = renderHook(() => useProgressScreen());
    expect(result.current.xpProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.xpProgress).toBeLessThanOrEqual(1);
    expect(result.current.xpInLevel).toBeGreaterThanOrEqual(0);
    expect(result.current.xpForLevel).toBeGreaterThan(0);
  });

  it('exposes display-ready headline stat strings (formatting in the VM, not the view)', () => {
    const { result } = renderHook(() => useProgressScreen());
    // 12 tasks, 9 habits, 240 minutes → "4h" via formatFocusTime.
    expect(result.current.headlineStats).toEqual({
      tasks: '12',
      habits: '9',
      focus: '4h',
    });
  });
});
