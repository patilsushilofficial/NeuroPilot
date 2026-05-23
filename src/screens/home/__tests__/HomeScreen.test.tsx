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
      textOnPrimary: '#FFFFFF',
      surface: '#F5F5F5',
      card: '#F5F5F5',
      cardElevated: '#FFFFFF',
      border: '#CCCCCC',
      divider: '#DDDDDD',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      secondary: '#34C759',
      secondaryLight: '#62EBFF',
      secondaryContainer: '#FFF1E6',
      successContainer: '#D4F8E0',
      warning: '#FF9500',
      warningContainer: '#FFF8E6',
      errorContainer: '#FFE0E0',
      error: '#FF3B30',
      success: '#34C759',
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

// Feather icons render as Text in tests so we can find them by label
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Feather: ({ name }: { name: string }) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

const mockHandleQuickCapture = jest.fn();
const mockHandleAvatarPress = jest.fn();
const mockHandleSettingsPress = jest.fn();
const mockToggleTask = jest.fn();
const mockToggleHabit = jest.fn();
const mockViewAll = jest.fn();
const mockStartFocus = jest.fn();
const mockAddTask = jest.fn();
const mockViewHabits = jest.fn();
const mockViewProgress = jest.fn();
const mockRefreshQuote = jest.fn();
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
  activeFocus: { status: 'idle', phase: 'focus', secondsRemaining: 0, totalSeconds: 0 },
  settings: { showMotivationalQuotes: true },
  todayQuote: { text: 'Stay focused', author: 'Anon' },
  refreshQuote: mockRefreshQuote,
  completedTodayTasks: 1,
  completedHabits: 1,
  xpProgress: 0.4,
  handleQuickCapture: mockHandleQuickCapture,
  handleAvatarPress: mockHandleAvatarPress,
  handleSettingsPress: mockHandleSettingsPress,
  avatarAnimStyle: {},
  navigation: { navigate: mockNavigate },
  topTodayItems: [
    {
      type: 'task' as const,
      id: 't1',
      title: 'Write report',
      priority: 'high' as const,
      completed: false,
    },
    { type: 'habit' as const, id: 'h1', title: 'Meditate', emoji: '🧘', completed: false },
  ],
  todayTotalCount: 2,
  handleToggleTaskFromHome: mockToggleTask,
  handleToggleHabitFromHome: mockToggleHabit,
  handleViewAllTasks: mockViewAll,
  handleStartFocus: mockStartFocus,
  handleAddTask: mockAddTask,
  handleViewHabits: mockViewHabits,
  handleViewProgress: mockViewProgress,
  quickActions: [],
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

  it('renders hero, today section, and quote', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/LEVEL 3/)).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Quick Actions')).toBeTruthy();
    expect(getByText('Start Focus')).toBeTruthy();
    expect(getByText(/Stay focused/)).toBeTruthy();
  });

  it('renders today rows from topTodayItems', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Write report')).toBeTruthy();
    expect(getByText('Meditate')).toBeTruthy();
    expect(getByText('HABIT')).toBeTruthy();
  });

  it('shows the empty state when no items today', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      topTodayItems: [],
      todayTotalCount: 0,
    };
    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('A clear runway')).toBeTruthy();
    expect(queryByText('View all')).toBeNull();
  });

  it('navigates to settings via icon button', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Open settings'));
    expect(mockHandleSettingsPress).toHaveBeenCalled();
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

  it('shows active focus banner when focus is running and navigates on press', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      activeFocus: {
        status: 'running',
        phase: 'focus',
        secondsRemaining: 754,
        totalSeconds: 1500,
      },
    };
    const { getByLabelText } = render(<HomeScreen />);
    const banner = getByLabelText(/Focus session running/);
    fireEvent.press(banner);
    expect(mockNavigate).toHaveBeenCalledWith('Focus');
  });

  it('shows the focus banner when paused as well', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      activeFocus: {
        status: 'paused',
        phase: 'focus',
        secondsRemaining: 754,
        totalSeconds: 1500,
      },
    };
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText(/Focus session paused/)).toBeTruthy();
  });

  it('hides motivational quote when disabled', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      settings: { showMotivationalQuotes: false },
    };
    const { queryByText } = render(<HomeScreen />);
    expect(queryByText(/Stay focused/)).toBeNull();
  });

  it('refreshes the quote when the refresh affordance is pressed', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Show another quote'));
    expect(mockRefreshQuote).toHaveBeenCalled();
  });

  it('toggles a task from the today list', () => {
    const { getAllByRole } = render(<HomeScreen />);
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    expect(mockToggleTask).toHaveBeenCalledWith('t1');
  });

  it('toggles a habit from the today list', () => {
    const { getAllByRole } = render(<HomeScreen />);
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[1]);
    expect(mockToggleHabit).toHaveBeenCalledWith('h1');
  });

  it('navigates from quick action tiles', () => {
    const { getByLabelText } = render(<HomeScreen />);
    fireEvent.press(getByLabelText('Start Focus'));
    fireEvent.press(getByLabelText('Add Task'));
    fireEvent.press(getByLabelText('My Habits'));
    fireEvent.press(getByLabelText('Progress'));
    expect(mockStartFocus).toHaveBeenCalled();
    expect(mockAddTask).toHaveBeenCalled();
    expect(mockViewHabits).toHaveBeenCalled();
    expect(mockViewProgress).toHaveBeenCalled();
  });

  it('renders fallback avatar when profile missing', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      profile: null as any,
    };
    const { getByLabelText } = render(<HomeScreen />);
    expect(getByLabelText('Edit your profile')).toBeTruthy();
  });

  it('shows the +N more affordance when more than 3 items today', () => {
    mockHomeReturn = {
      ...baseHomeReturn,
      topTodayItems: baseHomeReturn.topTodayItems,
      todayTotalCount: 5,
    };
    const { getByText, getByLabelText } = render(<HomeScreen />);
    expect(getByText('+3 more')).toBeTruthy();
    fireEvent.press(getByLabelText('View 3 more items'));
    expect(mockViewAll).toHaveBeenCalled();
  });
});
