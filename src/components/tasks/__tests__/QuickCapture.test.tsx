import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickCapture } from '../QuickCapture';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useHaptics } from '../../../hooks/useHaptics';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      border: '#E5E5EA',
      card: '#FFFFFF',
      surface: '#F2F2F7',
      textPrimary: '#000',
      primary: '#007AFF',
      textTertiary: '#8E8E93',
      textSecondary: '#666',
      primaryContainer: '#E1F5FE',
      primaryLight: '#0288D1',
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
    withSpring: jest.fn().mockImplementation((val, config, cb) => {
      if (cb) cb(true);
      return val;
    }),
    default: {
      View: View,
    },
    View: View,
  };
});

describe('QuickCapture', () => {
  it('renders correctly', () => {
    const onCapture = jest.fn();
    const { getByPlaceholderText } = render(<QuickCapture onCapture={onCapture} />);
    expect(getByPlaceholderText('Capture a thought or task…')).toBeTruthy();
  });

  it('handles input and submit', () => {
    const onCapture = jest.fn();
    const { getByPlaceholderText, getByText } = render(<QuickCapture onCapture={onCapture} />);

    const input = getByPlaceholderText('Capture a thought or task…');
    fireEvent.changeText(input, 'New Task');

    const addButton = getByText('+');
    fireEvent.press(addButton);

    expect(onCapture).toHaveBeenCalledWith('New Task', 'medium');
  });

  it('handles priority selection', () => {
    const onCapture = jest.fn();
    const { getByPlaceholderText, getByText } = render(<QuickCapture onCapture={onCapture} />);

    const input = getByPlaceholderText('Capture a thought or task…');
    fireEvent.changeText(input, 'New Task');
    fireEvent(input, 'focus');

    const highPriority = getByText('High');
    fireEvent.press(highPriority);

    const submitButton = getByText('+');
    fireEvent.press(submitButton);

    expect(onCapture).toHaveBeenCalledWith('New Task', 'high');
  });

  it('does not submit empty text', () => {
    const onCapture = jest.fn();
    const { getByPlaceholderText, getByText } = render(<QuickCapture onCapture={onCapture} />);

    const input = getByPlaceholderText('Capture a thought or task…');
    fireEvent.changeText(input, '   ');

    const addButton = getByText('+');
    fireEvent.press(addButton);

    expect(onCapture).not.toHaveBeenCalled();
  });

  it('handles blur with text', () => {
    const { getByPlaceholderText } = render(<QuickCapture onCapture={jest.fn()} />);

    const input = getByPlaceholderText('Capture a thought or task…');
    fireEvent.changeText(input, 'New Task');
    fireEvent(input, 'blur');

    // Should still be expanded or have text
    expect(input.props.value).toBe('New Task');
  });

  it('handles blur without text', () => {
    const { getByPlaceholderText } = render(<QuickCapture onCapture={jest.fn()} />);

    const input = getByPlaceholderText('Capture a thought or task…');
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');

    // Should be collapsed
    expect(input.props.value).toBe('');
  });
});
