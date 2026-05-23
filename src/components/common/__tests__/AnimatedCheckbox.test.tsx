import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnimatedCheckbox } from '../AnimatedCheckbox';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useHaptics } from '../../../hooks/useHaptics';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      primary: '#007AFF',
      border: '#E5E5EA',
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
    useSharedValue: jest.fn().mockReturnValue({ value: 0 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withTiming: jest.fn().mockImplementation((val) => val),
    withSpring: jest.fn().mockImplementation((val) => val),
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

describe('AnimatedCheckbox', () => {
  it('renders correctly', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<AnimatedCheckbox checked={false} onToggle={onToggle} />);
    expect(getByRole('checkbox')).toBeTruthy();
  });

  it('handles toggle when unchecked', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<AnimatedCheckbox checked={false} onToggle={onToggle} />);

    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);
    expect(onToggle).toHaveBeenCalled();
  });

  it('handles toggle when checked', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<AnimatedCheckbox checked={true} onToggle={onToggle} />);

    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);
    expect(onToggle).toHaveBeenCalled();
  });

  it('does not toggle when disabled', () => {
    const onToggle = jest.fn();
    const { getByRole } = render(<AnimatedCheckbox checked={false} onToggle={onToggle} disabled />);

    const checkbox = getByRole('checkbox');
    fireEvent.press(checkbox);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
