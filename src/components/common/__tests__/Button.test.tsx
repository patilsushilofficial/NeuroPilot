import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useHaptics } from '../../../hooks/useHaptics';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      textOnPrimary: '#FFFFFF',
      textDisabled: '#C7C7CC',
      error: '#FF3B30',
    },
  }),
}));

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: jest.fn().mockReturnValue({
    light: jest.fn(),
  }),
}));

jest.mock('react-native-reanimated', () => {
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withSpring: jest.fn().mockImplementation((val) => val),
    createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
  };
});

describe('Button', () => {
  it('renders correctly', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Test Button" onPress={onPress} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Test Button" onPress={onPress} />);
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('does not press when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Test Button" onPress={onPress} disabled />);
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Test Button" onPress={onPress} loading />);
    
    expect(getByRole('button').props.accessibilityState.busy).toBe(true);
  });

  it('renders with different variants and sizes', () => {
    const onPress = jest.fn();
    const { rerender, getByText } = render(
      <Button label="Outline" onPress={onPress} variant="outline" size="sm" />
    );
    expect(getByText('Outline')).toBeTruthy();
    
    rerender(<Button label="Ghost" onPress={onPress} variant="ghost" size="lg" />);
    expect(getByText('Ghost')).toBeTruthy();
    
    rerender(<Button label="Danger" onPress={onPress} variant="danger" />);
    expect(getByText('Danger')).toBeTruthy();
  });

  it('handles pressIn and pressOut', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button label="Test Button" onPress={onPress} />);
    
    const button = getByRole('button');
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
  });
});
