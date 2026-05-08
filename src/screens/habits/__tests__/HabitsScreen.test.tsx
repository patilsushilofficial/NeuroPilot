import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HabitsScreen } from '../HabitsScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      secondary: '#FF9500',
      success: '#34C759',
    },
    text: {
      h2: {},
      bodySmall: {},
      labelMedium: {},
    },
  }),
}));

const mockHaptics = {
  success: jest.fn(),
  light: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

const mockNavigation = {
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const mockHabits = [
  { id: 'habit_1', title: 'Habit 1', frequency: 'daily', completions: [] },
  { id: 'habit_2', title: 'Habit 2', frequency: 'daily', completions: [] },
];

const mockUseAppStore = {
  getTodaysHabits: jest.fn().mockReturnValue(mockHabits),
  completeHabit: jest.fn().mockReturnValue(10),
  uncompleteHabit: jest.fn(),
  isHabitCompletedToday: jest.fn().mockReturnValue(false),
  addXP: jest.fn(),
  recordHabitComplete: jest.fn(),
};

jest.mock('../../../store', () => ({
  useAppStore: () => mockUseAppStore,
}));

describe('HabitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with habits', () => {
    const { getByText } = render(<HabitsScreen />);
    expect(getByText('Habits')).toBeTruthy();
    expect(getByText('Habit 1')).toBeTruthy();
    expect(getByText('Habit 2')).toBeTruthy();
  });

  it('renders empty state when no habits', () => {
    mockUseAppStore.getTodaysHabits.mockReturnValueOnce([]);
    const { getByText } = render(<HabitsScreen />);
    expect(getByText('No habits yet')).toBeTruthy();
  });

  it('navigates to AddHabit on press', () => {
    const { getByLabelText } = render(<HabitsScreen />);
    fireEvent.press(getByLabelText('Add new habit'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit');
  });

  it('toggles habit completion', () => {
    const { getByText } = render(<HabitsScreen />);
    
    // HabitCard has a press handler!
    // Let's assume we can press the habit title or the card!
    // In HabitCard.test.tsx, we probably pressed the card!
    // Let's check HabitCard.tsx to see what it renders!
    // It has a press handler on the card!
    // So we can use getByText('Habit 1') and press it!
    fireEvent.press(getByText('Habit 1'));
    
    expect(mockUseAppStore.completeHabit).toHaveBeenCalledWith('habit_1');
    expect(mockUseAppStore.addXP).toHaveBeenCalledWith(10);
    expect(mockUseAppStore.recordHabitComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
  });

  it('toggles habit uncompletion', () => {
    mockUseAppStore.isHabitCompletedToday.mockReturnValue(true);
    const { getByText } = render(<HabitsScreen />);
    
    fireEvent.press(getByText('Habit 1'));
    
    expect(mockUseAppStore.uncompleteHabit).toHaveBeenCalledWith('habit_1');
  });
  it('navigates to AddHabit on long press', () => {
    const { getByText } = render(<HabitsScreen />);
    fireEvent(getByText('Habit 1'), 'longPress');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit', { habitId: 'habit_1' });
  });

  it('navigates to AddHabit from the FAB even when the list is empty', () => {
    mockUseAppStore.getTodaysHabits.mockReturnValueOnce([]);
    const { getByLabelText } = render(<HabitsScreen />);
    fireEvent.press(getByLabelText('Add new habit'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit');
  });
});
