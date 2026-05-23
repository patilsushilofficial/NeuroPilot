import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { TouchableOpacity, Text } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      textPrimary: '#000',
      textSecondary: '#666',
    },
    text: {
      h3: {},
      bodyMedium: {},
    },
  }),
}));

jest.mock('../Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: jest.fn().mockImplementation(({ label, onPress }) => (
      <TouchableOpacity onPress={onPress} accessibilityRole="button">
        <Text>{label}</Text>
      </TouchableOpacity>
    )),
  };
});

describe('EmptyState', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <EmptyState emoji="🤷‍♂️" title="No Data" subtitle="Please add some data" />
    );
    expect(getByText('🤷‍♂️')).toBeTruthy();
    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('Please add some data')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const onAction = jest.fn();
    const { getByText, getByRole } = render(
      <EmptyState emoji="🤷‍♂️" title="No Data" actionLabel="Add Item" onAction={onAction} />
    );

    expect(getByText('Add Item')).toBeTruthy();
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onAction).toHaveBeenCalled();
  });
});
