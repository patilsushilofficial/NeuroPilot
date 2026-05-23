import React from 'react';
import { render } from '@testing-library/react-native';
import { HabitsNavigator } from '../HabitsNavigator';
import { NavigationContainer } from '@react-navigation/native';

import { View } from 'react-native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/habits/HabitsScreen', () => ({
  HabitsScreen: () => <View />,
}));

jest.mock('../../../screens/habits/AddHabitScreen', () => ({
  AddHabitScreen: () => <View />,
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
