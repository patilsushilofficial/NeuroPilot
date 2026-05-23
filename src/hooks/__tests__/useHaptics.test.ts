import { renderHook, act } from '@testing-library/react-native';
import { useHaptics } from '../useHaptics';
import { useAppStore } from '../../store';
import * as Haptics from 'expo-haptics';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(true),
  notificationAsync: jest.fn().mockResolvedValue(true),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('useHaptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call light haptics if enabled', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.light();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('should NOT call haptics if disabled', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.light();
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('should call heavy haptics', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.heavy();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
  });

  it('should call medium haptics', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.medium();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('should call success notification', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.success();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('should call achievement pattern', async () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.achievement();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

    // Wait for timeouts
    await new Promise((r) => setTimeout(r, 500));

    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('should call warning haptics', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.warning();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('should call error haptics', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.error();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
  });

  it('should call focusComplete pattern', async () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useHaptics());

    act(() => {
      result.current.focusComplete();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');

    // Wait for timeouts
    await new Promise((r) => setTimeout(r, 700));

    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('does not fire any haptic when disabled', async () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.medium();
      result.current.heavy();
      result.current.success();
      result.current.warning();
      result.current.error();
      await result.current.achievement();
      await result.current.focusComplete();
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
