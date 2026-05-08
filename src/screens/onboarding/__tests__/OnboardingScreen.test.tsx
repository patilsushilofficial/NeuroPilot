import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OnboardingScreen } from '../OnboardingScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#007AFF',
      primaryContainer: '#E6F0FF',
      card: '#F5F5F5',
      border: '#CCCCCC',
    },
    text: {
      h1: {},
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      bodyLarge: {},
      labelSmall: {},
      labelMedium: {},
      displayMedium: {},
    },
  }),
}));

const mockHaptics = {
  light: jest.fn(),
  medium: jest.fn(),
  achievement: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const mockSetProfile = jest.fn();
const mockUpdateSettings = jest.fn();

jest.mock('../../../store', () => ({
  useAppStore: () => ({
    setProfile: mockSetProfile,
    updateSettings: mockUpdateSettings,
  }),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the welcome step', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Meet NeuroPilot')).toBeTruthy();
    expect(getByText("Let's Go →")).toBeTruthy();
  });

  it('completes the full onboarding flow', () => {
    const { getByText, getAllByText, getByPlaceholderText, queryByText } = render(
      <OnboardingScreen />
    );

    fireEvent.press(getByText("Let's Go →"));
    expect(getByText('Who is this for?')).toBeTruthy();

    fireEvent.press(getByText('Child Mode'));
    expect(mockHaptics.medium).toHaveBeenCalled();

    fireEvent.press(getByText('Continue →'));
    expect(getByText('What should we call you?')).toBeTruthy();

    const input = getByPlaceholderText('Your name or nickname…');
    fireEvent.changeText(input, 'Avery');

    fireEvent.press(getAllByText('🚀')[0]);
    expect(mockHaptics.light).toHaveBeenCalled();

    fireEvent.press(getByText("Let's Start! 🚀"));
    expect(queryByText(/You're all set/)).toBeTruthy();

    fireEvent.press(getByText('Enter NeuroPilot 🚀'));
    expect(mockHaptics.achievement).toHaveBeenCalled();
    expect(mockSetProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Avery',
        mode: 'child',
        avatar: '🚀',
        onboardingComplete: true,
      })
    );
    expect(mockUpdateSettings).toHaveBeenCalledWith({ userMode: 'child' });
  });

  it('trims the entered name', () => {
    const { getByText, getByPlaceholderText } = render(<OnboardingScreen />);

    fireEvent.press(getByText("Let's Go →"));
    fireEvent.press(getByText('Continue →'));

    const input = getByPlaceholderText('Your name or nickname…');
    fireEvent.changeText(input, '  Spaces  ');
    fireEvent.press(getByText("Let's Start! 🚀"));

    fireEvent.press(getByText('Enter NeuroPilot 🚀'));
    expect(mockSetProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Spaces', mode: 'adult' })
    );
  });

  it('disables continue when name is empty', () => {
    const { getByText } = render(<OnboardingScreen />);
    fireEvent.press(getByText("Let's Go →"));
    fireEvent.press(getByText('Continue →'));

    fireEvent.press(getByText("Let's Start! 🚀"));
    expect(mockSetProfile).not.toHaveBeenCalled();
  });
});
