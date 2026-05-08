import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RootNavigator } from '../RootNavigator';

const mockState: { profile: any } = { profile: { onboardingComplete: false } };

jest.mock('../../store', () => ({
  useAppStore: (selector: any) => (selector ? selector(mockState) : mockState),
}));

jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      primary: '#007AFF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      success: '#34C759',
      primaryContainer: '#E3F2FD',
      error: '#FF3B30',
    },
    text: {
      h2: {},
      bodySmall: {},
      labelMedium: {},
      bodyMedium: {},
    },
    mode: 'dark',
    colorScheme: 'dark',
  }),
}));

const mockHaptics = { warning: jest.fn(), light: jest.fn() };
jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
  };
});

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const ReactImpl = require('react');
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ReactImpl.forwardRef(
      ({ children, onReady, onStateChange }: any, ref: any) => {
        ReactImpl.useImperativeHandle(ref, () => ({
          navigate: mockNavigate,
          getCurrentRoute: () => ({ name: 'Home' }),
        }));
        ReactImpl.useEffect(() => {
          onReady?.();
          onStateChange?.();
        }, []);
        return ReactImpl.createElement(ReactImpl.Fragment, null, children);
      }
    ),
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ component: Component }: any) => <Component />,
  }),
}));

jest.mock('../../screens/onboarding/OnboardingScreen', () => ({
  OnboardingScreen: () => {
    const { Text } = require('react-native');
    return <Text>onboarding-stub</Text>;
  },
}));

jest.mock('../TabNavigator', () => ({
  TabNavigator: () => {
    const { Text } = require('react-native');
    return <Text>tabs-stub</Text>;
  },
}));

jest.mock('../../screens/debug/DebugScreen', () => ({
  DebugScreen: () => {
    const { Text } = require('react-native');
    return <Text>debug-stub</Text>;
  },
}));

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.profile = { onboardingComplete: false };
  });

  it('renders the onboarding stack when onboarding is incomplete', () => {
    const { getByText } = render(<RootNavigator />);
    expect(getByText('onboarding-stub')).toBeTruthy();
  });

  it('renders the main tab navigator when onboarding is complete', () => {
    mockState.profile = { onboardingComplete: true };
    const { getByText } = render(<RootNavigator />);
    expect(getByText('tabs-stub')).toBeTruthy();
  });

  it('renders without an existing profile', () => {
    mockState.profile = null;
    const { getByText } = render(<RootNavigator />);
    expect(getByText('onboarding-stub')).toBeTruthy();
  });

  it('shows the screen-name badge in dev mode', () => {
    const { getByTestId, getByText } = render(<RootNavigator />);
    expect(getByTestId('screen-name-badge')).toBeTruthy();
    expect(getByText(/Home/)).toBeTruthy();
  });

  it('opens the Debug screen when the screen-name badge is long-pressed', () => {
    const { getByTestId } = render(<RootNavigator />);
    fireEvent(getByTestId('screen-name-badge'), 'longPress');
    expect(mockHaptics.warning).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Debug');
  });

  it('does not navigate on a normal short press of the badge', () => {
    const { getByTestId } = render(<RootNavigator />);
    fireEvent.press(getByTestId('screen-name-badge'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
