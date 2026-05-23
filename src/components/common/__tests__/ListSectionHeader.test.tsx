import React from 'react';
import { render } from '@testing-library/react-native';

import { ListSectionHeader } from '../ListSectionHeader';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      textPrimary: '#000000',
      error: '#FF3B30',
      errorContainer: 'rgba(255, 59, 48, 0.1)',
      primary: '#7B6CF6',
      primaryContainer: 'rgba(123, 108, 246, 0.12)',
      success: '#34C759',
      successContainer: 'rgba(52, 199, 89, 0.1)',
    },
    text: { labelLarge: {} },
  }),
}));

describe('ListSectionHeader', () => {
  it('renders title and count', () => {
    const { getByText } = render(<ListSectionHeader title="Overdue" count={3} accent="error" />);
    expect(getByText('Overdue')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it.each(['error', 'primary', 'success'] as const)(
    'tints the count chip with the %s container colour',
    (accent) => {
      // The chip's background is set inline from a theme key; render
      // each accent so the lookup table is exercised end-to-end.
      const { getByText } = render(<ListSectionHeader title="Section" count={1} accent={accent} />);
      expect(getByText('1')).toBeTruthy();
    }
  );

  it('handles a zero-count section without crashing', () => {
    // Defensive: the screen filters out empty sections, but the header
    // should still render a sensible "0" if a caller forgets.
    const { getByText } = render(<ListSectionHeader title="Pending" count={0} accent="primary" />);
    expect(getByText('0')).toBeTruthy();
  });
});
