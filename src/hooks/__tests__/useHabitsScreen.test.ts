import { act, renderHook } from '@testing-library/react-native';

const mockHaptics = {
  light: jest.fn(),
  success: jest.fn(),
};
jest.mock('../useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const buildHabit = (overrides: Partial<any>) => ({
  id: 'h',
  title: 'habit',
  emoji: '🌱',
  color: '#7B6CF6',
  streak: 0,
  xpPerCompletion: 10,
  completions: [],
  frequency: 'daily',
  ...overrides,
});

let mockHabits: any[] = [];
let mockCompletedIds = new Set<string>();
let mockCompleteReturn = 0;

const mockStore = {
  getTodaysHabits: jest.fn(() => mockHabits),
  completeHabit: jest.fn(() => mockCompleteReturn),
  uncompleteHabit: jest.fn(),
  isHabitCompletedToday: jest.fn((id: string) => mockCompletedIds.has(id)),
  addXP: jest.fn(),
  recordHabitComplete: jest.fn(),
};

jest.mock('../../store', () => ({
  useAppStore: () => mockStore,
}));

import { useHabitsScreen } from '../useHabitsScreen';

describe('useHabitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHabits = [];
    mockCompletedIds = new Set<string>();
    mockCompleteReturn = 0;
  });

  describe('counts and progress', () => {
    it('reports completion counts split by completed/pending', () => {
      mockHabits = [buildHabit({ id: 'a' }), buildHabit({ id: 'b' }), buildHabit({ id: 'c' })];
      mockCompletedIds = new Set(['a']);
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.completedCount).toBe(1);
      expect(result.current.pendingCount).toBe(2);
      expect(result.current.totalCount).toBe(3);
    });

    it('computes completionRate and isPerfectDay correctly', () => {
      mockHabits = [buildHabit({ id: 'a' }), buildHabit({ id: 'b' })];
      mockCompletedIds = new Set(['a', 'b']);
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.completionRate).toBe(1);
      expect(result.current.isPerfectDay).toBe(true);
    });

    it('returns 0/false when there are no habits today', () => {
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.completionRate).toBe(0);
      expect(result.current.isPerfectDay).toBe(false);
    });
  });

  describe('sections', () => {
    it('splits the All filter into To do then Completed', () => {
      mockHabits = [buildHabit({ id: 'a' }), buildHabit({ id: 'b' })];
      mockCompletedIds = new Set(['b']);
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.sections.map((s) => s.id)).toEqual(['pending', 'done']);
      expect(result.current.sections[0].data.map((h) => h.id)).toEqual(['a']);
      expect(result.current.sections[1].data.map((h) => h.id)).toEqual(['b']);
    });

    it('omits empty groups when one side is missing', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      mockCompletedIds = new Set(['a']);
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.sections.map((s) => s.id)).toEqual(['done']);
    });

    it('returns a single section when filter=pending', () => {
      mockHabits = [buildHabit({ id: 'a' }), buildHabit({ id: 'b' })];
      mockCompletedIds = new Set(['a']);
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.selectFilter('pending'));
      expect(result.current.sections).toHaveLength(1);
      expect(result.current.sections[0].id).toBe('pending');
      expect(result.current.sections[0].accent).toBe('primary');
    });

    it('returns a single section when filter=done', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      mockCompletedIds = new Set(['a']);
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.selectFilter('done'));
      expect(result.current.sections).toHaveLength(1);
      expect(result.current.sections[0].id).toBe('done');
      expect(result.current.sections[0].accent).toBe('success');
    });

    it('returns no sections when the active filter has no matches', () => {
      // Empty array = "show the EmptyState" — explicit guard so a future
      // refactor can't silently emit empty section objects instead.
      mockHabits = [buildHabit({ id: 'a' })];
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.selectFilter('done'));
      expect(result.current.sections).toEqual([]);
    });
  });

  describe('handlers', () => {
    it('selectFilter triggers a haptic and updates the filter', () => {
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.selectFilter('pending'));
      expect(mockHaptics.light).toHaveBeenCalled();
      expect(result.current.filter).toBe('pending');
    });

    it('handleToggle uncompletes when the habit was already done today', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      mockCompletedIds = new Set(['a']);
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.handleToggle('a'));
      expect(mockStore.uncompleteHabit).toHaveBeenCalledWith('a');
      expect(mockStore.completeHabit).not.toHaveBeenCalled();
    });

    it('handleToggle completes and awards XP when not yet done', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      mockCompleteReturn = 20;
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.handleToggle('a'));
      expect(mockStore.completeHabit).toHaveBeenCalledWith('a');
      expect(mockStore.addXP).toHaveBeenCalledWith(20);
      expect(mockStore.recordHabitComplete).toHaveBeenCalled();
      expect(mockHaptics.success).toHaveBeenCalled();
    });

    it('handleToggle is a no-op for XP rewards that resolve to 0', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      mockCompleteReturn = 0;
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.handleToggle('a'));
      expect(mockStore.addXP).not.toHaveBeenCalled();
      expect(mockHaptics.success).not.toHaveBeenCalled();
    });

    it('openAddHabit navigates to AddHabit without params', () => {
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.openAddHabit());
      expect(mockNavigate).toHaveBeenCalledWith('AddHabit');
    });

    it('openHabitDetail navigates to AddHabit with the habit id', () => {
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.openHabitDetail('h1'));
      expect(mockNavigate).toHaveBeenCalledWith('AddHabit', { habitId: 'h1' });
    });
  });

  describe('activeFilterLabel', () => {
    // Same rationale as the Tasks hook: derivation belongs in the
    // view-model so the screen never has to `.find()` over the
    // HABIT_FILTER_TABS array to render its eyebrow.
    it('matches the All tab label by default', () => {
      const { result } = renderHook(() => useHabitsScreen());
      expect(result.current.activeFilterLabel).toBe('All');
    });

    it('updates after switching filters', () => {
      const { result } = renderHook(() => useHabitsScreen());
      act(() => result.current.selectFilter('pending'));
      expect(result.current.activeFilterLabel).toBe('To do');
      act(() => result.current.selectFilter('done'));
      expect(result.current.activeFilterLabel).toBe('Done');
    });
  });

  describe('public API surface', () => {
    // The hook used to expose `isHabitCompletedToday` and
    // `todaysHabits`, but the screen now reads completion state from
    // `section.id === 'done'` (single source of truth = the partition).
    // Guard against re-introducing those leaky fields.
    it('does not expose isHabitCompletedToday or todaysHabits', () => {
      mockHabits = [buildHabit({ id: 'a' })];
      const { result } = renderHook(() => useHabitsScreen());
      expect((result.current as any).isHabitCompletedToday).toBeUndefined();
      expect((result.current as any).todaysHabits).toBeUndefined();
    });
  });
});
