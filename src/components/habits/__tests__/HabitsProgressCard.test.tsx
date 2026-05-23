import React from 'react';
import { render } from '@testing-library/react-native';

import { HabitsProgressCard } from '../HabitsProgressCard';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      textPrimary: '#000',
      textSecondary: '#666',
      textTertiary: '#999',
      success: '#34C759',
      secondary: '#FF9500',
      border: '#E5E5EA',
      card: '#FFFFFF',
      cardElevated: '#FFFFFF',
      primary: '#7B6CF6',
    },
    text: { labelSmall: {}, bodySmall: {} },
  }),
}));

describe('HabitsProgressCard', () => {
  it('renders the percentage from the completion ratio', () => {
    const { getByText } = render(
      <HabitsProgressCard
        completedCount={2}
        totalCount={4}
        completionRate={0.5}
        isPerfectDay={false}
      />
    );
    expect(getByText('50')).toBeTruthy();
    expect(getByText('%')).toBeTruthy();
  });

  it('renders the count strip', () => {
    const { getByText } = render(
      <HabitsProgressCard
        completedCount={2}
        totalCount={4}
        completionRate={0.5}
        isPerfectDay={false}
      />
    );
    expect(getByText('2')).toBeTruthy();
    expect(getByText(/4 done/)).toBeTruthy();
  });

  it('shows the celebration row only on a perfect day', () => {
    const { queryByText, rerender } = render(
      <HabitsProgressCard
        completedCount={1}
        totalCount={2}
        completionRate={0.5}
        isPerfectDay={false}
      />
    );
    expect(queryByText(/Perfect day/)).toBeNull();

    rerender(
      <HabitsProgressCard completedCount={2} totalCount={2} completionRate={1} isPerfectDay />
    );
    expect(queryByText(/Perfect day/)).toBeTruthy();
  });

  it('renders 0% when no habits exist for today', () => {
    // Defensive: the screen hides the card entirely when totalCount=0,
    // but the math should still degrade gracefully if a caller forgets.
    const { getAllByText, getByText } = render(
      <HabitsProgressCard
        completedCount={0}
        totalCount={0}
        completionRate={0}
        isPerfectDay={false}
      />
    );
    // "0" appears in both the percentage number and the count strip
    // ("0 / 0 done") — assert at least one is rendered.
    expect(getAllByText('0').length).toBeGreaterThan(0);
    expect(getByText('%')).toBeTruthy();
  });
});
