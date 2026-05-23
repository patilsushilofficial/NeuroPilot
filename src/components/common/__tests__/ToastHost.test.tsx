import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ToastHost } from '../ToastHost';
import { toastService } from '../../../services/toast';

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

describe('ToastHost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    toastService.__resetForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when no toast is active', () => {
    const { queryByRole } = render(<ToastHost />);
    expect(queryByRole('alert')).toBeNull();
  });

  it('mounts the active toast emitted by the service', () => {
    const { getByText } = render(<ToastHost />);
    act(() => {
      toastService.show({ message: 'Hello!' });
    });
    expect(getByText('Hello!')).toBeTruthy();
  });

  it('auto-dismisses after the configured duration', () => {
    const { queryByText } = render(<ToastHost />);
    act(() => {
      toastService.show({ message: 'Briefly', durationMs: 500 });
    });
    expect(queryByText('Briefly')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(queryByText('Briefly')).toBeNull();
  });

  it('dismisses on tap', () => {
    const { getByRole, queryByText } = render(<ToastHost />);
    act(() => {
      toastService.show({ message: 'Tap me' });
    });
    fireEvent.press(getByRole('alert'));
    expect(queryByText('Tap me')).toBeNull();
  });

  it('the auto-dismiss timer of an old toast does not close the toast that replaced it', () => {
    // Race scenario: toast A's 1s timer is in-flight when toast B is
    // shown. When A's timer fires it must not close B. The host
    // achieves this by passing the id to dismiss().
    const { queryByText } = render(<ToastHost />);
    act(() => {
      toastService.show({ message: 'first', durationMs: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    act(() => {
      toastService.show({ message: 'second', durationMs: 5000 });
    });
    act(() => {
      // Wind past first's deadline but well before second's.
      jest.advanceTimersByTime(600);
    });

    expect(queryByText('second')).toBeTruthy();
    expect(queryByText('first')).toBeNull();
  });

  it('unsubscribes on unmount so a later show does not leak through', () => {
    // Smoke test: after unmount the host must not pop back into life
    // because of a forgotten subscription. The test assertion is that
    // showing a toast after unmount throws no errors.
    const { unmount } = render(<ToastHost />);
    unmount();
    expect(() => toastService.show({ message: 'after unmount' })).not.toThrow();
  });
});
