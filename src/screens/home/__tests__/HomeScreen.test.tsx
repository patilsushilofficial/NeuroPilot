import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      surface: '#F5F5F5',
      card: '#F5F5F5',
      border: '#CCCCCC',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      secondaryContainer: '#FFF1E6',
      warningContainer: '#FFF8E6',
      streakFire: '#FF6B35',
    },
    text: {
      h2: {},
      h3: {},
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      labelSmall: {},
      labelMedium: {},
      displayMedium: {},
      xpDisplay: {},
    },
    shadows: {
      glow: () => ({}),
    },
  }),
}));

const mockHandleQuickCapture = jest.fn();
const mockHandleAvatarPress = jest.fn();
const mockNavigate = jest.fn();

const baseHomeReturn = {
  profile: { name: 'Tester', avatar: '🧠' },
  stats: {
    level: 3,
    totalXP: 1234,
    xpToNextLevel: 200,
    currentStreak: 5,
    focusMinutes: 75,
  },
  todaysTasks: [
    { id: 't1', status: 'pending' },
    { id: 't2', status: 'completed' },
  ],
  todaysHabits: [{ id: 'h1' }, { id: 'h2' }],
  activeFocus: { status: 'idle' },
  settings: { showMotivationalQuotes: true },
  todayQuote: { text: 'Stay focused', author: 'Anon' },
  completedTodayTasks: 1,
  completedHabits: 1,
  xpProgress: 0.4,
  handleQuickCapture: mockHandleQuickCapture,
  handleAvatarPress: mockHandleAvatarPress,
  avatarAnimStyle: {},
  navigation: { navigate: mockNavigate },
  quickActions: [
    {
      emoji: '📋',
      label: 'Add Task',
      onPress: () => mockNavigate('TasksTab', { screen: 'AddTask' }),
    },
    { emoji: '🎯', label: 'Start Focus', onPress: () => mockNavigate('Focus') },
    { emoji: '🔥', label: 'My Habits', onPress: () => mockNavigate('HabitsTab') },
    { emoji: '📈', label: 'Progress', onPress: () => mockNavigate('Progress') },
  ],
};

let mockHomeReturn = { ...baseHomeReturn };

jest.mock('../../../hooks/useHome', () => ({
  useHome: () => mockHomeReturn,
}));

jest.mock('../../../components/tasks/QuickCapture', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    QuickCapture: ({ onCapture }: any) => (
      <TouchableOpacity
        accessibilityLabel="quick-capture"
        onPress={() => onCapture('Hello', 'medium')}
      >
        <Text>QuickCapture</Text>
      </TouchableOpacity>
    ),
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeReturn = { ...baseHomeReturn };
  });

  it('renders when profile and stats present', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/LEVEL 3/)).toBeTruthy();
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText(/Stay focused/)).toBeTruthy();
  });

  it('navigates to settings via icon button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Open settings'));
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });

  it('triggers avatar press', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Edit your profile'));
    expect(mockHandleAvatarPress).toHaveBeenCalled();
  });

  it('forwards quick capture events', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('quick-capture'));
    expect(mockHandleQuickCapture).toHaveBeenCalledWith('Hello', 'medium');
  });

  it('shows active focus banner when focus is running', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      activeFocus: { status: 'running' },
    };
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Active focus session — tap to view'));
    expect(mockNavigate).toHaveBeenCalledWith('Focus');
  });

  it('hides motivational quote when disabled', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      settings: { showMotivationalQuotes: false },
    };
    const { queryByText } = render(<HomeScreen />);
    expect(queryByText(/Stay focused/)).toBeNull();
  });

  it('navigates from quick action buttons', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Add Task'));
    fireEvent.press(getByLabelText('Start Focus'));
    fireEvent.press(getByLabelText('My Habits'));
    fireEvent.press(getByLabelText('Progress'));
    expect(mockNavigate).toHaveBeenCalledWith('TasksTab', { screen: 'AddTask' });
    expect(mockNavigate).toHaveBeenCalledWith('Focus');
    expect(mockNavigate).toHaveBeenCalledWith('HabitsTab');
    expect(mockNavigate).toHaveBeenCalledWith('Progress');
  });

  it('renders fallback avatar when profile missing', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      profile: null as any,
    };
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('Edit your profile')).toBeTruthy();
  });
});
