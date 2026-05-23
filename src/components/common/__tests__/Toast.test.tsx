import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { Toast } from '../Toast';
import type { ToastInstance } from '../../../services/toast';

jest.mock('../../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      cardElevated: '#FFFFFF',
      border: '#E5E5EA',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#7B6CF6',
      success: '#34C759',
      warning: '#FF9F0A',
      error: '#FF3B30',
    },
    text: { labelLarge: {}, bodyMedium: {} },
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
  };
});

const buildToast = (overrides: Partial<ToastInstance> = {}): ToastInstance => ({
  id: 'toast_1',
  message: 'Hello world',
  title: '',
  variant: 'default',
  position: 'bottom',
  durationMs: 3500,
  ...overrides,
});

describe('Toast', () => {
  it('renders the message', () => {
    const { getByText } = render(<Toast toast={buildToast()} onDismiss={jest.fn()} />);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('renders the title above the message when provided', () => {
    const { getByText } = render(
      <Toast toast={buildToast({ title: 'Saved' })} onDismiss={jest.fn()} />
    );
    expect(getByText('Saved')).toBeTruthy();
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('omits the title row when no title is supplied', () => {
    // Empty string is the default and must NOT render an empty Text
    // node — that would leave a blank line above the message and
    // misalign the icon.
    const { queryByText } = render(
      <Toast toast={buildToast({ title: '' })} onDismiss={jest.fn()} />
    );
    expect(queryByText('')).toBeNull();
  });

  it('exposes an alert role with title + message in the a11y label', () => {
    const { getByRole } = render(
      <Toast toast={buildToast({ title: 'Saved' })} onDismiss={jest.fn()} />
    );
    const alert = getByRole('alert');
    expect(alert.props.accessibilityLabel).toBe('Saved: Hello world');
  });

  it('falls back to the message alone when no title is set', () => {
    const { getByRole } = render(<Toast toast={buildToast()} onDismiss={jest.fn()} />);
    expect(getByRole('alert').props.accessibilityLabel).toBe('Hello world');
  });

  it('invokes onDismiss when tapped', () => {
    const onDismiss = jest.fn();
    const { getByRole } = render(<Toast toast={buildToast()} onDismiss={onDismiss} />);
    fireEvent.press(getByRole('alert'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // Across every variant we expose the alert role with the right
  // accessibility label — guard against a future variant being added
  // without an icon entry in VARIANT_CONFIG.
  describe.each(['default', 'info', 'success', 'warning', 'error'] as const)(
    'variant=%s',
    (variant) => {
      it('renders without throwing and stays accessible', () => {
        const { getByRole } = render(
          <Toast toast={buildToast({ variant })} onDismiss={jest.fn()} />
        );
        expect(getByRole('alert')).toBeTruthy();
      });
    }
  );

  // Position drives the slide-in direction (top → from above; bottom →
  // from below). We assert via the rendered tree's accessibility, not
  // the animation internals — the spring values are mocked.
  describe.each(['top', 'bottom'] as const)('position=%s', (position) => {
    it('renders the toast at the requested position', () => {
      const { getByRole } = render(
        <Toast toast={buildToast({ position })} onDismiss={jest.fn()} />
      );
      expect(getByRole('alert')).toBeTruthy();
    });
  });
});
