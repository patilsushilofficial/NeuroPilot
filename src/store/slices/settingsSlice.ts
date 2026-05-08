import { StateCreator } from 'zustand';
import { AppSettings, UserMode, UserProfile, ThemePreference } from '../../types';

export interface SettingsSlice {
  settings: AppSettings;
  profile: UserProfile | null;
  lastActiveDate: string | null; // YYYY-MM-DD

  updateSettings: (updates: Partial<AppSettings>) => void;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLastActiveDate: (date: string) => void;
  toggleTheme: () => void;
  toggleHaptics: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  soundProfile: 'minimal',
  hapticsEnabled: true,
  notificationsEnabled: true,
  focusReminderInterval: 25,
  dailyReviewTime: '09:00',
  showMotivationalQuotes: true,
  reducedMotion: false,
  userMode: 'adult',
};

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  settings: defaultSettings,
  profile: null,
  lastActiveDate: null,

  updateSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, ...updates } }));
  },

  setProfile: (profile) => {
    set({ profile });
  },

  updateProfile: (updates) => {
    set((s) => ({
      profile: s.profile ? { ...s.profile, ...updates } : null,
    }));
  },

  setLastActiveDate: (date) => {
    set({ lastActiveDate: date });
  },

  toggleTheme: () => {
    set((s) => ({
      settings: {
        ...s.settings,
        theme: s.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  },

  toggleHaptics: () => {
    set((s) => ({
      settings: {
        ...s.settings,
        hapticsEnabled: !s.settings.hapticsEnabled,
      },
    }));
  },
});
