import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProgressScreen } from '../ProgressScreen';
import { ACHIEVEMENTS } from '../../../constants/achievements';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Rect: View,
    G: View,
    Circle: View,
  };
});

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#FAFAFA',
      card: '#F5F5F5',
      cardElevated: '#FFFFFF',
      border: '#CCCCCC',
      divider: '#DDDDDD',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      textDisabled: '#CCCCCC',
      textOnPrimary: '#FFFFFF',
      primary: '#007AFF',
      primaryLight: '#5599FF',
      primaryContainer: '#E6F0FF',
      secondary: '#FF9500',
      secondaryLight: '#FFB957',
      secondaryContainer: '#FFF1E6',
      success: '#34C759',
      successContainer: '#D4F8E0',
      warning: '#FFCC00',
      warningContainer: '#FFF8E6',
      error: '#FF3B30',
      errorContainer: '#FFE0E0',
      streakFire: '#FF6B35',
    },
    text: {
      h2: {},
      h3: {},
      h4: {},
      bodyMedium: {},
      bodySmall: {},
      labelSmall: {},
      labelMedium: {},
      xpDisplay: {},
    },
    shadows: {
      glow: () => ({}),
    },
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Feather: ({ name }: { name: string }) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

const baseProgressReturn = {
  profile: { name: 'Tester', avatar: '🧠' },
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
  xpProgress: 0.42,
  xpInLevel: 230,
  xpForLevel: 500,
  headlineStats: {
    tasks: '12',
    habits: '9',
    focus: '4h',
  },
  unlockedAchievements: ACHIEVEMENTS.filter((a) => a.id === 'first_task'),
  lockedAchievements: ACHIEVEMENTS.filter((a) => a.id !== 'first_task' && !a.secret),
  achievementsUnlockedCount: 1,
  achievementsTotal: ACHIEVEMENTS.filter((a) => !a.secret).length,
  weeklyXPTotal: 280,
  weeklyTasksTotal: 13,
  todayWeekIndex: 3,
};

let mockProgressReturn = { ...baseProgressReturn };

jest.mock('../../../hooks/useProgressScreen', () => ({
  useProgressScreen: () => mockProgressReturn,
}));

describe('ProgressScreen', () => {
  beforeEach(() => {
    mockProgressReturn = { ...baseProgressReturn };
  });

  it('renders the hero with level, name, total XP, and streak', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/LEVEL 4 ·/)).toBeTruthy();
    expect(getByText('Tester')).toBeTruthy();
    expect(getByText(/1,500/)).toBeTruthy(); // total XP
    expect(getByText('6')).toBeTruthy(); // streak number
    expect(getByText('DAYS')).toBeTruthy();
  });

  it('shows the XP progress block with XP-in-level and to-next', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/LEVEL 4 PROGRESS/)).toBeTruthy();
    expect(getByText('230 / 500 XP')).toBeTruthy();
    expect(getByText(/100 XP to Level 5/)).toBeTruthy();
  });

  it('renders the headline stat tiles', () => {
    const { getByText, getByLabelText } = render(<ProgressScreen />);
    expect(getByText('TASKS')).toBeTruthy();
    expect(getByText('HABITS')).toBeTruthy();
    expect(getByText('FOCUS')).toBeTruthy();
    expect(getByLabelText('Tasks: 12')).toBeTruthy();
    expect(getByLabelText('Habits: 9')).toBeTruthy();
    expect(getByLabelText('Focus: 4h')).toBeTruthy();
  });

  it('renders the weekly activity card with totals and toggles between metrics', () => {
    const { getByText, getByLabelText } = render(<ProgressScreen />);
    expect(getByText('Activity')).toBeTruthy();
    expect(getByText('THIS WEEK')).toBeTruthy();
    expect(getByText(/280/)).toBeTruthy(); // weekly XP total

    fireEvent.press(getByLabelText('Show Tasks'));
    expect(getByText(/13/)).toBeTruthy(); // weekly tasks total
    expect(getByText(/completed/)).toBeTruthy();
  });

  it('shows today and peak meta in the activity card', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/Today:/)).toBeTruthy();
    expect(getByText(/Peak:/)).toBeTruthy();
  });

  it('renders achievement count in the section header', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Achievements')).toBeTruthy();
    expect(getByText(`1 / ${baseProgressReturn.achievementsTotal}`)).toBeTruthy();
  });

  it('renders unlocked achievement cards and locked rows', () => {
    const { getByText, getAllByText, getAllByTestId } = render(<ProgressScreen />);
    expect(getByText('Task Starter')).toBeTruthy(); // unlocked
    expect(getByText(/UP NEXT/)).toBeTruthy();
    // The locked list cap defaults to 6, so at least one locked title from
    // the early-game cohort should appear (multiple matches are fine).
    expect(getAllByText(/First Spark|Deep Diver|Flow Architect/).length).toBeGreaterThan(0);
    expect(getAllByTestId('icon-lock').length).toBeGreaterThan(0);
  });

  it('shows "best streak" subline when longest > current', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/Best 10d/)).toBeTruthy();
  });

  it('hides the best-streak subline when current matches longest', () => {
    mockProgressReturn = {
      ...baseProgressReturn,
      stats: {
        ...baseProgressReturn.stats,
        currentStreak: 10,
        longestStreak: 10,
      },
    };
    const { queryByText } = render(<ProgressScreen />);
    expect(queryByText(/Best 10d/)).toBeNull();
  });

  it('falls back to "Pilot" when profile is missing', () => {
    mockProgressReturn = { ...baseProgressReturn, profile: null as any };
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Pilot')).toBeTruthy();
  });

  it('renders the empty achievements state when nothing is unlocked or locked-visible', () => {
    mockProgressReturn = {
      ...baseProgressReturn,
      unlockedAchievements: [],
      lockedAchievements: [],
      achievementsUnlockedCount: 0,
    };
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/Achievements appear here as you build your habits/)).toBeTruthy();
  });

  it('shows the "more to discover" tail when locked exceeds the visible cap', () => {
    // Use 8 fake locked items to exceed the default cap of 6.
    const fakeLocked = Array.from({ length: 8 }, (_, i) => ({
      id: `fake-${i}`,
      title: `Title ${i}`,
      description: 'desc',
      emoji: '🎯',
      category: 'tasks',
      xpReward: 10,
      requirement: { type: 'task_count', value: 1 },
    }));
    mockProgressReturn = {
      ...baseProgressReturn,
      lockedAchievements: fakeLocked as any,
    };
    const { getByText } = render(<ProgressScreen />);
    expect(getByText(/2 more to discover/)).toBeTruthy();
  });
});
