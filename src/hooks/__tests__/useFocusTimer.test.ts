import { renderHook, act } from '@testing-library/react-native';
import { useFocusTimer } from '../useFocusTimer';
import { useAppStore } from '../../store';
import { Alert } from 'react-native';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
  selectActiveFocus: jest.fn().mockReturnValue({ status: 'idle', presetId: 'pomodoro' }),
  selectStats: jest.fn().mockReturnValue({ totalXP: 100 }),
}));

jest.mock('../useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    light: jest.fn(),
    medium: jest.fn(),
    heavy: jest.fn(),
    warning: jest.fn(),
    focusComplete: jest.fn(),
  }),
}));

describe('useFocusTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return focus data', () => {
    const mockStore = {
      shieldActive: false,
      startFocus: jest.fn(),
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    const { result } = renderHook(() => useFocusTimer());

    expect(result.current.isIdle).toBe(true);
    expect(result.current.todayFocusMinutes).toBe(0);
  });

  it('should handle start', () => {
    const startFocus = jest.fn();
    const mockStore = {
      shieldActive: false,
      startFocus,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.handleStart();
    });

    expect(startFocus).toHaveBeenCalled();
  });

  it('should show alert on abandon and handle abandon', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const abandonFocus = jest.fn();
    const mockStore = {
      shieldActive: false,
      abandonFocus,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.handleAbandon();
    });

    expect(spy).toHaveBeenCalled();

    // Simulate pressing 'End Session'
    const buttons = spy.mock.calls[0][2];
    if (buttons) {
      buttons[1].onPress();
      expect(abandonFocus).toHaveBeenCalled();
    }
  });

  it('should handle pause and resume', () => {
    const pauseFocus = jest.fn();
    const resumeFocus = jest.fn();
    const mockStore = {
      shieldActive: false,
      pauseFocus,
      resumeFocus,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    // Mock active focus as running
    (useAppStore as unknown as jest.Mock).mockReturnValueOnce({
      status: 'running',
      presetId: 'pomodoro',
    });

    const { result, rerender } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.handlePauseResume();
    });
    expect(pauseFocus).toHaveBeenCalled();

    // Mock active focus as paused
    (useAppStore as unknown as jest.Mock).mockReturnValueOnce({
      status: 'paused',
      presetId: 'pomodoro',
    });
    rerender();

    act(() => {
      result.current.handlePauseResume();
    });
    expect(resumeFocus).toHaveBeenCalled();
  });

  it('should handle select preset', () => {
    const mockStore = {
      shieldActive: false,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.handleSelectPreset('short_break');
    });

    expect(result.current.selectedPreset).toBe('short_break');
  });

  it('reflects the selected preset in the displayed timer while idle', () => {
    const mockStore = {
      shieldActive: false,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });

    const { result } = renderHook(() => useFocusTimer());

    // Default preset is "classic" → 25 minutes.
    expect(result.current.preset.id).toBe('classic');
    expect(result.current.active.totalSeconds).toBe(25 * 60);
    expect(result.current.active.secondsRemaining).toBe(25 * 60);

    // Switching to deep_work should immediately update the previewed timer
    // to 50 minutes (the regression we're guarding against).
    act(() => {
      result.current.handleSelectPreset('deep_work');
    });

    expect(result.current.preset.id).toBe('deep_work');
    expect(result.current.active.totalSeconds).toBe(50 * 60);
    expect(result.current.active.secondsRemaining).toBe(50 * 60);
  });

  it('ignores preset changes when a session is active', () => {
    const mockStore = {
      shieldActive: false,
      getSessionsToday: jest.fn().mockReturnValue([]),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') return selector(mockStore);
      return mockStore;
    });
    // Force the active session into the running state.
    (useAppStore as unknown as jest.Mock).mockReturnValueOnce({
      status: 'running',
      presetId: 'classic',
      secondsRemaining: 1234,
      totalSeconds: 1500,
    });

    const { result } = renderHook(() => useFocusTimer());

    act(() => {
      result.current.handleSelectPreset('deep_work');
    });

    // While running we don't allow the picker to mutate selection (UI hides
    // it anyway), and the displayed timer reflects the active session, not
    // the picker.
    expect(result.current.selectedPreset).toBe('classic');
    expect(result.current.active.secondsRemaining).toBe(1234);
    expect(result.current.active.totalSeconds).toBe(1500);
  });

  // Note: the per-second tick that used to live here was moved to
  // `useGlobalFocusTicker` (mounted at App root), so the timer keeps
  // counting down when the user is on a screen other than Focus.
  // Tick coverage now lives in `useGlobalFocusTicker.test.ts`.
});
