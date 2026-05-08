import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressScreen } from '../ProgressScreen';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Rect: View,
    G: View,
  };
});

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textDisabled: '#CCCCCC',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      secondary: '#FF9500',
      success: '#34C759',
      warning: '#FFCC00',
      streakFire: '#FF6B35',
      card: '#F5F5F5',
      border: '#CCCCCC',
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

const mockState = {
  stats: {
    totalXP: 1500,
    level: 4,
    xpToNextLevel: 100,
    tasksCompleted: 12,
    habitsCompleted: 9,
    focusMinutes: 240,
    currentStreak: 6,
    longestStreak: 10,
    unlockedAchievements: ['first_task'],
    weeklyXP: [10, 20, 30, 40, 50, 60, 70],
    weeklyTasks: [1, 2, 3, 0, 4, 1, 2],
  },
  profile: { name: 'Tester', avatar: '🧠' },
};

jest.mock('../../../store', () => ({
  useAppStore: (selector: any) => (selector ? selector(mockState) : mockState),
  selectStats: (s: any) => s.stats,
}));

describe('ProgressScreen', () => {
  it('renders profile, stats, weekly chart and achievements', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Tester')).toBeTruthy();
    expect(getByText(/Level 4/)).toBeTruthy();
    expect(getByText(/6-day streak/)).toBeTruthy();
    expect(getByText(/LEVEL 4 PROGRESS/)).toBeTruthy();
    expect(getByText('This Week')).toBeTruthy();
    expect(getByText(/Unlocked/)).toBeTruthy();
    expect(getByText(/Coming Up/)).toBeTruthy();
  });

  it('handles missing profile and zero streak', () => {
    mockState.profile = null as any;
    mockState.stats.currentStreak = 0;
    mockState.stats.unlockedAchievements = [];

    const { getByText, queryByText } = render(<ProgressScreen />);
    expect(getByText('Pilot')).toBeTruthy();
    expect(queryByText(/-day streak/)).toBeNull();
    expect(queryByText(/Unlocked/)).toBeNull();

    mockState.profile = { name: 'Tester', avatar: '🧠' } as any;
    mockState.stats.currentStreak = 6;
    mockState.stats.unlockedAchievements = ['first_task'];
  });
});
