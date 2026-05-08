import { renderHook, act } from '@testing-library/react-native';
import { useAppInitialization } from '../useAppInitialization';
import { useAppStore } from '../../store';
import * as SplashScreen from 'expo-splash-screen';
import { setupNotificationChannels, requestNotificationPermissions } from '../../utils/notifications';
import { getTodayStr } from '../../utils/dateUtils';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../utils/notifications', () => ({
  setupNotificationChannels: jest.fn().mockResolvedValue(true),
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../utils/dateUtils', () => ({
  getTodayStr: jest.fn().mockReturnValue('2026-05-08'),
}));

describe('useAppInitialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize app and hide splash screen', async () => {
    const setLastActiveDate = jest.fn();
    const updateDailyStreak = jest.fn();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { notificationsEnabled: true },
      lastActiveDate: '2026-05-07',
      setLastActiveDate,
      updateDailyStreak,
    });
    
    renderHook(() => useAppInitialization());
    
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(setupNotificationChannels).toHaveBeenCalled();
    expect(requestNotificationPermissions).toHaveBeenCalled();
    expect(updateDailyStreak).toHaveBeenCalled();
    expect(setLastActiveDate).toHaveBeenCalledWith('2026-05-08');
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('should NOT update streak if already active today', async () => {
    const setLastActiveDate = jest.fn();
    const updateDailyStreak = jest.fn();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { notificationsEnabled: false },
      lastActiveDate: '2026-05-08',
      setLastActiveDate,
      updateDailyStreak,
    });
    
    renderHook(() => useAppInitialization());
    
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(setupNotificationChannels).toHaveBeenCalled();
    expect(requestNotificationPermissions).not.toHaveBeenCalled();
    expect(updateDailyStreak).not.toHaveBeenCalled();
    expect(setLastActiveDate).not.toHaveBeenCalled();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('should handle initialization errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (setupNotificationChannels as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { notificationsEnabled: true },
      lastActiveDate: '2026-05-07',
      setLastActiveDate: jest.fn(),
      updateDailyStreak: jest.fn(),
    });
    
    renderHook(() => useAppInitialization());
    
    await act(async () => {
      await Promise.resolve();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
