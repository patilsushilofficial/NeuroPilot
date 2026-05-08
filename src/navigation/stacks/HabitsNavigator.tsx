import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HabitsStackParamList } from '../types';
import { HabitsScreen } from '../../screens/habits/HabitsScreen';
import { AddHabitScreen } from '../../screens/habits/AddHabitScreen';

const Stack = createNativeStackNavigator<HabitsStackParamList>();

export const HabitsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HabitsList" component={HabitsScreen} />
    <Stack.Screen
      name="AddHabit"
      component={AddHabitScreen}
      options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);
