import { createHabitsSlice } from '../habitsSlice';

jest.mock('../../../utils/notifications', () => ({
  scheduleHabitReminder: jest.fn().mockResolvedValue('notif_id'),
  cancelNotification: jest.fn(),
}));

describe('habitsSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const state = {
      habits: [],
      settings: { notificationsEnabled: true },
    };

    set = jest.fn((fn) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, updates);
    });

    get = jest.fn(() => state);

    slice = createHabitsSlice(set, get, {} as any);
    Object.assign(state, slice);
  });

  it('should add a habit with reminder', async () => {
    const habitId = slice.addHabit({
      title: 'Exercise',
      emoji: '💪',
      category: 'health',
      frequency: 'daily',
      color: '#FF0000',
      reminderTime: '08:00',
    });

    expect(habitId).toBeDefined();
    expect(set).toHaveBeenCalled();

    await Promise.resolve(); // Flush promises
    expect(set).toHaveBeenCalled();
  });

  it('should calculate streak with breaks', () => {
    const { getTodayStr } = require('../../../utils/dateUtils');
    const todayStr = getTodayStr();
    const mockHabit = {
      id: 'habit_1',
      title: 'Exercise',
      completions: [{ date: todayStr }, { date: '2026-05-06' }], // Break on 2026-05-07
      longestStreak: 0,
    };
    const state = get();
    state.habits = [mockHabit];

    slice.recalculateStreak('habit_1');
    expect(set).toHaveBeenCalled();
  });

  it('should complete a habit', () => {
    const mockHabit1 = {
      id: 'habit_1',
      title: 'Exercise',
      completions: [],
      xpPerCompletion: 20,
      longestStreak: 0,
    };
    const mockHabit2 = {
      id: 'habit_2',
      title: 'Read',
      completions: [],
      xpPerCompletion: 10,
      longestStreak: 0,
    };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    const xp = slice.completeHabit('habit_1');
    expect(xp).toBe(20);
    expect(set).toHaveBeenCalled();
  });

  it('should update a habit', () => {
    const mockHabit1 = { id: 'habit_1', title: 'Exercise', completions: [] };
    const mockHabit2 = { id: 'habit_2', title: 'Read', completions: [] };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    slice.updateHabit('habit_1', { title: 'Updated Exercise' });
    expect(set).toHaveBeenCalled();
  });

  it('should reschedule notification if reminderTime changes', async () => {
    const mockHabit1 = { id: 'habit_1', title: 'Exercise', notificationId: 'notif_1', emoji: '💪' };
    const mockHabit2 = { id: 'habit_2', title: 'Read', notificationId: 'notif_2', emoji: '📚' };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    const { cancelNotification, scheduleHabitReminder } = require('../../../utils/notifications');

    slice.updateHabit('habit_1', { reminderTime: '08:00' });

    expect(cancelNotification).toHaveBeenCalledWith('notif_1');
    expect(scheduleHabitReminder).toHaveBeenCalled();

    await Promise.resolve(); // Flush promises
    expect(set).toHaveBeenCalled();
  });

  it('should delete a habit', () => {
    const mockHabit = { id: 'habit_1', title: 'Exercise', notificationId: 'notif_1' };
    get.mockReturnValue({ habits: [mockHabit] });

    slice.deleteHabit('habit_1');
    expect(set).toHaveBeenCalled();
  });

  it('should archive a habit', () => {
    const mockHabit1 = { id: 'habit_1', title: 'Exercise', notificationId: 'notif_1' };
    const mockHabit2 = { id: 'habit_2', title: 'Read', notificationId: 'notif_2' };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    slice.archiveHabit('habit_1');
    expect(set).toHaveBeenCalled();
  });

  it('should uncomplete a habit', () => {
    const { getTodayStr } = require('../../../utils/dateUtils');
    const todayStr = getTodayStr();
    const mockHabit1 = {
      id: 'habit_1',
      title: 'Exercise',
      completions: [{ date: todayStr }, { date: '2026-05-07' }],
    };
    const mockHabit2 = { id: 'habit_2', title: 'Read', completions: [] };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    slice.uncompleteHabit('habit_1');
    expect(set).toHaveBeenCalled();
  });

  it('should get today habits with different frequencies', () => {
    const state = get();
    const today = new Date().getDay();
    state.habits = [
      { id: '1', title: 'Daily', frequency: 'daily', archived: false },
      { id: '2', title: 'Weekdays', frequency: 'weekdays', archived: false },
      { id: '3', title: 'Weekends', frequency: 'weekends', archived: false },
      { id: '4', title: 'Custom', frequency: 'custom', customDays: [today], archived: false },
      { id: '5', title: 'Invalid', frequency: 'monthly' as any, archived: false },
    ];

    const todaysHabits = slice.getTodaysHabits();
    expect(todaysHabits.length).toBeGreaterThan(0);
  });

  it('should get habit by id', () => {
    const mockHabit = { id: 'habit_1', title: 'Exercise' };
    get.mockReturnValue({ habits: [mockHabit] });

    const habit = slice.getHabitById('habit_1');
    expect(habit).toEqual(mockHabit);
  });

  it('should recalculate streak', () => {
    const mockHabit1 = { id: 'habit_1', title: 'Exercise', completions: [], longestStreak: 0 };
    const mockHabit2 = { id: 'habit_2', title: 'Read', completions: [], longestStreak: 0 };
    const state = get();
    state.habits = [mockHabit1, mockHabit2];

    slice.recalculateStreak('habit_1');
    expect(set).toHaveBeenCalled();
  });

  it('should check if habit is completed today', () => {
    const mockHabit = { id: 'habit_1', title: 'Exercise', completions: [] };
    get.mockReturnValue({ habits: [mockHabit] });

    expect(slice.isHabitCompletedToday('habit_1')).toBe(false);
  });

  it('returns 0 when completing a missing or already-completed habit', () => {
    const { getTodayStr } = require('../../../utils/dateUtils');
    const todayStr = getTodayStr();
    const state = get();
    state.habits = [
      { id: 'habit_1', completions: [{ date: todayStr }], xpPerCompletion: 20, longestStreak: 0 },
    ];
    expect(slice.completeHabit('habit_1')).toBe(0);
    expect(slice.completeHabit('missing')).toBe(0);
  });

  it('returns false from isHabitCompletedToday for missing habit', () => {
    const state = get();
    state.habits = [];
    expect(slice.isHabitCompletedToday('missing')).toBe(false);
  });

  it('does nothing in recalculateStreak when habit is missing', () => {
    const state = get();
    state.habits = [];
    set.mockClear();
    slice.recalculateStreak('missing');
    expect(set).not.toHaveBeenCalled();
  });

  it('cancels a scheduled notification when deleting a habit', () => {
    const { cancelNotification } = require('../../../utils/notifications');
    const state = get();
    state.habits = [{ id: 'habit_1', notificationId: 'notif_1' }];
    cancelNotification.mockClear();
    slice.deleteHabit('habit_1');
    expect(cancelNotification).toHaveBeenCalledWith('notif_1');
  });

  it('does not cancel notification when archiving a habit without one', () => {
    const { cancelNotification } = require('../../../utils/notifications');
    const state = get();
    state.habits = [{ id: 'habit_1' }];
    cancelNotification.mockClear();
    slice.archiveHabit('habit_1');
    expect(cancelNotification).not.toHaveBeenCalled();
  });

  it('does not schedule notifications when disabled', () => {
    const { scheduleHabitReminder } = require('../../../utils/notifications');
    const state = get();
    state.settings = { notificationsEnabled: false };
    scheduleHabitReminder.mockClear();
    slice.addHabit({
      title: 'Run',
      emoji: '🏃',
      category: 'movement',
      frequency: 'daily',
      color: '#FF0000',
      reminderTime: '07:00',
    });
    expect(scheduleHabitReminder).not.toHaveBeenCalled();
  });

  it('uncomplete handles non-matching habits gracefully', () => {
    const state = get();
    state.habits = [
      { id: 'habit_1', completions: [{ date: 'today' }] },
      { id: 'habit_2', completions: [] },
    ];
    slice.uncompleteHabit('habit_2');
    expect(state.habits[0].completions.length).toBe(1);
  });

  it('returns zero streak when first completion is too old', () => {
    const state = get();
    state.habits = [
      {
        id: 'habit_1',
        completions: [{ date: '2020-01-01' }],
        longestStreak: 0,
      },
    ];
    slice.recalculateStreak('habit_1');
    expect(state.habits[0].streak).toBe(0);
  });
});
