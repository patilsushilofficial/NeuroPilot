import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../types';
import { TasksScreen } from '../../screens/tasks/TasksScreen';
import { AddTaskScreen } from '../../screens/tasks/AddTaskScreen';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export const TasksNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TasksList" component={TasksScreen} />
    <Stack.Screen
      name="AddTask"
      component={AddTaskScreen}
      options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);
