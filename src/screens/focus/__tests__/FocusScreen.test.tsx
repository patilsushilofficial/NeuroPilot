import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FocusScreen } from '../FocusScreen';

const mockHaptics = {
  light: jest.fn(),
};

jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      secondary: '#FF9500',
    },
    text: {
      h2: {},
      h3: {},
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      labelSmall: {},
      labelMedium: {},
    },
  }),
}));

jest.mock('../../../components/focus/CircularTimer', () => {
  const { Text, View } = require('react-native');
  return {
    CircularTimer: ({ phase }: any) => (
      <View>
        <Text>circular-timer:{phase}</Text>
      </View>
    ),
  };
});

jest.mock('../../../components/focus/FocusShield', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    FocusShield: ({ isActive, onToggle }: any) => (
      <TouchableOpacity
        accessibilityLabel="focus-shield-toggle"
        onPress={() => onToggle(!isActive)}
      >
        <Text>shield:{String(isActive)}</Text>
      </TouchableOpacity>
    ),
  };
});

const mockHandleStart = jest.fn();
const mockHandlePauseResume = jest.fn();
const mockHandleAbandon = jest.fn();
const mockHandleSelectPreset = jest.fn();
const mockSkipPhase = jest.fn();
const mockHandleSkipPhase = jest.fn(() => {
  mockHaptics.light();
  mockSkipPhase();
});
const mockToggleShield = jest.fn();

const buildTipForPhase = (phase: string): string => {
  if (phase === 'short_break') return 'Move your body!';
  if (phase === 'long_break') return 'Long break earned!';
  return 'Remove distractions.';
};

const buildInfoItems = (preset: any) => [
  { id: 'focus', label: 'Work', emoji: '🧠', value: `${preset.focusMinutes}m` },
  { id: 'shortBreak', label: 'Little break', emoji: '☕', value: `${preset.shortBreakMinutes}m` },
  { id: 'longBreak', label: 'Big break', emoji: '🌿', value: `${preset.longBreakMinutes}m` },
  { id: 'xp', label: 'Bonus', emoji: '⚡', value: `+${preset.focusMinutes * 2}` },
];

const basePreset = {
  id: 'classic',
  name: 'Classic',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

const idleReturn = {
  active: {
    secondsRemaining: 1500,
    totalSeconds: 1500,
    phase: 'focus',
    completedPomodoros: 0,
  },
  stats: { focusMinutes: 0 },
  shieldActive: false,
  selectedPreset: 'classic',
  handleSelectPreset: mockHandleSelectPreset,
  preset: basePreset,
  isIdle: true,
  isRunning: false,
  isPaused: false,
  isActive: false,
  handleStart: mockHandleStart,
  handlePauseResume: mockHandlePauseResume,
  handleAbandon: mockHandleAbandon,
  todaySessions: [],
  todayFocusMinutes: 0,
  handleSkipPhase: mockHandleSkipPhase,
  skipPhase: mockSkipPhase,
  toggleShield: mockToggleShield,
  tipText: buildTipForPhase('focus'),
  infoItems: buildInfoItems(basePreset),
};

let mockTimerState: any = idleReturn;

jest.mock('../../../hooks/useFocusTimer', () => ({
  useFocusTimer: () => mockTimerState,
}));

describe('FocusScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTimerState = { ...idleReturn };
  });

  it('renders idle state with preset picker', () => {
    const { getByText } = render(<FocusScreen />);
    expect(getByText(/One task\. One timer/)).toBeTruthy();
    expect(getByText('PICK YOUR TIMER')).toBeTruthy();
    expect(getByText(/Start Classic/)).toBeTruthy();
  });

  it('handles start press', () => {
    const { getByText } = render(<FocusScreen />);
    fireEvent.press(getByText(/Start Classic/));
    expect(mockHandleStart).toHaveBeenCalled();
  });

  it('handles preset selection', () => {
    const { getByText } = render(<FocusScreen />);
    fireEvent.press(getByText('Classic Pomodoro'));
    expect(mockHandleSelectPreset).toHaveBeenCalled();
  });

  it('renders running state with pause control and pomodoro dots', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isRunning: true,
      isActive: true,
      active: { ...idleReturn.active, phase: 'focus', completedPomodoros: 2 },
    };
    const { getByText } = render(<FocusScreen />);
    expect(getByText(/Pause/)).toBeTruthy();
    expect(getByText('End Session')).toBeTruthy();
  });

  it('handles pause/resume press', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isRunning: true,
      isActive: true,
    };
    const { getByText } = render(<FocusScreen />);
    fireEvent.press(getByText(/Pause/));
    expect(mockHandlePauseResume).toHaveBeenCalled();
  });

  it('handles abandon press', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isPaused: true,
      isActive: true,
    };
    const { getByLabelText } = render(<FocusScreen />);
    fireEvent.press(getByLabelText('End session'));
    expect(mockHandleAbandon).toHaveBeenCalled();
  });

  it('handles skip press during active session', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isRunning: true,
      isActive: true,
    };
    const { getByLabelText } = render(<FocusScreen />);
    fireEvent.press(getByLabelText('Skip to next phase'));
    expect(mockHaptics.light).toHaveBeenCalled();
    expect(mockSkipPhase).toHaveBeenCalled();
  });

  it('renders break tip when in short_break phase', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isPaused: true,
      isActive: true,
      active: { ...idleReturn.active, phase: 'short_break' },
      tipText: buildTipForPhase('short_break'),
    };
    const { getByText } = render(<FocusScreen />);
    expect(getByText(/Move your body/)).toBeTruthy();
  });

  it('renders long-break tip when in long_break phase', () => {
    mockTimerState = {
      ...idleReturn,
      isIdle: false,
      isPaused: true,
      isActive: true,
      active: { ...idleReturn.active, phase: 'long_break' },
      tipText: buildTipForPhase('long_break'),
    };
    const { getByText } = render(<FocusScreen />);
    expect(getByText(/Long break earned/)).toBeTruthy();
  });

  it('toggles focus shield', () => {
    const { getByLabelText } = render(<FocusScreen />);
    fireEvent.press(getByLabelText('focus-shield-toggle'));
    expect(mockToggleShield).toHaveBeenCalledWith(true);
  });
});
