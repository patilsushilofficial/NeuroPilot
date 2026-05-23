import { renderHook, act } from '@testing-library/react-native';
import { useSettings } from '../useSettings';
import { useAppStore } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn().mockReturnValue({ navigate: jest.fn() }),
}));

jest.mock('../useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({ light: jest.fn(), warning: jest.fn() }),
}));

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return settings and profile', () => {
    const mockSettings = { theme: 'dark' };
    const mockProfile = { name: 'Test' };
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      profile: mockProfile,
      updateSettings: jest.fn(),
      toggleHaptics: jest.fn(),
    });

    const { result } = renderHook(() => useSettings());

    expect(result.current.settings).toBe(mockSettings);
    expect(result.current.profile).toBe(mockProfile);
    expect(result.current.themeLabel).toBe('Dark (Recommended)');
  });

  it('should show alert on theme change and handle selection', () => {
    const spy = jest.spyOn(Alert, 'alert');
    const updateSettings = jest.fn();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { theme: 'dark' },
      updateSettings,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleThemeChange();
    });

    expect(spy).toHaveBeenCalled();

    // Simulate pressing the second option (Light)
    const buttons = spy.mock.calls[0][2];
    if (buttons) {
      buttons[1].onPress();
      expect(updateSettings).toHaveBeenCalledWith({ theme: 'light' });
    }
  });

  it('should show alert on reset data and call store reset on confirm', async () => {
    const spy = jest.spyOn(Alert, 'alert');
    const resetAllData = jest.fn().mockResolvedValue(undefined);
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { theme: 'dark' },
      resetAllData,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleResetData();
    });

    expect(spy).toHaveBeenCalledWith('⚠️ Reset All Data', expect.any(String), expect.any(Array));

    const buttons = spy.mock.calls[0][2];
    expect(buttons).toBeDefined();
    await act(async () => {
      await buttons![1].onPress!();
    });

    expect(resetAllData).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('Data Reset', 'All your data has been cleared.');
  });

  it('should surface a failure alert when reset throws', async () => {
    const spy = jest.spyOn(Alert, 'alert');
    const resetAllData = jest.fn().mockRejectedValue(new Error('boom'));
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: { theme: 'dark' },
      resetAllData,
    });

    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.handleResetData();
    });

    const buttons = spy.mock.calls[0][2];
    await act(async () => {
      await buttons![1].onPress!();
    });

    expect(resetAllData).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(
      'Reset Failed',
      'Something went wrong while resetting. Please try again.'
    );
  });
});
