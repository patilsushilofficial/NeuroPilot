import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { TabBarItem } from '../TabBarItem';
import type { TabItem } from '../../constants/tabBar';

jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#7B6CF6',
      primaryContainer: 'rgba(123, 108, 246, 0.12)',
      cardElevated: '#FFFFFF',
      textSecondary: '#666666',
      textTertiary: '#999999',
    },
  }),
}));

const HOME_ITEM: TabItem = { name: 'Home', label: 'Home', icon: 'home' };
const FOCUS_ITEM: TabItem = { name: 'Focus', label: 'Focus', icon: 'target' };

describe('TabBarItem', () => {
  it('exposes the label as accessible name and tab role', () => {
    const { getByLabelText } = render(
      <TabBarItem item={HOME_ITEM} focused={false} onPress={jest.fn()} />
    );
    const button = getByLabelText('Home');
    expect(button.props.accessibilityRole).toBe('tab');
  });

  it('reports selected state via accessibilityState when focused', () => {
    const { getByLabelText } = render(
      <TabBarItem item={HOME_ITEM} focused onPress={jest.fn()} />
    );
    expect(getByLabelText('Home').props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('reports unselected state when not focused', () => {
    const { getByLabelText } = render(
      <TabBarItem item={HOME_ITEM} focused={false} onPress={jest.fn()} />
    );
    expect(getByLabelText('Home').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('invokes onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <TabBarItem item={HOME_ITEM} focused={false} onPress={onPress} />
    );
    fireEvent.press(getByLabelText('Home'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the running indicator when the prop is set', () => {
    // The dot itself is decorative (no accessible name) — snapshot the tree
    // with and without the cue and assert they differ in node count.
    const without = render(
      <TabBarItem item={FOCUS_ITEM} focused onPress={jest.fn()} />
    ).toJSON();
    const withCue = render(
      <TabBarItem
        item={FOCUS_ITEM}
        focused
        onPress={jest.fn()}
        showRunningIndicator
      />
    ).toJSON();

    // `JSON.stringify` length is a coarse but sufficient signal that the
    // running indicator subtree is being rendered in addition to the icon.
    expect(JSON.stringify(withCue).length).toBeGreaterThan(
      JSON.stringify(without).length
    );
  });
});
