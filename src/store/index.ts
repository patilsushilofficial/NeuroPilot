import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { storage, zustandMMKVStorage } from '../services/storage';
import { TasksSlice, createTasksSlice, initialTasksState } from './slices/tasksSlice';
import { HabitsSlice, createHabitsSlice, initialHabitsState } from './slices/habitsSlice';
import { FocusSlice, createFocusSlice, getInitialFocusState } from './slices/focusSlice';
import {
  GamificationSlice,
  createGamificationSlice,
  initialGamificationState,
} from './slices/gamificationSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

/**
 * Storage key used by the persist middleware. Exported so the reset action
 * (and tests) can target the exact same slot in MMKV.
 */
export const STORE_NAME = 'neuropilot-store';

/**
 * Top-level reset action — wipes user-generated data while preserving
 * settings and profile (so the user does not get bounced back to onboarding).
 */
export interface RootActions {
  resetAllData: () => Promise<void>;
}

/**
 * Root store type — composition of all slices plus root-level actions.
 */
export type AppStore = TasksSlice &
  HabitsSlice &
  FocusSlice &
  GamificationSlice &
  SettingsSlice &
  RootActions;

/**
 * NeuroPilot App Store
 * Single Zustand store with MMKV persistence.
 * The `active` focus state is excluded from persistence (timer resets on restart).
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get, api) => ({
      ...createTasksSlice(set, get, api),
      ...createHabitsSlice(set, get, api),
      ...createFocusSlice(set, get, api),
      ...createGamificationSlice(set, get, api),
      ...createSettingsSlice(set, get, api),

      resetAllData: async () => {
        // 1. Reset every user-generated slice back to its initial values.
        //    Settings and profile are intentionally preserved.
        set({
          ...initialTasksState,
          ...initialHabitsState,
          ...getInitialFocusState(),
          ...initialGamificationState,
          lastActiveDate: null,
        });

        // 2. Wipe persisted storage so a hard reload doesn't rehydrate stale data.
        //    MMKV is synchronous, but we keep the async signature for callers
        //    in case the underlying storage layer ever changes.
        try {
          storage.delete(STORE_NAME);
        } catch {
          // Storage cleanup is best-effort — state has already been reset in memory.
        }
      },
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => zustandMMKVStorage),
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
