import { renderHook, act } from '@testing-library/react-native';
import { useQuickCapture } from '../useQuickCapture';
import { useAppStore } from '../../store';
import { useHaptics } from '../useHaptics';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('../useHaptics', () => ({
  useHaptics: jest.fn(),
}));

describe('useQuickCapture', () => {
  it('should call addTask and haptics', () => {
    const addTask = jest.fn();
    const light = jest.fn();

    (useAppStore as unknown as jest.Mock).mockReturnValue({ addTask });
    (useHaptics as unknown as jest.Mock).mockReturnValue({ light });

    const { result } = renderHook(() => useQuickCapture());

    act(() => {
      result.current.handleQuickCapture('Test Task');
    });

    expect(addTask).toHaveBeenCalledWith({ title: 'Test Task', priority: 'medium', tags: [] });
    expect(light).toHaveBeenCalled();
  });
});
