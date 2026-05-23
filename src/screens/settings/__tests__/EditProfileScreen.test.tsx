import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';
import { Alert } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primaryContainer: '#E6F0FF',
      primary: '#007AFF',
      border: '#CCCCCC',
    },
    text: {
      h4: {},
      bodyLarge: {},
      bodySmall: {},
      labelSmall: {},
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.withSpring = (val: any, config?: any, cb?: any) => {
    if (cb) cb();
    return val;
  };
  return Reanimated;
});

const mockHaptics = {
  light: jest.fn(),
  medium: jest.fn(),
  achievement: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const mockUpdateProfile = jest.fn();
const mockUpdateSettings = jest.fn();

jest.mock('../../../store', () => ({
  useAppStore: () => ({
    profile: {
      name: 'Pilot',
      avatar: '🧠',
      mode: 'adult',
    },
    updateProfile: mockUpdateProfile,
    updateSettings: mockUpdateSettings,
  }),
}));

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const { getByText, getByDisplayValue } = render(<EditProfileScreen />);
    expect(getByText('Edit Profile')).toBeTruthy();
    expect(getByDisplayValue('Pilot')).toBeTruthy();
  });

  it('validates empty name on save', () => {
    const { getByLabelText } = render(<EditProfileScreen />);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const nameInput = getByLabelText('Name input');
    fireEvent.changeText(nameInput, '');

    fireEvent(getByLabelText('Save profile'), 'press');

    expect(alertSpy).toHaveBeenCalledWith('Name required', 'Please enter a name to continue.');
  });

  it('changes name and avatar', () => {
    const { getByLabelText } = render(<EditProfileScreen />);

    const nameInput = getByLabelText('Name input');
    fireEvent.changeText(nameInput, 'New Name');

    fireEvent.press(getByLabelText('Select avatar 🚀'));

    fireEvent.press(getByLabelText('Save profile'));

    expect(mockUpdateProfile).toHaveBeenCalledWith({
      name: 'New Name',
      avatar: '🚀',
      mode: 'adult',
    });
  });

  it('navigates back on back press', () => {
    const { getByLabelText } = render(<EditProfileScreen />);
    fireEvent.press(getByLabelText('Go back'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('saves profile on save press', () => {
    const { getByLabelText } = render(<EditProfileScreen />);

    fireEvent.press(getByLabelText('Save profile'));

    expect(mockHaptics.achievement).toHaveBeenCalled();
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      name: 'Pilot',
      avatar: '🧠',
      mode: 'adult',
    });
    expect(mockUpdateSettings).toHaveBeenCalledWith({ userMode: 'adult' });

    // Fast-forward time for the goBack timeout
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
  it('changes mode on press', () => {
    const { getByText } = render(<EditProfileScreen />);

    fireEvent.press(getByText('Child'));

    expect(mockHaptics.medium).toHaveBeenCalled();
  });
});
