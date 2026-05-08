import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { Text } from 'react-native';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      surface: '#fff',
      card: '#fff',
      cardElevated: '#fff',
      border: '#fff',
    },
  }),
}));

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Test Content</Text>
      </Card>
    );
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders as touchable when onPress is provided', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Card onPress={onPress}>
        <Text>Test Content</Text>
      </Card>
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = render(
      <Card variant="surface">
        <Text>Surface</Text>
      </Card>
    );
    expect(getByText('Surface')).toBeTruthy();
    
    rerender(
      <Card variant="glass">
        <Text>Glass</Text>
      </Card>
    );
    expect(getByText('Glass')).toBeTruthy();
  });

  it('renders with elevated prop', () => {
    const { getByText } = render(
      <Card elevated>
        <Text>Elevated</Text>
      </Card>
    );
    expect(getByText('Elevated')).toBeTruthy();
  });

  it('renders with noPadding prop', () => {
    const { getByText } = render(
      <Card noPadding>
        <Text>No Padding</Text>
      </Card>
    );
    expect(getByText('No Padding')).toBeTruthy();
  });
});
