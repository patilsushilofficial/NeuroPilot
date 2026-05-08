import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TasksSlice, createTasksSlice } from './slices/tasksSlice';
import { HabitsSlice, createHabitsSlice } from './slices/habitsSlice';
import { FocusSlice, createFocusSlice } from './slices/focusSlice';
import { GamificationSlice, createGamificationSlice } from './slices/gamificationSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

/**
 * Root store type — composition of all slices
 */
export type AppStore = TasksSlice & HabitsSlice & FocusSlice & GamificationSlice & SettingsSlice;

/**
 * NeuroPilot App Store
 * Single Zustand store with AsyncStorage persistence.
 * The `active` focus state is excluded from persistence (timer resets on restart).
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createTasksSlice(...args),
      ...createHabitsSlice(...args),
      ...createFocusSlice(...args),
      ...createGamificationSlice(...args),
      ...createSettingsSlice(...args),
    }),
    {
      name: 'neuropilot-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist everything EXCEPT active focus timer state
        tasks: state.tasks,
        habits: state.habits,
        focusSessions: state.focusSessions,
        stats: state.stats,
        settings: state.settings,
        profile: state.profile,
        lastActiveDate: state.lastActiveDate,
        // pendingAchievements intentionally excluded — reset on restart
      }),
    }
  )
);

// ─── Typed Selectors ──────────────────────────────────────────────────────────
// Using selector functions prevents unnecessary re-renders

export const selectTasks = (s: AppStore) => s.tasks;
export const selectHabits = (s: AppStore) => s.habits;
export const selectFocusSessions = (s: AppStore) => s.focusSessions;
export const selectActiveFocus = (s: AppStore) => s.active;
export const selectStats = (s: AppStore) => s.stats;
export const selectSettings = (s: AppStore) => s.settings;
export const selectProfile = (s: AppStore) => s.profile;
export const selectPendingAchievements = (s: AppStore) => s.pendingAchievements;

export const selectPendingTasks = (s: AppStore) => s.getPendingTasks();
export const selectTodaysTasks = (s: AppStore) => s.getTodaysTasks();
export const selectOverdueTasks = (s: AppStore) => s.getOverdueTasks();
export const selectTodaysHabits = (s: AppStore) => s.getTodaysHabits();
