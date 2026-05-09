import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import {
  SegmentedFilterBar,
  type SegmentedFilterOption,
} from '../SegmentedFilterBar';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#7B6CF6',
      surface: '#FFFFFF',
      border: '#E5E5EA',
      textOnPrimary: '#FFFFFF',
      textSecondary: '#666666',
    },
    text: { labelMedium: {} },
  }),
}));

// Two filter shapes — proves the component is genuinely generic over
// the key union and isn't accidentally hard-coded to a single screen's
// filter alphabet.
type TaskKey = 'all' | 'today' | 'completed';
const TASK_OPTIONS: readonly SegmentedFilterOption<TaskKey>[] = [
  { key: 'all', label: 'All', icon: 'list', a11y: 'all tasks' },
  { key: 'today', label: 'Today', icon: 'calendar', a11y: "today's tasks" },
  { key: 'completed', label: 'Done', icon: 'check-circle', a11y: 'completed tasks' },
];

type HabitKey = 'all' | 'pending' | 'done';
const HABIT_OPTIONS: readonly SegmentedFilterOption<HabitKey>[] = [
  { key: 'all', label: 'All', icon: 'list', a11y: "today's habits" },
  { key: 'pending', label: 'To do', icon: 'circle', a11y: 'pending habits' },
  { key: 'done', label: 'Done', icon: 'check-circle', a11y: 'completed habits' },
];

describe('SegmentedFilterBar', () => {
  it('renders every option as a labelled segment', () => {
    const { getByText } = render(
      <SegmentedFilterBar
        options={TASK_OPTIONS}
        selected="all"
        onSelect={jest.fn()}
      />
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Done')).toBeTruthy();
  });

  it('marks only the active segment with accessibilityState.selected', () => {
    const { getByLabelText } = render(
      <SegmentedFilterBar
        options={TASK_OPTIONS}
        selected="today"
        onSelect={jest.fn()}
      />
    );
    expect(
      getByLabelText("Show today's tasks").props.accessibilityState
    ).toEqual({ selected: true });
    expect(
      getByLabelText('Show all tasks').props.accessibilityState
    ).toEqual({ selected: false });
    expect(
      getByLabelText('Show completed tasks').props.accessibilityState
    ).toEqual({ selected: false });
  });

  it('invokes onSelect with the tapped key', () => {
    const onSelect = jest.fn<void, [TaskKey]>();
    const { getByLabelText } = render(
      <SegmentedFilterBar
        options={TASK_OPTIONS}
        selected="all"
        onSelect={onSelect}
      />
    );
    fireEvent.press(getByLabelText('Show completed tasks'));
    expect(onSelect).toHaveBeenCalledWith('completed');
  });

  it('exposes the tablist accessibility role on the container', () => {
    const { getByRole } = render(
      <SegmentedFilterBar
        options={TASK_OPTIONS}
        selected="all"
        onSelect={jest.fn()}
      />
    );
    expect(getByRole('tablist')).toBeTruthy();
  });

  // Re-running the same expectations against the Habits filter shape
  // proves the component is genuinely generic over the key union — not
  // accidentally hard-coded to the Tasks alphabet.
  describe('with a different filter shape (habits)', () => {
    it('renders all habit segments', () => {
      const { getByText } = render(
        <SegmentedFilterBar
          options={HABIT_OPTIONS}
          selected="all"
          onSelect={jest.fn()}
        />
      );
      expect(getByText('All')).toBeTruthy();
      expect(getByText('To do')).toBeTruthy();
      expect(getByText('Done')).toBeTruthy();
    });

    it('reports the right accessibility labels and selected state', () => {
      const { getByLabelText } = render(
        <SegmentedFilterBar
          options={HABIT_OPTIONS}
          selected="pending"
          onSelect={jest.fn()}
        />
      );
      expect(
        getByLabelText('Show pending habits').props.accessibilityState
      ).toEqual({ selected: true });
      expect(
        getByLabelText("Show today's habits").props.accessibilityState
      ).toEqual({ selected: false });
    });

    it('passes the habit filter key on press', () => {
      const onSelect = jest.fn<void, [HabitKey]>();
      const { getByLabelText } = render(
        <SegmentedFilterBar
          options={HABIT_OPTIONS}
          selected="all"
          onSelect={onSelect}
        />
      );
      fireEvent.press(getByLabelText('Show completed habits'));
      expect(onSelect).toHaveBeenCalledWith('done');
    });
  });
});
