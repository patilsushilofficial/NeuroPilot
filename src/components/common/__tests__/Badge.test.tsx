import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';
import { useAppTheme } from '../../../hooks/useAppTheme';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: jest.fn().mockReturnValue({
    colors: {
      primaryContainer: '#fff',
      primaryLight: '#000',
      secondaryContainer: '#fff',
      secondaryLight: '#000',
      successContainer: '#fff',
      success: '#000',
      warningContainer: '#fff',
      warning: '#000',
      errorContainer: '#fff',
      error: '#000',
      border: '#fff',
      textSecondary: '#000',
    },
  }),
}));

describe('Badge', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Badge label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with emoji', () => {
    const { getByText } = render(<Badge label="Test Label" emoji="🚀" />);
    expect(getByText('🚀')).toBeTruthy();
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { rerender, getByText } = render(<Badge label="Success" variant="success" />);
    expect(getByText('Success')).toBeTruthy();
    
    rerender(<Badge label="Warning" variant="warning" />);
    expect(getByText('Warning')).toBeTruthy();
    
    rerender(<Badge label="Error" variant="error" />);
    expect(getByText('Error')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { rerender, getByText } = render(<Badge label="Small" size="sm" />);
    expect(getByText('Small')).toBeTruthy();
    
    rerender(<Badge label="Medium" size="md" />);
    expect(getByText('Medium')).toBeTruthy();
  });
});
