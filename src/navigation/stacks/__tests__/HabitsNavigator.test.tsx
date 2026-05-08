import React from 'react';
import { render } from '@testing-library/react-native';
import { HabitsNavigator } from '../HabitsNavigator';
import { NavigationContainer } from '@react-navigation/native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/habits/HabitsScreen', () => ({
  HabitsScreen: () => <mock-habits-screen />,
}));

jest.mock('../../../screens/habits/AddHabitScreen', () => ({
  AddHabitScreen: () => <mock-add-habit-screen />,
}));

describe('HabitsNavigator', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <HabitsNavigator />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});
