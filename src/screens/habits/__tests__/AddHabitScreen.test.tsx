import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AddHabitScreen } from '../AddHabitScreen';
import { Alert } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      border: '#CCCCCC',
      card: '#F5F5F5',
      primaryContainer: '#E6F0FF',
      primary: '#007AFF',
      primaryLight: '#5599FF',
    },
    text: {
      h4: {},
      bodyMedium: {},
      labelSmall: {},
      labelMedium: {},
      bodySmall: {},
    },
  }),
}));

const mockHaptics = {
  success: jest.fn(),
  light: jest.fn(),
  warning: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  goBack: jest.fn(),
};

const mockRoute = {
  params: {},
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

const mockAddHabit = jest.fn();
const mockUpdateHabit = jest.fn();
const mockArchiveHabit = jest.fn();
const mockGetHabitById = jest.fn();

jest.mock('../../../store', () => ({
  useAppStore: () => ({
    addHabit: mockAddHabit,
    updateHabit: mockUpdateHabit,
    archiveHabit: mockArchiveHabit,
    getHabitById: mockGetHabitById,
  }),
}));

describe('AddHabitScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = {};
  });

  it('renders correctly for new habit', () => {
    const { getByText, getByPlaceholderText } = render(<AddHabitScreen />);
    expect(getByText('New Habit')).toBeTruthy();
    expect(getByPlaceholderText('Habit name…')).toBeTruthy();
  });

  it('renders correctly for editing habit', () => {
    const mockHabit = {
      id: 'habit_1',
      title: 'Existing Habit',
      emoji: '🧘',
      category: 'mindfulness',
      frequency: 'daily',
      color: '#7B6CF6',
    };
    mockRoute.params = { habitId: 'habit_1' };
    mockGetHabitById.mockReturnValue(mockHabit);

    const { getByText, getByDisplayValue } = render(<AddHabitScreen />);
    expect(getByText('Edit Habit')).toBeTruthy();
    expect(getByDisplayValue('Existing Habit')).toBeTruthy();
  });

  it('saves new habit on save press', () => {
    const { getByPlaceholderText, getByText, getAllByText } = render(<AddHabitScreen />);
    
    const input = getByPlaceholderText('Habit name…');
    fireEvent.changeText(input, 'New Habit');
    
    // Select emoji '🧘'
    fireEvent.press(getAllByText('🧘')[0]);
    
    // Select category 'Mindfulness'
    fireEvent.press(getByText('Mindfulness'));
    
    // Select frequency 'Every Day'
    fireEvent.press(getByText('Every Day'));
    
    fireEvent.press(getByText('Save'));
    
    expect(mockAddHabit).toHaveBeenCalledWith({
      title: 'New Habit',
      emoji: '🧘',
      category: 'mindfulness',
      frequency: 'daily',
      color: '#7B6CF6',
      reminderTime: undefined,
      description: undefined,
      customDays: undefined,
    });
    expect(mockHaptics.success).toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('changes color on press', () => {
    const { getByLabelText } = render(<AddHabitScreen />);
    
    fireEvent.press(getByLabelText('Color #4ECDC4'));
    
    expect(mockHaptics.light).toHaveBeenCalled();
  });

  it('updates existing habit on save press', () => {
    const mockHabit = {
      id: 'habit_1',
      title: 'Existing Habit',
      emoji: '🧘',
      category: 'mindfulness',
      frequency: 'daily',
      color: '#7B6CF6',
    };
    mockRoute.params = { habitId: 'habit_1' };
    mockGetHabitById.mockReturnValue(mockHabit);

    const { getByPlaceholderText, getByText } = render(<AddHabitScreen />);
    
    const input = getByPlaceholderText('Habit name…');
    fireEvent.changeText(input, 'Updated Habit');
    
    fireEvent.press(getByText('Save'));
    
    expect(mockUpdateHabit).toHaveBeenCalledWith('habit_1', {
      title: 'Updated Habit',
      emoji: '🧘',
      category: 'mindfulness',
      frequency: 'daily',
      color: '#7B6CF6',
    });
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('archives habit on archive press', () => {
    const mockHabit = {
      id: 'habit_1',
      title: 'Existing Habit',
      emoji: '🧘',
      category: 'mindfulness',
      frequency: 'daily',
      color: '#7B6CF6',
    };
    mockRoute.params = { habitId: 'habit_1' };
    mockGetHabitById.mockReturnValue(mockHabit);

    const { getByText } = render(<AddHabitScreen />);
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(getByText('Archive Habit'));
    
    expect(alertSpy).toHaveBeenCalled();
    
    // Simulate pressing Archive in the alert
    const buttons = alertSpy.mock.calls[0][2];
    const archiveButton = buttons?.find((b) => b.text === 'Archive');
    
    act(() => {
      archiveButton?.onPress?.();
    });
    
    expect(mockArchiveHabit).toHaveBeenCalledWith('habit_1');
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('navigates back on cancel press', () => {
    const { getByText } = render(<AddHabitScreen />);
    fireEvent.press(getByText('Cancel'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
