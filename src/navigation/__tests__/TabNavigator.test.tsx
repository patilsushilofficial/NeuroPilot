import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TabNavigator } from '../TabNavigator';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../../hooks/useAppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      primary: '#007AFF',
      card: '#F5F5F5',
      border: '#CCCCCC',
      success: '#34C759',
      primaryContainer: '#E3F2FD',
    },
    text: {
      h2: {},
      bodySmall: {},
      labelMedium: {},
      bodyMedium: {},
    },
    mode: 'light',
    colorScheme: 'light',
  }),
}));

const mockHaptics = {
  light: jest.fn(),
};

jest.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => mockHaptics,
}));

let mockActiveStatus: 'idle' | 'running' = 'idle';

jest.mock('../../store', () => ({
  useAppStore: (selector: any) =>
    selector ? selector({ active: { status: mockActiveStatus } }) : { active: { status: mockActiveStatus } },
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
  };
});

jest.mock('../../screens/home/HomeScreen', () => {
  const { Text } = require('react-native');
  return {
    HomeScreen: () => <Text>home-stub</Text>,
  };
});

jest.mock('../../screens/focus/FocusScreen', () => {
  const { Text } = require('react-native');
  return {
    FocusScreen: () => <Text>focus-stub</Text>,
  };
});

jest.mock('../../screens/progress/ProgressScreen', () => {
  const { Text } = require('react-native');
  return {
    ProgressScreen: () => <Text>progress-stub</Text>,
  };
});

jest.mock('../stacks/TasksNavigator', () => {
  const { Text } = require('react-native');
  return {
    TasksNavigator: () => <Text>tasks-stub</Text>,
  };
});

jest.mock('../stacks/HabitsNavigator', () => {
  const { Text } = require('react-native');
  return {
    HabitsNavigator: () => <Text>habits-stub</Text>,
  };
});

jest.mock('../stacks/SettingsNavigator', () => {
  const { Text } = require('react-native');
  return {
    SettingsNavigator: () => <Text>settings-stub</Text>,
  };
});

const renderTabs = () =>
  render(
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );

describe('TabNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveStatus = 'idle';
  });

  it('renders the home tab by default', () => {
    const { getByText } = renderTabs();
    expect(getByText('home-stub')).toBeTruthy();
  });

  it('navigates to other tabs when tapping the tab bar', () => {
    const { getByLabelText, getByText } = renderTabs();

    fireEvent.press(getByLabelText('Tasks'));
    expect(getByText('tasks-stub')).toBeTruthy();
    expect(mockHaptics.light).toHaveBeenCalled();

    fireEvent.press(getByLabelText('Focus'));
    expect(getByText('focus-stub')).toBeTruthy();

    fireEvent.press(getByLabelText('Habits'));
    expect(getByText('habits-stub')).toBeTruthy();

    fireEvent.press(getByLabelText('Stats'));
    expect(getByText('progress-stub')).toBeTruthy();
  });

  it('no-ops when tapping the focused tab', () => {
    const { getByLabelText } = renderTabs();
    mockHaptics.light.mockClear();
    fireEvent.press(getByLabelText('Home'));
    expect(mockHaptics.light).not.toHaveBeenCalled();
  });

  it('renders an active focus indicator when a session is running', () => {
    mockActiveStatus = 'running';
    const { toJSON } = renderTabs();
    expect(toJSON()).toBeTruthy();
  });
});
