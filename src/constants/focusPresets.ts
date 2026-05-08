import { FocusPreset } from '../types';

export const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: 'classic',
    name: 'Classic Pomodoro',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    icon: '🍅',
  },
  {
    id: 'deep_work',
    name: 'Deep Work',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 3,
    icon: '🏊',
  },
  {
    id: 'sprint',
    name: 'Quick Sprint',
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    sessionsBeforeLongBreak: 4,
    icon: '⚡',
  },
  {
    id: 'flow',
    name: 'Flow State',
    focusMinutes: 90,
    shortBreakMinutes: 20,
    longBreakMinutes: 30,
    sessionsBeforeLongBreak: 2,
    icon: '🌊',
  },
  {
    id: 'adhd_starter',
    name: 'ADHD Starter',
    focusMinutes: 10,
    shortBreakMinutes: 5,
    longBreakMinutes: 10,
    sessionsBeforeLongBreak: 4,
    icon: '🧠',
  },
];

export const DEFAULT_PRESET_ID = 'classic';

export const getPresetById = (id: string): FocusPreset =>
  FOCUS_PRESETS.find((p) => p.id === id) ?? FOCUS_PRESETS[0];

/** XP Calculations */
export const XP_REWARDS = {
  focusMinute: 2,           // per minute of focus
  taskComplete: {
    high: 50,
    medium: 30,
    low: 15,
  },
  habitComplete: 20,
  streakBonus: (streak: number) => Math.min(streak * 5, 100),
} as const;

/** Level thresholds — XP required to reach each level */
export const getLevelThreshold = (level: number): number =>
  Math.floor(100 * Math.pow(level, 1.5));

export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  while (getLevelThreshold(level + 1) <= xp) {
    level++;
  }
  return level;
};

export const getXPToNextLevel = (xp: number): number => {
  const level = getLevelFromXP(xp);
  return getLevelThreshold(level + 1) - xp;
};

export const getXPProgressInLevel = (xp: number): number => {
  const level = getLevelFromXP(xp);
  const currentThreshold = getLevelThreshold(level);
  const nextThreshold = getLevelThreshold(level + 1);
  return (xp - currentThreshold) / (nextThreshold - currentThreshold);
};

/** Motivational quotes (shown on home screen, fully offline) */
export const MOTIVATIONAL_QUOTES = [
  { text: "You don't have to be perfect. You just have to start.", author: 'NeuroPilot' },
  { text: 'The brain with ADHD is not broken. It is differently wired.', author: 'Research' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Progress, not perfection.', author: 'NeuroPilot' },
  { text: 'Your focus is a superpower when aimed right.', author: 'NeuroPilot' },
  { text: 'Small consistent steps beat one giant leap.', author: 'NeuroPilot' },
  { text: 'Your brain works differently — that is your edge.', author: 'NeuroPilot' },
  { text: 'Start messy. Fix as you go.', author: 'NeuroPilot' },
  { text: 'Rest is productive. Breaks are part of the plan.', author: 'NeuroPilot' },
  { text: 'External structure is a tool, not a crutch.', author: 'Dr. Russell Barkley' },
] as const;
