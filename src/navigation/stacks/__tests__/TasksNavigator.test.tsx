import React from 'react';
import { render } from '@testing-library/react-native';
import { TasksNavigator } from '../TasksNavigator';
import { NavigationContainer } from '@react-navigation/native';

// Mock screens to avoid complex rendering
jest.mock('../../../screens/tasks/TasksScreen', () => ({
  TasksScreen: () => <mock-tasks-screen />,
}));

jest.mock('../../../screens/tasks/AddTaskScreen', () => ({
  AddTaskScreen: () => <mock-add-task-screen />,
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
