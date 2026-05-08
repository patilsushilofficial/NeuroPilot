import { StateCreator } from 'zustand';
import { ActiveFocusState, FocusPhase, FocusSession } from '../../types';
import { DEFAULT_PRESET_ID, getPresetById, XP_REWARDS } from '../../constants/focusPresets';
import { triggerImmediateFocusAlert } from '../../utils/notifications';

let sessionIdCounter = Date.now();
const newId = () => `focus_${++sessionIdCounter}_${Math.random().toString(36).slice(2, 7)}`;

export interface FocusSlice {
  // Persisted history
  focusSessions: FocusSession[];

  // Active timer state (NOT persisted — resets on app restart)
  active: ActiveFocusState;

  // Focus Shield
  shieldActive: boolean;
  toggleShield: (active: boolean) => void;

  // Timer actions
  startFocus: (presetId?: string, taskId?: string) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  tickSecond: () => number; // returns xp if session completed, else 0
  skipPhase: () => void;
  abandonFocus: () => void;

  // Queries
  getTotalFocusMinutes: () => number;
  getSessionsToday: () => FocusSession[];
}

const defaultActive = (): ActiveFocusState => {
  const preset = getPresetById(DEFAULT_PRESET_ID);
  return {
    sessionId: null,
    phase: 'focus',
    status: 'idle',
    secondsRemaining: preset.focusMinutes * 60,
    totalSeconds: preset.focusMinutes * 60,
    completedPomodoros: 0,
    currentTaskId: null,
    presetId: DEFAULT_PRESET_ID,
  };
};

export const getInitialFocusState = (): Pick<
  FocusSlice,
  'focusSessions' | 'active' | 'shieldActive'
> => ({
  focusSessions: [],
  active: defaultActive(),
  shieldActive: false,
});

export const createFocusSlice: StateCreator<FocusSlice, [], [], FocusSlice> = (set, get) => ({
  ...getInitialFocusState(),

  toggleShield: (active) => set({ shieldActive: active }),

  startFocus: (presetId = DEFAULT_PRESET_ID, taskId) => {
    const preset = getPresetById(presetId);
    const sessionId = newId();
    const totalSeconds = preset.focusMinutes * 60;

    const newSession: FocusSession = {
      id: sessionId,
      presetId,
      taskId,
      phase: 'focus',
      status: 'running',
      totalFocusMinutes: 0,
      completedPomodoros: 0,
      startedAt: Date.now(),
      xpEarned: 0,
    };

    set((s) => ({
      focusSessions: [newSession, ...s.focusSessions],
      active: {
        sessionId,
        phase: 'focus',
        status: 'running',
        secondsRemaining: totalSeconds,
        totalSeconds,
        completedPomodoros: 0,
        currentTaskId: taskId ?? null,
        presetId,
      },
    }));
  },

  pauseFocus: () => {
    set((s) => ({
      active: { ...s.active, status: 'paused' },
    }));
  },

  resumeFocus: () => {
    set((s) => ({
      active: { ...s.active, status: 'running' },
    }));
  },

  tickSecond: () => {
    const { active, focusSessions } = get();
    if (active.status !== 'running' || active.sessionId === null) return 0;

    const newSeconds = active.secondsRemaining - 1;

    if (newSeconds > 0) {
      set((s) => ({
        active: { ...s.active, secondsRemaining: newSeconds },
      }));
      return 0;
    }

    // Phase completed
    const preset = getPresetById(active.presetId);
    let xpEarned = 0;

    // Trigger notification if enabled
    const state = get() as any;
    if (state.settings?.notificationsEnabled) {
      const message = active.phase === 'focus'
        ? 'Great job! Focus session completed. Time for a break.'
        : 'Break is over. Ready to dive back in?';
      triggerImmediateFocusAlert(message);
    }

    if (active.phase === 'focus') {
      // Award XP for focus minutes
      xpEarned = preset.focusMinutes * XP_REWARDS.focusMinute;
      const newPomodoros = active.completedPomodoros + 1;

      // Determine next phase
      const isLongBreak = newPomodoros % preset.sessionsBeforeLongBreak === 0;
      const nextPhase: FocusPhase = isLongBreak ? 'long_break' : 'short_break';
      const nextSeconds = isLongBreak
        ? preset.longBreakMinutes * 60
        : preset.shortBreakMinutes * 60;

      set((s) => ({
        active: {
          ...s.active,
          phase: nextPhase,
          secondsRemaining: nextSeconds,
          totalSeconds: nextSeconds,
          completedPomodoros: newPomodoros,
          status: 'paused', // Auto-pause at phase transition
        },
        focusSessions: s.focusSessions.map((sess) =>
          sess.id === active.sessionId
            ? {
                ...sess,
                completedPomodoros: newPomodoros,
                totalFocusMinutes: sess.totalFocusMinutes + preset.focusMinutes,
                xpEarned: sess.xpEarned + xpEarned,
              }
            : sess
        ),
      }));
    } else {
      // Break ended — move to next focus
      const nextSeconds = preset.focusMinutes * 60;
      set((s) => ({
        active: {
          ...s.active,
          phase: 'focus',
          secondsRemaining: nextSeconds,
          totalSeconds: nextSeconds,
          status: 'paused',
        },
      }));
    }

    return xpEarned;
  },

  skipPhase: () => {
    const { active } = get();
    const preset = getPresetById(active.presetId);
    const nextPhase: FocusPhase = active.phase === 'focus' ? 'short_break' : 'focus';
    const nextSeconds =
      nextPhase === 'focus'
        ? preset.focusMinutes * 60
        : preset.shortBreakMinutes * 60;

    set((s) => ({
      active: {
        ...s.active,
        phase: nextPhase,
        secondsRemaining: nextSeconds,
        totalSeconds: nextSeconds,
        status: 'paused',
      },
    }));
  },

  abandonFocus: () => {
    const { active } = get();
    if (!active.sessionId) return;

    set((s) => ({
      focusSessions: s.focusSessions.map((sess) =>
        sess.id === active.sessionId
          ? { ...sess, status: 'abandoned', completedAt: Date.now() }
          : sess
      ),
      active: defaultActive(),
      shieldActive: false, // Auto-deactivate shield when session ends
    }));
  },

  getTotalFocusMinutes: () =>
    get().focusSessions.reduce((acc, s) => acc + s.totalFocusMinutes, 0),

  getSessionsToday: () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return get().focusSessions.filter(
      (s) => s.startedAt && s.startedAt >= startOfDay.getTime()
    );
  },
});
