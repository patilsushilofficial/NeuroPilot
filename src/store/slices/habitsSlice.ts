import { StateCreator } from 'zustand';
import { Habit, HabitCategory, HabitFrequency, HabitCompletion } from '../../types';
import { format } from 'date-fns';
import { scheduleHabitReminder, cancelNotification } from '../../utils/notifications';
import { getTodayStr } from '../../utils/dateUtils';

let habitIdCounter = Date.now();
const newId = () => `habit_${++habitIdCounter}_${Math.random().toString(36).slice(2, 7)}`;

export interface HabitsSlice {
  habits: Habit[];

  addHabit: (
    payload: Pick<
      Habit,
      | 'title'
      | 'description'
      | 'emoji'
      | 'category'
      | 'frequency'
      | 'customDays'
      | 'reminderTime'
      | 'color'
    >
  ) => string;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  completeHabit: (id: string) => number; // returns xp earned
  uncompleteHabit: (id: string) => void;

  isHabitCompletedToday: (id: string) => boolean;
  getTodaysHabits: () => Habit[];
  getHabitById: (id: string) => Habit | undefined;
  recalculateStreak: (id: string) => void;
}

const calculateStreak = (completions: HabitCompletion[]): number => {
  if (completions.length === 0) return 0;

  const sorted = [...completions]
    .map((c) => c.date)
    .sort()
    .reverse(); // most recent first

  const todayStr = getTodayStr();
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

  // Streak must include today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let checkDate = sorted[0] === todayStr ? new Date() : new Date(Date.now() - 86400000);

  for (let i = 0; i < sorted.length; i++) {
    const expected = format(checkDate, 'yyyy-MM-dd');
    if (sorted[i] === expected) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
};

export const initialHabitsState: Pick<HabitsSlice, 'habits'> = {
  habits: [],
};

export const createHabitsSlice: StateCreator<HabitsSlice, [], [], HabitsSlice> = (set, get) => ({
  ...initialHabitsState,

  addHabit: (payload) => {
    const id = newId();
    const habit: Habit = {
      id,
      title: payload.title,
      description: payload.description,
      emoji: payload.emoji,
      category: payload.category,
      frequency: payload.frequency,
      customDays: payload.customDays,
      reminderTime: payload.reminderTime,
      streak: 0,
      longestStreak: 0,
      completions: [],
      createdAt: Date.now(),
      xpPerCompletion: 20,
      color: payload.color,
      archived: false,
    };
    set((s) => ({ habits: [...s.habits, habit] }));

    // Schedule Notification if enabled
    const state = get() as any;
    if (state.settings?.notificationsEnabled && payload.reminderTime) {
      scheduleHabitReminder(id, payload.title, payload.emoji, payload.reminderTime).then(
        (notifId) => {
          if (notifId) {
            get().updateHabit(id, { notificationId: notifId });
          }
        }
      );
    }

    return id;
  },

  updateHabit: (id, updates) => {
    const habit = get().habits.find((h) => h.id === id);
    const state = get() as any;

    // If reminder time is changing, reschedule notification
    if (updates.reminderTime && habit && state.settings?.notificationsEnabled) {
      if (habit.notificationId) {
        cancelNotification(habit.notificationId);
      }
      scheduleHabitReminder(
        id,
        updates.title || habit.title,
        updates.emoji || habit.emoji,
        updates.reminderTime
      ).then((notifId) => {
        if (notifId) {
          set((s) => ({
            habits: s.habits.map((h) => (h.id === id ? { ...h, notificationId: notifId } : h)),
          }));
        }
      });
    }

    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  },

  deleteHabit: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (habit?.notificationId) {
      cancelNotification(habit.notificationId);
    }
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }));
  },

  archiveHabit: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (habit?.notificationId) {
      cancelNotification(habit.notificationId);
    }
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, archived: true, notificationId: undefined } : h
      ),
    }));
  },

  completeHabit: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;

    const todayStr = getTodayStr();
    const alreadyDone = habit.completions.some((c) => c.date === todayStr);
    if (alreadyDone) return 0;

    const completion: HabitCompletion = {
      date: todayStr,
      completedAt: Date.now(),
    };

    const newCompletions = [...habit.completions, completion];
    const newStreak = calculateStreak(newCompletions);
    const newLongest = Math.max(habit.longestStreak, newStreak);

    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id
          ? { ...h, completions: newCompletions, streak: newStreak, longestStreak: newLongest }
          : h
      ),
    }));

    return habit.xpPerCompletion;
  },

  uncompleteHabit: (id) => {
    const todayStr = getTodayStr();
    set((s) => ({
      habits: s.habits.map((h) => {
        if (h.id !== id) return h;
        const newCompletions = h.completions.filter((c) => c.date !== todayStr);
        const newStreak = calculateStreak(newCompletions);
        return { ...h, completions: newCompletions, streak: newStreak };
      }),
    }));
  },

  isHabitCompletedToday: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return false;
    return habit.completions.some((c) => c.date === getTodayStr());
  },

  getTodaysHabits: () => {
    const dayOfWeek = new Date().getDay(); // 0=Sun
    return get().habits.filter((h) => {
      if (h.archived) return false;
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
      if (h.frequency === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
      if (h.frequency === 'custom') return h.customDays?.includes(dayOfWeek) ?? false;
      return false;
    });
  },

  getHabitById: (id) => get().habits.find((h) => h.id === id),

  recalculateStreak: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return;
    const newStreak = calculateStreak(habit.completions);
    const newLongest = Math.max(habit.longestStreak, newStreak);
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, streak: newStreak, longestStreak: newLongest } : h
      ),
    }));
  },
});
