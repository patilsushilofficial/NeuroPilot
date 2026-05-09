import { renderHook, act } from '@testing-library/react-native';
import { useHome } from '../useHome';
import { useAppStore } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { useQuickCapture } from '../useQuickCapture';
import { useHaptics } from '../useHaptics';
import { MOTIVATIONAL_QUOTES } from '../../constants/focusPresets';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
  selectStats: jest.fn().mockReturnValue({ totalXP: 100 }),
  selectTodaysTasks: jest.fn().mockReturnValue([]),
  selectTodaysHabits: jest.fn().mockReturnValue([]),
  selectActiveFocus: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn().mockReturnValue({ navigate: jest.fn() }),
}));

jest.mock('../useQuickCapture', () => ({
  useQuickCapture: jest.fn().mockReturnValue({ handleQuickCapture: jest.fn() }),
}));

const mockHaptics = {
  light: jest.fn(),
  medium: jest.fn(),
  heavy: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  achievement: jest.fn(),
  focusComplete: jest.fn(),
};

jest.mock('../useHaptics', () => ({
  useHaptics: jest.fn(() => mockHaptics),
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
  useAnimatedStyle: jest.fn().mockReturnValue({}),
  withSpring: jest.fn().mockImplementation((val, _config, cb) => {
    if (cb) cb(true);
    return val;
  }),
}));

interface SetupOpts {
  todaysTasks?: any[];
  todaysHabits?: any[];
  isHabitCompletedToday?: jest.Mock;
  completeTask?: jest.Mock;
  completeHabit?: jest.Mock;
  uncompleteHabit?: jest.Mock;
  addXP?: jest.Mock;
  recordTaskComplete?: jest.Mock;
  recordHabitComplete?: jest.Mock;
}

const setupStore = (opts: SetupOpts = {}) => {
  const store = {
    profile: { name: 'Test', avatar: '🧠' },
    settings: { theme: 'dark' },
    isHabitCompletedToday: opts.isHabitCompletedToday ?? jest.fn().mockReturnValue(false),
    completeTask: opts.completeTask ?? jest.fn().mockReturnValue(0),
    completeHabit: opts.completeHabit ?? jest.fn().mockReturnValue(0),
    uncompleteHabit: opts.uncompleteHabit ?? jest.fn(),
    recordTaskComplete: opts.recordTaskComplete ?? jest.fn(),
    recordHabitComplete: opts.recordHabitComplete ?? jest.fn(),
    addXP: opts.addXP ?? jest.fn(),
  };
  const storeModule = jest.requireMock('../../store');
  storeModule.selectTodaysTasks.mockReturnValue(opts.todaysTasks ?? []);
  storeModule.selectTodaysHabits.mockReturnValue(opts.todaysHabits ?? []);

  (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
    if (typeof selector === 'function') return selector(store);
    return store;
  });
  return store;
};

describe('useHome', () => {
  let navigate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate });
  });

  it('returns profile, stats, and derived counters', () => {
    setupStore();
    const { result } = renderHook(() => useHome());
    expect(result.current.profile?.name).toBe('Test');
    expect(result.current.completedTodayTasks).toBe(0);
    expect(result.current.completedHabits).toBe(0);
    expect(result.current.todayTotalCount).toBe(0);
    expect(result.current.topTodayItems).toEqual([]);
  });

  it('builds today items in priority order, then incomplete habits, then completed', () => {
    const isHabitCompletedToday = jest.fn().mockImplementation((id) => id === 'h-done');
    setupStore({
      todaysTasks: [
        { id: 't-low', title: 'Low', priority: 'low', status: 'pending' },
        { id: 't-high', title: 'High', priority: 'high', status: 'pending' },
        { id: 't-med', title: 'Med', priority: 'medium', status: 'pending' },
      ],
      todaysHabits: [
        { id: 'h-done', title: 'Done habit', emoji: '✅' },
        { id: 'h-todo', title: 'Todo habit', emoji: '🧘' },
      ],
      isHabitCompletedToday,
    });

    const { result } = renderHook(() => useHome());
    const items = result.current.topTodayItems;
    // Top 3 = high task, medium task, low task (ordered by priority).
    expect(items.map((i) => i.id)).toEqual(['t-high', 't-med', 't-low']);
    expect(result.current.todayTotalCount).toBe(5);
  });

  it('handleAvatarPress navigates to EditProfile', () => {
    setupStore();
    const { result } = renderHook(() => useHome());
    act(() => result.current.handleAvatarPress());
    expect(navigate).toHaveBeenCalledWith('Settings', { screen: 'EditProfile' });
  });

  it('handleSettingsPress targets SettingsMain explicitly', () => {
    // Regression: navigate('Settings') alone leaves the inner stack on
    // whatever screen was last visited (e.g. EditProfile from the avatar
    // tap), so we must spell out the target screen.
    setupStore();
    const { result } = renderHook(() => useHome());
    act(() => result.current.handleSettingsPress());
    expect(navigate).toHaveBeenCalledWith('Settings', { screen: 'SettingsMain' });
  });

  it('handleSettingsPress and handleAvatarPress route to different screens', () => {
    // The settings cog and the avatar share the same tab but must always
    // land on different screens — guard against either handler regressing
    // to the wrong target.
    setupStore();
    const { result } = renderHook(() => useHome());
    act(() => result.current.handleSettingsPress());
    act(() => result.current.handleAvatarPress());

    expect(navigate).toHaveBeenNthCalledWith(1, 'Settings', { screen: 'SettingsMain' });
    expect(navigate).toHaveBeenNthCalledWith(2, 'Settings', { screen: 'EditProfile' });
  });

  it('handleToggleTaskFromHome awards XP and records completion', () => {
    const completeTask = jest.fn().mockReturnValue(50);
    const addXP = jest.fn();
    const recordTaskComplete = jest.fn();
    setupStore({ completeTask, addXP, recordTaskComplete });

    const { result } = renderHook(() => useHome());
    act(() => result.current.handleToggleTaskFromHome('task-1'));

    expect(completeTask).toHaveBeenCalledWith('task-1');
    expect(addXP).toHaveBeenCalledWith(50);
    expect(recordTaskComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
  });

  it('handleToggleTaskFromHome no-ops when XP is 0 (already complete)', () => {
    const completeTask = jest.fn().mockReturnValue(0);
    const addXP = jest.fn();
    const recordTaskComplete = jest.fn();
    setupStore({ completeTask, addXP, recordTaskComplete });

    const { result } = renderHook(() => useHome());
    act(() => result.current.handleToggleTaskFromHome('task-1'));

    expect(addXP).not.toHaveBeenCalled();
    expect(recordTaskComplete).not.toHaveBeenCalled();
  });

  it('handleToggleHabitFromHome completes habit and awards XP when not done', () => {
    const completeHabit = jest.fn().mockReturnValue(20);
    const addXP = jest.fn();
    const recordHabitComplete = jest.fn();
    const isHabitCompletedToday = jest.fn().mockReturnValue(false);
    setupStore({ completeHabit, addXP, recordHabitComplete, isHabitCompletedToday });

    const { result } = renderHook(() => useHome());
    act(() => result.current.handleToggleHabitFromHome('habit-1'));

    expect(completeHabit).toHaveBeenCalledWith('habit-1');
    expect(addXP).toHaveBeenCalledWith(20);
    expect(recordHabitComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
  });

  it('handleToggleHabitFromHome uncompletes when already done', () => {
    const uncompleteHabit = jest.fn();
    const completeHabit = jest.fn();
    const isHabitCompletedToday = jest.fn().mockReturnValue(true);
    setupStore({ uncompleteHabit, completeHabit, isHabitCompletedToday });

    const { result } = renderHook(() => useHome());
    act(() => result.current.handleToggleHabitFromHome('habit-1'));

    expect(uncompleteHabit).toHaveBeenCalledWith('habit-1');
    expect(completeHabit).not.toHaveBeenCalled();
    expect(mockHaptics.light).toHaveBeenCalled();
  });

  it('handleToggleHabitFromHome skips XP path when complete returns 0', () => {
    const completeHabit = jest.fn().mockReturnValue(0);
    const addXP = jest.fn();
    const isHabitCompletedToday = jest.fn().mockReturnValue(false);
    setupStore({ completeHabit, addXP, isHabitCompletedToday });

    const { result } = renderHook(() => useHome());
    act(() => result.current.handleToggleHabitFromHome('habit-1'));

    expect(addXP).not.toHaveBeenCalled();
  });

  it('quick action handlers navigate to the right destinations', () => {
    setupStore();
    const { result } = renderHook(() => useHome());

    act(() => result.current.handleStartFocus());
    expect(navigate).toHaveBeenCalledWith('Focus');

    act(() => result.current.handleAddTask());
    expect(navigate).toHaveBeenCalledWith('TasksTab', { screen: 'AddTask' });

    act(() => result.current.handleViewHabits());
    expect(navigate).toHaveBeenCalledWith('HabitsTab');

    act(() => result.current.handleViewProgress());
    expect(navigate).toHaveBeenCalledWith('Progress');

    act(() => result.current.handleViewAllTasks());
    expect(navigate).toHaveBeenCalledWith('TasksTab', { screen: 'TasksList' });
  });

  it('refreshQuote rolls a different quote each call', () => {
    setupStore();
    const { result } = renderHook(() => useHome());

    const initial = result.current.todayQuote;
    act(() => result.current.refreshQuote());
    expect(result.current.todayQuote).not.toBe(initial);
    expect(mockHaptics.light).toHaveBeenCalled();
  });

  it('refreshQuote stays stable when only one quote exists', () => {
    const original = MOTIVATIONAL_QUOTES.length;
    // Trim the quote pool down to 1 entry so the loop has nowhere to roll to.
    (MOTIVATIONAL_QUOTES as any).splice(1, original - 1);
    setupStore();
    const { result } = renderHook(() => useHome());
    const initial = result.current.todayQuote;
    act(() => result.current.refreshQuote());
    expect(result.current.todayQuote).toBe(initial);

    // Restore so other tests continue to see the full pool.
    (MOTIVATIONAL_QUOTES as any).push(
      ...Array.from({ length: original - 1 }, (_, i) => ({
        text: `placeholder ${i}`,
        author: 'test',
      }))
    );
  });

  it('legacy quickActions[] still navigates correctly (back-compat)', () => {
    setupStore();
    const { result } = renderHook(() => useHome());
    result.current.quickActions[0].onPress();
    expect(navigate).toHaveBeenCalledWith('TasksTab', { screen: 'AddTask' });
    result.current.quickActions[1].onPress();
    expect(navigate).toHaveBeenCalledWith('Focus');
    result.current.quickActions[2].onPress();
    expect(navigate).toHaveBeenCalledWith('HabitsTab');
    result.current.quickActions[3].onPress();
    expect(navigate).toHaveBeenCalledWith('Progress');
  });
});
