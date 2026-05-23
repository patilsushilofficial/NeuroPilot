import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primaryContainer: '#E6F0FF',
      error: '#FF0000',
    },
    text: {
      h2: {},
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      labelSmall: {},
    },
  }),
}));

const mockHaptics = {
  light: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

const mockUseSettings = {
  settings: {
    notificationsEnabled: true,
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'dark' as const,
    soundVolume: 0.8,
    screenTimeLimit: 120,
    blockedApps: [],
  },
  profile: {
    name: 'Pilot',
    avatar: '🧠',
    mode: 'adult' as const,
  },
  themeLabel: 'Dark Mode',
  handleThemeChange: jest.fn(),
  handleResetData: jest.fn(),
  handleRateApp: jest.fn(),
  toggleHaptics: jest.fn(),
  updateSettings: jest.fn(),
  navigation: mockNavigation,
};

jest.mock('../../../hooks/useSettings', () => ({
  useSettings: () => mockUseSettings,
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Pilot')).toBeTruthy();
  });

  it('navigates to EditProfile on press', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Edit Profile'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditProfile');
  });

  it('toggles notifications', () => {
    const { getByTestId } = render(<SettingsScreen />);
    const sw = getByTestId('switch-Enable Notifications');

    fireEvent(sw, 'valueChange', false);
    expect(mockUseSettings.updateSettings).toHaveBeenCalledWith({ notificationsEnabled: false });
  });

  it('toggles haptics', () => {
    const { getByTestId } = render(<SettingsScreen />);
    const sw = getByTestId('switch-Haptic Feedback');

    fireEvent(sw, 'valueChange', false);
    expect(mockUseSettings.toggleHaptics).toHaveBeenCalled();
  });

  it('toggles reduced motion', () => {
    const { getByTestId } = render(<SettingsScreen />);
    const sw = getByTestId('switch-Reduced Motion');

    fireEvent(sw, 'valueChange', true);
    expect(mockUseSettings.updateSettings).toHaveBeenCalledWith({ reducedMotion: true });
  });

  it('toggles motivational quotes', () => {
    const { getByTestId } = render(<SettingsScreen />);
    const sw = getByTestId('switch-Motivational Quotes');

    fireEvent(sw, 'valueChange', false);
    expect(mockUseSettings.updateSettings).toHaveBeenCalledWith({ showMotivationalQuotes: false });
  });

  it('invokes the rate-app handler on press', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Rate on Play Store'));
    expect(mockUseSettings.handleRateApp).toHaveBeenCalled();
  });

  it('calls handleThemeChange', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Theme'));
    expect(mockUseSettings.handleThemeChange).toHaveBeenCalled();
  });

  it('calls handleResetData', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Reset All Data'));
    expect(mockUseSettings.handleResetData).toHaveBeenCalled();
  });

  it('does not expose a Debug Menu row (Debug is opened via long-press on the screen badge)', () => {
    const { queryByText } = render(<SettingsScreen />);
    expect(queryByText('Debug Menu')).toBeNull();
  });
});
