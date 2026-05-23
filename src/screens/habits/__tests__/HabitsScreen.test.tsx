import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HabitsScreen } from '../HabitsScreen';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textOnPrimary: '#FFFFFF',
      primary: '#7B6CF6',
      primaryContainer: 'rgba(123, 108, 246, 0.12)',
      secondary: '#FF9500',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      border: '#E5E5EA',
      success: '#34C759',
      successContainer: 'rgba(52, 199, 89, 0.1)',
      streakFire: '#FF9500',
    },
    text: {
      h1: {},
      h2: {},
      bodySmall: {},
      bodyMedium: {},
      labelSmall: {},
      labelMedium: {},
      labelLarge: {},
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
  {
    id: 'habit_1',
    title: 'Habit 1',
    emoji: '📚',
    color: '#FF2D55',
    frequency: 'daily',
    completions: [],
    streak: 0,
    xpPerCompletion: 10,
  },
  {
    id: 'habit_2',
    title: 'Habit 2',
    emoji: '🏃',
    color: '#34C759',
    frequency: 'daily',
    completions: [],
    streak: 0,
    xpPerCompletion: 10,
  },
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
    mockUseAppStore.getTodaysHabits.mockReturnValue(mockHabits);
    mockUseAppStore.isHabitCompletedToday.mockReturnValue(false);
  });

  it('renders the title and habit list', () => {
    const { getByText } = render(<HabitsScreen />);
    expect(getByText('Habits')).toBeTruthy();
    expect(getByText('Habit 1')).toBeTruthy();
    expect(getByText('Habit 2')).toBeTruthy();
  });

  it('renders the daily progress card with the percentage', () => {
    const { getAllByText, getByText } = render(<HabitsScreen />);
    expect(getByText('DAILY PROGRESS')).toBeTruthy();
    // 0 of 2 done → 0%. "0" shows up in both the big percent and the
    // count strip ("0 / 2 done"), so we accept either occurrence.
    expect(getAllByText('0').length).toBeGreaterThan(0);
    expect(getByText('%')).toBeTruthy();
    // Header subtitle is unique enough — uses "of 2 done today",
    // whereas the card's count strip uses "/ 2 done".
    expect(getByText(/of 2 done today/)).toBeTruthy();
  });

  it('omits the progress card and filter bar when no habits exist', () => {
    mockUseAppStore.getTodaysHabits.mockReturnValueOnce([]);
    const { queryByText, getByText } = render(<HabitsScreen />);
    expect(queryByText('DAILY PROGRESS')).toBeNull();
    expect(queryByText('All')).toBeNull();
    expect(getByText('No habits yet')).toBeTruthy();
  });

  it('renders the empty state without an inline CTA', () => {
    // Like Tasks, the FAB is the single primary affordance — the
    // EmptyState should never sprout a competing button.
    mockUseAppStore.getTodaysHabits.mockReturnValueOnce([]);
    const { queryByText } = render(<HabitsScreen />);
    expect(queryByText('Add a habit')).toBeNull();
  });

  it('groups habits under To do / Completed when both exist', () => {
    mockUseAppStore.isHabitCompletedToday.mockImplementation((id: string) => id === 'habit_2');
    const { getAllByText, getByText } = render(<HabitsScreen />);
    // "To do" appears in BOTH the segmented control's filter button and
    // the section header — both are valid renderings of this state.
    expect(getAllByText('To do').length).toBeGreaterThanOrEqual(2);
    // "Completed" only appears as the section header (the filter
    // button uses the shorter "Done"), so we can match it uniquely.
    expect(getByText('Completed')).toBeTruthy();
  });

  it('switches to the Done filter via the segmented control', () => {
    mockUseAppStore.isHabitCompletedToday.mockImplementation((id: string) => id === 'habit_2');
    const { getByLabelText, getAllByText, queryByText } = render(<HabitsScreen />);
    fireEvent.press(getByLabelText('Show completed habits'));
    // After switching to Done: the "Completed" section header is
    // present; the "To do" section header is gone (the filter button
    // text "To do" still exists, so we just check there's exactly one
    // "To do" left and "Completed" is rendered).
    expect(queryByText('Completed')).toBeTruthy();
    expect(getAllByText('To do')).toHaveLength(1);
  });

  it('toggles a habit via the card', () => {
    const { getByText } = render(<HabitsScreen />);
    fireEvent.press(getByText('Habit 1'));
    expect(mockUseAppStore.completeHabit).toHaveBeenCalledWith('habit_1');
    expect(mockUseAppStore.addXP).toHaveBeenCalledWith(10);
    expect(mockUseAppStore.recordHabitComplete).toHaveBeenCalled();
    expect(mockHaptics.success).toHaveBeenCalled();
  });

  it('uncompletes when the card is tapped while already done', () => {
    mockUseAppStore.isHabitCompletedToday.mockReturnValue(true);
    const { getByText } = render(<HabitsScreen />);
    fireEvent.press(getByText('Habit 1'));
    expect(mockUseAppStore.uncompleteHabit).toHaveBeenCalledWith('habit_1');
  });

  it('navigates to the detail screen on long press', () => {
    const { getByText } = render(<HabitsScreen />);
    fireEvent(getByText('Habit 1'), 'longPress');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit', {
      habitId: 'habit_1',
    });
  });

  it('navigates to AddHabit via the extended FAB', () => {
    const { getByLabelText, getByText } = render(<HabitsScreen />);
    expect(getByText('Add habit')).toBeTruthy();
    fireEvent.press(getByLabelText('Add habit'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit');
  });

  it('navigates to AddHabit from the FAB even when the list is empty', () => {
    mockUseAppStore.getTodaysHabits.mockReturnValueOnce([]);
    const { getByLabelText } = render(<HabitsScreen />);
    fireEvent.press(getByLabelText('Add habit'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddHabit');
  });
});
