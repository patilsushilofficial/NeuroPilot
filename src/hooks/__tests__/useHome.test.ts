import { renderHook, act } from '@testing-library/react-native';
import { useHome } from '../useHome';
import { useAppStore } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { useQuickCapture } from '../useQuickCapture';

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

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
  useAnimatedStyle: jest.fn().mockReturnValue({}),
  withSpring: jest.fn().mockImplementation((val, config, cb) => {
    if (cb) cb(true);
    return val;
  }),
}));

describe('useHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return home data', () => {
    const mockStore = {
      profile: { name: 'Test' },
      settings: { theme: 'dark' },
      isHabitCompletedToday: jest.fn().mockReturnValue(false),
      recordTaskComplete: jest.fn(),
      addXP: jest.fn(),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
    
    const { result } = renderHook(() => useHome());
    
    expect(result.current.profile.name).toBe('Test');
    expect(result.current.completedTodayTasks).toBe(0);
  });

  it('should handle avatar press', () => {
    const navigate = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate });
    
    const mockStore = {
      profile: { name: 'Test' },
      settings: { theme: 'dark' },
      isHabitCompletedToday: jest.fn().mockReturnValue(false),
    };
    (useAppStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });
    
    const { result } = renderHook(() => useHome());
    
    act(() => {
      result.current.handleAvatarPress();
    });
    
    expect(navigate).toHaveBeenCalledWith('Settings', { screen: 'EditProfile' });
  });
});
