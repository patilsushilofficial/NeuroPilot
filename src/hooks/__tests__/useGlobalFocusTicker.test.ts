import { renderHook, act } from '@testing-library/react-native';
import { useGlobalFocusTicker } from '../useGlobalFocusTicker';
import { useAppStore } from '../../store';

const mockSelectActiveFocus = jest.fn();

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
  selectActiveFocus: (...args: unknown[]) => mockSelectActiveFocus(...args),
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
  useHaptics: () => mockHaptics,
}));

interface SetupOpts {
  status?: 'idle' | 'running' | 'paused';
  presetId?: string;
  tickReturn?: number;
  tickSecond?: jest.Mock;
  addXP?: jest.Mock;
  recordFocusMinutes?: jest.Mock;
}

const setup = (opts: SetupOpts = {}) => {
  const status = opts.status ?? 'running';
  const presetId = opts.presetId ?? 'classic';
  const tickSecond = opts.tickSecond ?? jest.fn().mockReturnValue(opts.tickReturn ?? 0);
  const addXP = opts.addXP ?? jest.fn();
  const recordFocusMinutes = opts.recordFocusMinutes ?? jest.fn();

  mockSelectActiveFocus.mockReturnValue({ status, presetId });

  const store = { tickSecond, addXP, recordFocusMinutes };
  (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
    if (typeof selector === 'function') {
      return selector({
        ...store,
        // selectActiveFocus path returns whatever the mock yields above.
      });
    }
    return store;
  });

  return { tickSecond, addXP, recordFocusMinutes };
};

describe('useGlobalFocusTicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not tick when status is idle', () => {
    const { tickSecond } = setup({ status: 'idle' });
    renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(tickSecond).not.toHaveBeenCalled();
  });

  it('does not tick when status is paused', () => {
    const { tickSecond } = setup({ status: 'paused' });
    renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(tickSecond).not.toHaveBeenCalled();
  });

  it('ticks once per second while running', () => {
    const { tickSecond } = setup({ status: 'running' });
    renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(tickSecond).toHaveBeenCalledTimes(3);
  });

  it('credits XP, focus minutes, and fires haptics when a phase completes', () => {
    const { tickSecond, addXP, recordFocusMinutes } = setup({
      status: 'running',
      presetId: 'classic',
      tickReturn: 50,
    });

    renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(tickSecond).toHaveBeenCalledTimes(1);
    expect(addXP).toHaveBeenCalledWith(50);
    // Classic preset = 25 focus minutes per pomodoro.
    expect(recordFocusMinutes).toHaveBeenCalledWith(25);
    expect(mockHaptics.focusComplete).toHaveBeenCalled();
  });

  it('skips XP plumbing when tick returns 0 (mid-phase)', () => {
    const { addXP, recordFocusMinutes } = setup({
      status: 'running',
      tickReturn: 0,
    });
    renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(addXP).not.toHaveBeenCalled();
    expect(recordFocusMinutes).not.toHaveBeenCalled();
    expect(mockHaptics.focusComplete).not.toHaveBeenCalled();
  });

  it('clears the interval on unmount so no zombie ticks fire', () => {
    const { tickSecond } = setup({ status: 'running' });
    const { unmount } = renderHook(() => useGlobalFocusTicker());

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(tickSecond).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(tickSecond).toHaveBeenCalledTimes(1);
  });
});
