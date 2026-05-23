import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskCard } from '../TaskCard';
import { useAppTheme } from '../../../hooks/useAppTheme';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      border: '#E5E5EA',
      card: '#FFFFFF',
      textPrimary: '#000',
      textTertiary: '#8E8E93',
      primary: '#007AFF',
      error: '#FF3B30',
      warning: '#FF9500',
    },
    text: {
      bodyMedium: {},
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withSpring: jest.fn().mockImplementation((val) => val),
    withTiming: jest.fn().mockImplementation((val) => val),
    withSequence: jest.fn().mockImplementation((...args) => args[0]),
    useDerivedValue: jest.fn().mockImplementation((cb) => ({ value: cb() })),
    interpolateColor: jest.fn().mockReturnValue('#fff'),
    default: {
      View: View,
      createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    },
    View: View,
    createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    Easing: {
      out: jest.fn().mockReturnValue({}),
      quad: {},
    },
  };
});

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    priority: 'high',
    status: 'pending',
    xpReward: 50,
    subtasks: [],
    dueDate: '2026-05-08',
  };

  it('renders correctly', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <TaskCard task={mockTask as any} onComplete={jest.fn()} onPress={onPress} />
    );
    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('+50 XP')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <TaskCard task={mockTask as any} onComplete={jest.fn()} onPress={onPress} />
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledWith('1');
  });

  it('handles complete', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    const { getByRole } = render(
      <TaskCard task={mockTask as any} onComplete={onComplete} onPress={jest.fn()} />
    );

    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);

    jest.advanceTimersByTime(200);
    expect(onComplete).toHaveBeenCalledWith('1');
    jest.useRealTimers();
  });

  it('renders with subtasks', () => {
    const taskWithSubtasks = {
      ...mockTask,
      subtasks: [
        { id: '1', title: 'Subtask 1', completed: true },
        { id: '2', title: 'Subtask 2', completed: false },
      ],
    };

    const { getByText } = render(
      <TaskCard task={taskWithSubtasks as any} onComplete={jest.fn()} onPress={jest.fn()} />
    );

    expect(getByText('1/2 steps')).toBeTruthy();
  });

  it('renders completed state', () => {
    const completedTask = {
      ...mockTask,
      status: 'completed',
    };

    const { getByText } = render(
      <TaskCard task={completedTask as any} onComplete={jest.fn()} onPress={jest.fn()} />
    );

    const title = getByText('Test Task');
    expect(title.props.style).toContainEqual(
      expect.objectContaining({ textDecorationLine: 'line-through' })
    );
  });

  it('handles long press', () => {
    const onLongPress = jest.fn();
    const { getByRole } = render(
      <TaskCard
        task={mockTask as any}
        onComplete={jest.fn()}
        onPress={jest.fn()}
        onLongPress={onLongPress}
      />
    );

    const button = getByRole('button');
    fireEvent(button, 'longPress');
    expect(onLongPress).toHaveBeenCalledWith('1');
  });
});
