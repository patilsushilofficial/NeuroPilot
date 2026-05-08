import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../ProgressBar';
import { useAppTheme } from '../../../hooks/useAppTheme';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      primary: '#007AFF',
      border: '#E5E5EA',
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const mockView = View;
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 0.5 }),
    useAnimatedStyle: jest.fn().mockImplementation((cb) => cb()),
    withTiming: jest.fn().mockImplementation((val) => val),
    Easing: {
      out: jest.fn().mockReturnValue({}),
      cubic: {},
    },
    default: {
      View: mockView,
    },
    View: mockView,
  };
});

describe('ProgressBar', () => {
  it('renders correctly', () => {
    const { getByRole } = render(<ProgressBar progress={0.5} />);
    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('clamps progress value', () => {
    const { getByRole, rerender } = render(<ProgressBar progress={1.5} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
    
    rerender(<ProgressBar progress={-0.5} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('supports non-animated mode', () => {
    const { getByRole } = render(<ProgressBar progress={0.5} animated={false} />);
    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('supports custom colors and rounded prop', () => {
    const { getByRole } = render(
      <ProgressBar progress={0.5} color="#FF0000" backgroundColor="#000000" rounded={false} />
    );
    expect(getByRole('progressbar')).toBeTruthy();
  });
});
