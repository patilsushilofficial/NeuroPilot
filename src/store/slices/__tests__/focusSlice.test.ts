import { createFocusSlice } from '../focusSlice';

jest.mock('../../../utils/notifications', () => ({
  triggerImmediateFocusAlert: jest.fn().mockResolvedValue('notif_id'),
}));

describe('focusSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const state = {
      active: {
        sessionId: 'session_1',
        status: 'running',
        secondsRemaining: 10,
        phase: 'focus',
        presetId: 'pomodoro',
      },
      focusSessions: [],
      settings: { notificationsEnabled: true },
    };
    
    set = jest.fn((fn) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, updates || fn);
    });
    
    get = jest.fn(() => state);
    
    slice = createFocusSlice(set, get, {} as any);
  });

  it('should tick a second', () => {
    slice.tickSecond();
    expect(set).toHaveBeenCalled();
  });  it('should toggle shield', () => {
    slice.toggleShield(true);
    expect(get().shieldActive).toBe(true);
  });

  it('should start focus', () => {
    slice.startFocus('classic');
    const state = get();
    expect(state.active.status).toBe('running');
    expect(state.active.phase).toBe('focus');
    expect(state.active.presetId).toBe('classic');
    expect(state.focusSessions.length).toBe(1);
  });

  it('should pause focus', () => {
    slice.pauseFocus();
    expect(get().active.status).toBe('paused');
  });

  it('should resume focus', () => {
    const state = get();
    state.active.status = 'paused';
    slice.resumeFocus();
    expect(state.active.status).toBe('running');
  });

  it('should skip phase', () => {
    const state = get();
    state.active.phase = 'focus';
    state.active.presetId = 'classic';
    slice.skipPhase();
    expect(state.active.phase).toBe('short_break');
    expect(state.active.status).toBe('paused');
  });

  it('should abandon focus', () => {
    const state = get();
    state.active.sessionId = 'session_1';
    state.focusSessions = [{ id: 'session_1', status: 'running' }];
    slice.abandonFocus();
    expect(state.focusSessions[0].status).toBe('abandoned');
    expect(state.active.sessionId).toBeNull();
  });

  it('should get total focus minutes', () => {
    const state = get();
    state.focusSessions = [
      { id: '1', totalFocusMinutes: 10 },
      { id: '2', totalFocusMinutes: 20 },
    ];
    expect(slice.getTotalFocusMinutes()).toBe(30);
  });

  it('should get sessions today', () => {
    const state = get();
    const today = Date.now();
    const yesterday = today - 24 * 60 * 60 * 1000;
    state.focusSessions = [
      { id: '1', startedAt: today },
      { id: '2', startedAt: yesterday },
    ];
    expect(slice.getSessionsToday().length).toBe(1);
  });

  it('should transition to short break when focus completes', () => {
    const state = get();
    state.active.secondsRemaining = 1;
    state.active.phase = 'focus';
    state.active.completedPomodoros = 0;
    state.active.presetId = 'classic';
    state.focusSessions = [{ id: 'session_1', completedPomodoros: 0, totalFocusMinutes: 0, xpEarned: 0 }];

    slice.tickSecond();

    expect(state.active.phase).toBe('short_break');
    expect(state.active.secondsRemaining).toBe(5 * 60); // Classic short break is 5 mins
    expect(state.active.completedPomodoros).toBe(1);
    expect(state.focusSessions[0].completedPomodoros).toBe(1);
    expect(state.focusSessions[0].xpEarned).toBeGreaterThan(0);
  });

  it('should transition to focus when break completes', () => {
    const state = get();
    state.active.secondsRemaining = 1;
    state.active.phase = 'short_break';
    state.active.presetId = 'classic';

    slice.tickSecond();

    expect(state.active.phase).toBe('focus');
    expect(state.active.secondsRemaining).toBe(25 * 60); // Classic focus is 25 mins
  });

  it('should transition to long break after enough pomodoros', () => {
    const state = get();
    state.active.secondsRemaining = 1;
    state.active.phase = 'focus';
    state.active.completedPomodoros = 3; // After this tick, 4th pomodoro -> long break
    state.active.presetId = 'classic';
    state.focusSessions = [
      { id: 'session_1', completedPomodoros: 3, totalFocusMinutes: 75, xpEarned: 0 },
    ];

    slice.tickSecond();

    expect(state.active.phase).toBe('long_break');
    expect(state.active.secondsRemaining).toBe(15 * 60); // Classic long break
    expect(state.active.completedPomodoros).toBe(4);
  });

  it('skips back from break to focus when phase is not focus', () => {
    const state = get();
    state.active.phase = 'short_break';
    state.active.presetId = 'classic';
    slice.skipPhase();
    expect(state.active.phase).toBe('focus');
    expect(state.active.secondsRemaining).toBe(25 * 60);
  });

  it('does nothing in tickSecond when status is not running', () => {
    const state = get();
    state.active.status = 'idle';
    state.active.sessionId = null;
    state.active.secondsRemaining = 5;
    const xp = slice.tickSecond();
    expect(xp).toBe(0);
  });

  it('does nothing in abandonFocus when no session is active', () => {
    const state = get();
    state.active.sessionId = null;
    state.focusSessions = [];
    slice.abandonFocus();
    expect(state.focusSessions).toEqual([]);
  });

  it('does not trigger notification when settings.notificationsEnabled is false', () => {
    const state = get();
    state.settings = { notificationsEnabled: false };
    state.active.secondsRemaining = 1;
    state.active.phase = 'focus';
    state.active.completedPomodoros = 0;
    state.active.presetId = 'classic';
    state.focusSessions = [{ id: 'session_1', completedPomodoros: 0, totalFocusMinutes: 0, xpEarned: 0 }];
    const { triggerImmediateFocusAlert } = require('../../../utils/notifications');
    triggerImmediateFocusAlert.mockClear();
    slice.tickSecond();
    expect(triggerImmediateFocusAlert).not.toHaveBeenCalled();
  });

  it('starts focus with default preset and undefined task id', () => {
    slice.startFocus();
    const state = get();
    expect(state.active.presetId).toBe('classic');
    expect(state.active.currentTaskId).toBeNull();
  });
});
