import { act, renderHook } from '@testing-library/react-native';

const mockHaptics = {
  light: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
};
jest.mock('../useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-05-09T12:00:00').getTime();

const buildTask = (overrides: Partial<any>) => ({
  id: 't',
  title: 'task',
  status: 'pending',
  priority: 'medium',
  subtasks: [],
  xpReward: 10,
  dueDate: NOW,
  ...overrides,
});

let mockTasks: any[] = [];
let mockCompleteReturn = 0;

const mockStore = {
  get tasks() {
    return mockTasks;
  },
  completeTask: jest.fn(() => mockCompleteReturn),
  deleteTask: jest.fn(),
  addXP: jest.fn(),
  recordTaskComplete: jest.fn(),
  // Mirror the real selectors closely so the hook can exercise grouping
  // logic without standing up the full Zustand store.
  getTodaysTasks: jest.fn(() =>
    mockTasks.filter(
      (t) => t.status !== 'completed' && (!t.dueDate || Math.abs(t.dueDate - NOW) <= DAY)
    )
  ),
  getOverdueTasks: jest.fn(() =>
    mockTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < NOW - DAY
    )
  ),
};

jest.mock('../../store', () => ({
  useAppStore: (selector?: any) => (selector ? selector(mockStore) : mockStore),
}));

import { useTasksScreen } from '../useTasksScreen';

describe('useTasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteReturn = 0;
    mockTasks = [];
  });

  describe('sections', () => {
    it('splits the All filter into Overdue and Pending sections', () => {
      mockTasks = [
        buildTask({ id: 'overdue', dueDate: NOW - 5 * DAY }),
        buildTask({ id: 'today', dueDate: NOW }),
      ];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.sections.map((s) => s.id)).toEqual([
        'overdue',
        'pending',
      ]);
      expect(result.current.sections[0].data.map((t) => t.id)).toContain(
        'overdue'
      );
      expect(result.current.sections[1].data.map((t) => t.id)).toContain(
        'today'
      );
    });

    it('omits the Overdue section when there are no overdue tasks', () => {
      mockTasks = [buildTask({ id: 'today', dueDate: NOW })];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.sections.map((s) => s.id)).toEqual(['pending']);
    });

    it('omits the Pending section when every task is overdue', () => {
      mockTasks = [buildTask({ id: 'overdue', dueDate: NOW - 5 * DAY })];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.sections.map((s) => s.id)).toEqual(['overdue']);
    });

    it('returns a single Today section when filter=today', () => {
      mockTasks = [buildTask({ id: 't1', dueDate: NOW })];
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.selectFilter('today'));
      expect(result.current.sections).toHaveLength(1);
      expect(result.current.sections[0].id).toBe('today');
      expect(result.current.sections[0].accent).toBe('primary');
    });

    it('returns a single Completed section when filter=completed', () => {
      mockTasks = [buildTask({ id: 'done', status: 'completed' })];
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.selectFilter('completed'));
      expect(result.current.sections).toHaveLength(1);
      expect(result.current.sections[0].id).toBe('completed');
      expect(result.current.sections[0].accent).toBe('success');
    });

    it('returns no sections when the active filter has no tasks', () => {
      // The screen relies on this empty-array signal to render the
      // EmptyState — guard it explicitly so a future change can't
      // silently start emitting empty section objects instead.
      mockTasks = [];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.sections).toEqual([]);
    });
  });

  describe('handlers', () => {
    it('selectFilter triggers a haptic and updates the filter', () => {
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.selectFilter('today'));
      expect(mockHaptics.light).toHaveBeenCalled();
      expect(result.current.filter).toBe('today');
    });

    it('handleComplete awards XP and fires success haptic when XP > 0', () => {
      mockCompleteReturn = 25;
      mockTasks = [buildTask({ id: 't1' })];
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.handleComplete('t1'));
      expect(mockStore.addXP).toHaveBeenCalledWith(25);
      expect(mockStore.recordTaskComplete).toHaveBeenCalled();
      expect(mockHaptics.success).toHaveBeenCalled();
    });

    it('handleComplete is a no-op for XP rewards that resolve to 0', () => {
      // Already-completed tasks return 0 from the store; we shouldn't
      // double-award XP or replay haptics in that case.
      mockCompleteReturn = 0;
      mockTasks = [buildTask({ id: 't1' })];
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.handleComplete('t1'));
      expect(mockStore.addXP).not.toHaveBeenCalled();
      expect(mockHaptics.success).not.toHaveBeenCalled();
    });

    it('handleDelete confirms via Alert and deletes on confirm', () => {
      const { Alert } = require('react-native');
      const spy = jest.spyOn(Alert, 'alert');
      const { result } = renderHook(() => useTasksScreen());

      act(() => result.current.handleDelete('t1'));

      expect(spy).toHaveBeenCalled();
      const buttons = spy.mock.calls[0][2];
      const confirm = buttons?.find((b: any) => b.text === 'Delete');
      confirm?.onPress?.();

      expect(mockStore.deleteTask).toHaveBeenCalledWith('t1');
      expect(mockHaptics.warning).toHaveBeenCalled();
    });

    it('openAddTask navigates to AddTask without params', () => {
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.openAddTask());
      expect(mockNavigate).toHaveBeenCalledWith('AddTask');
    });

    it('openTaskDetail navigates to AddTask with the task id', () => {
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.openTaskDetail('t1'));
      expect(mockNavigate).toHaveBeenCalledWith('AddTask', { taskId: 't1' });
    });
  });

  describe('counts', () => {
    it('exposes pendingCount excluding completed tasks', () => {
      mockTasks = [
        buildTask({ id: 't1', status: 'pending' }),
        buildTask({ id: 't2', status: 'completed' }),
      ];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.pendingCount).toBe(1);
    });

    it('exposes overdueCount derived from the store helper', () => {
      mockTasks = [
        buildTask({ id: 't1', dueDate: NOW - 5 * DAY }),
        buildTask({ id: 't2', dueDate: NOW }),
      ];
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.overdueCount).toBe(1);
    });
  });

  describe('activeFilterLabel', () => {
    // The label drives the screen's eyebrow text. Putting the
    // derivation in the hook keeps the JSX free of `.find()` / lookup
    // tables and means the screen can render `activeFilterLabel`
    // without needing to know about the TASK_FILTER_TABS array at all.
    it('matches the All tab label by default', () => {
      const { result } = renderHook(() => useTasksScreen());
      expect(result.current.activeFilterLabel).toBe('All');
    });

    it('updates after switching filters', () => {
      const { result } = renderHook(() => useTasksScreen());
      act(() => result.current.selectFilter('today'));
      expect(result.current.activeFilterLabel).toBe('Today');
      act(() => result.current.selectFilter('completed'));
      expect(result.current.activeFilterLabel).toBe('Done');
    });
  });

  describe('public API surface', () => {
    // Guard against re-introducing leaky public fields. The screen
    // never reads `sortedTasks` directly (it consumes `sections`), so
    // exposing it would invite a second source of truth for "which
    // tasks are currently visible".
    it('does not expose sortedTasks (sections is the only contract)', () => {
      const { result } = renderHook(() => useTasksScreen());
      expect((result.current as any).sortedTasks).toBeUndefined();
    });
  });
});
