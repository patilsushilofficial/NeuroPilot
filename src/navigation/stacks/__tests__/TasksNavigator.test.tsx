import React from 'react';
import { render } from '@testing-library/react-native';
import { TasksNavigator } from '../TasksNavigator';
import { NavigationContainer } from '@react-navigation/native';

import { View } from 'react-native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/tasks/TasksScreen', () => ({
  TasksScreen: () => <View />,
}));

jest.mock('../../../screens/tasks/AddTaskScreen', () => ({
  AddTaskScreen: () => <View />,
}));

describe('TasksNavigator', () => {
  it('renders correctly', () => {
    const { toJSON } = render(
      <NavigationContainer>
        <TasksNavigator />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});
