import React from 'react';
import { render } from '@testing-library/react-native';
import { CircularTimer } from '../CircularTimer';
import { useAppTheme } from '../../../hooks/useAppTheme';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      successContainer: '#34C759',
      border: '#E5E5EA',
      textPrimary: '#000',
      textTertiary: '#8E8E93',
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    useSharedValue: jest.fn().mockReturnValue({ value: 0 }),
    useAnimatedProps: jest.fn().mockImplementation((cb) => cb()),
    withTiming: jest.fn().mockImplementation((val) => val),
    default: {
      View: View,
      createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    },
    View: View,
    createAnimatedComponent: jest.fn().mockImplementation((comp) => comp),
    Easing: {
      linear: {},
    },
  };
});

describe('CircularTimer', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CircularTimer
        secondsRemaining={1500}
        totalSeconds={1500}
        phase="focus"
        isRunning={true}
      />
    );
    expect(getByText('25:00')).toBeTruthy();
    expect(getByText('FOCUS')).toBeTruthy();
  });

  it('renders paused state', () => {
    const { getByText } = render(
      <CircularTimer
        secondsRemaining={1000}
        totalSeconds={1500}
        phase="focus"
        isRunning={false}
      />
    );
    expect(getByText('PAUSED')).toBeTruthy();
  });

  it('renders other phases', () => {
    const { getByText, rerender } = render(
      <CircularTimer
        secondsRemaining={300}
        totalSeconds={300}
        phase="short_break"
        isRunning={true}
      />
    );
    expect(getByText('05:00')).toBeTruthy();
    expect(getByText('SHORT BREAK')).toBeTruthy();
    
    rerender(
      <CircularTimer
        secondsRemaining={900}
        totalSeconds={900}
        phase="long_break"
        isRunning={true}
      />
    );
    expect(getByText('15:00')).toBeTruthy();
    expect(getByText('LONG BREAK')).toBeTruthy();
  });
});
