/**
 * NeuroPilot — Central Type Definitions
 * Single source of truth for all domain models.
 */

// ─── User / Profile ──────────────────────────────────────────────────────────

export type UserMode = 'adult' | 'child';

export interface UserProfile {
  id: string;
  name: string;
  mode: UserMode;
  avatar: string; // emoji
  createdAt: number;
  onboardingComplete: boolean;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'snoozed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: number; // Unix timestamp
  estimatedMinutes?: number;
  actualMinutes?: number;
  subtasks: SubTask[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  parentId?: string; // for sub-decomposition
  xpReward: number;
  notificationId?: string; // id of scheduled expo notification
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type HabitCategory =
  | 'health'
  | 'focus'
  | 'movement'
  | 'mindfulness'
  | 'sleep'
  | 'social'
  | 'routine'
  | 'custom';

export interface HabitCompletion {
  date: string; // YYYY-MM-DD
  completedAt: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  reminderTime?: string; // HH:MM
  streak: number;
  longestStreak: number;
  completions: HabitCompletion[];
  createdAt: number;
  xpPerCompletion: number;
  color: string; // hex
  archived: boolean;
  notificationId?: string; // id of scheduled expo notification
}

// ─── Focus Sessions ───────────────────────────────────────────────────────────

export type FocusPhase = 'focus' | 'short_break' | 'long_break';
export type FocusSessionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';

export interface FocusPreset {
  id: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  icon: string;
}

export interface FocusSession {
  id: string;
  presetId: string;
  taskId?: string;
  phase: FocusPhase;
  status: FocusSessionStatus;
  totalFocusMinutes: number;
  completedPomodoros: number;
  startedAt?: number;
  completedAt?: number;
  xpEarned: number;
}

export interface ActiveFocusState {
  sessionId: string | null;
  phase: FocusPhase;
  status: FocusSessionStatus;
  secondsRemaining: number;
  totalSeconds: number;
  completedPomodoros: number;
  currentTaskId: string | null;
  presetId: string;
  /** While `running`, wall-clock time when the current segment ends. */
  runningEndsAt: number | null;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export type AchievementCategory = 'focus' | 'tasks' | 'habits' | 'streak' | 'milestone' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  xpReward: number;
  requirement: {
    type: 'task_count' | 'habit_streak' | 'focus_minutes' | 'xp_total' | 'level' | 'special';
    value: number;
  };
  unlockedAt?: number;
  secret?: boolean;
}

export interface UserStats {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  tasksCompleted: number;
  habitsCompleted: number;
  focusMinutes: number;
  currentStreak: number;
  longestStreak: number;
  unlockedAchievements: string[];
  weeklyXP: number[]; // last 7 days
  weeklyTasks: number[]; // last 7 days
}

// ─── Settings ────────────────────────────────────────────────────────────────

export type ThemePreference = 'dark' | 'light' | 'system';
export type SoundProfile = 'none' | 'minimal' | 'full';

export interface AppSettings {
  theme: ThemePreference;
  soundProfile: SoundProfile;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  focusReminderInterval: number; // minutes
  dailyReviewTime: string; // HH:MM
  showMotivationalQuotes: boolean;
  reducedMotion: boolean;
  userMode: UserMode;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  Tasks: undefined;
  Focus: undefined;
  Habits: undefined;
  Progress: undefined;
};

export type TasksStackParamList = {
  TasksList: undefined;
  AddTask: { taskId?: string };
};

export type HabitsStackParamList = {
  HabitsList: undefined;
  AddHabit: { habitId?: string };
};

export type SettingsStackParamList = {
  SettingsList: undefined;
};
