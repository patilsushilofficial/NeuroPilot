import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HabitCard } from '../HabitCard';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useHaptics } from '../../../hooks/useHaptics';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      border: '#E5E5EA',
      card: '#FFFFFF',
      surface: '#F2F2F7',
      textPrimary: '#000',
      textOnPrimary: '#FFF',
      primary: '#007AFF',
      streakFire: '#FF9500',
    },
    text: {
      bodyMedium: {},
    },
  }),
}));

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    success: jest.fn(),
    light: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withSpring: jest.fn().mockImplementation((val) => val),
    withSequence: jest.fn().mockImplementation((...args) => args[0]),
    default: {
      View: View,
    },
    View: View,
  };
});

describe('HabitCard', () => {
  const mockHabit = {
    id: '1',
    title: 'Read Book',
    emoji: '📚',
    color: '#FF2D55',
    streak: 3,
    xpPerCompletion: 10,
    completions: [{ date: '2026-05-08' }],
  };

  it('renders correctly when not completed today', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <HabitCard
        habit={mockHabit}
        isCompletedToday={false}
        onToggle={onToggle}
      />
    );
    expect(getByText('Read Book')).toBeTruthy();
    expect(getByText('🔥 3 day streak')).toBeTruthy();
    expect(getByText('+10 XP')).toBeTruthy();
  });

  it('renders correctly when completed today', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <HabitCard
        habit={mockHabit}
        isCompletedToday={true}
        onToggle={onToggle}
      />
    );
    expect(getByText('Read Book')).toBeTruthy();
    // The trailing check icon now carries the "✓" meaning visually,
    // so the label itself was simplified to just "Done".
    expect(getByText('Done')).toBeTruthy();
  });

  it('handles toggle', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <HabitCard
        habit={mockHabit}
        isCompletedToday={false}
        onToggle={onToggle}
      />
    );
    
    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('handles long press', () => {
    const onLongPress = jest.fn();
    const { getByRole } = render(
      <HabitCard
        habit={mockHabit}
        isCompletedToday={false}
        onToggle={jest.fn()}
        onLongPress={onLongPress}
      />
    );
    
    const checkbox = getByRole('checkbox');
    fireEvent(checkbox, 'longPress');
    expect(onLongPress).toHaveBeenCalledWith('1');
  });

  it('handles toggle when completed', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(
      <HabitCard
        habit={mockHabit}
        isCompletedToday={true}
        onToggle={onToggle}
      />
    );
    
    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
