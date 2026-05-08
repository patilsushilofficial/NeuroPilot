import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList>;
};

export type TabParamList = {
  Home: undefined;
  TasksTab: NavigatorScreenParams<TasksStackParamList>;
  Focus: undefined;
  HabitsTab: NavigatorScreenParams<HabitsStackParamList>;
  Progress: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type TasksStackParamList = {
  TasksList: undefined;
  AddTask: { taskId?: string } | undefined;
};

export type HabitsStackParamList = {
  HabitsList: undefined;
  AddHabit: { habitId?: string } | undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
};
