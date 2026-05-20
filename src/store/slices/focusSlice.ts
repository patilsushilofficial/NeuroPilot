import { StateCreator } from 'zustand';
import { ActiveFocusState, FocusPhase, FocusSession } from '../../types';
import { DEFAULT_PRESET_ID, getPresetById, XP_REWARDS } from '../../constants/focusPresets';
import { triggerImmediateFocusAlert } from '../../utils/notifications';
import { focusTransitionAlerts } from '../../services/focusTransitionAlerts';
import {
  computeRunningEndsAt,
  getEffectiveSecondsRemaining,
} from '../../utils/focusTimerClock';

/**
 * Schedule the "wrap up — phase ending in 3 minutes" heads-up for a
 * phase that has just become *running*. Always pre-cancels any prior
 * alert internally, so callers can fire-and-forget.
 *
 * Gated on `settings.notificationsEnabled` — a flipped-off setting
 * still triggers a `cancel()` so any heads-up scheduled before the
 * user toggled the switch is cleaned up rather than left dangling.
 */
const scheduleHeadsUp = (
  state: any,
  phase: FocusPhase,
  secondsRemaining: number
) => {
  if (state.settings?.notificationsEnabled) {
    focusTransitionAlerts.scheduleFor(phase, secondsRemaining);
  } else {
    focusTransitionAlerts.cancel();
  }
};

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
  /** Sync store timer from wall clock after returning from background. */
  reconcileFocusTimerFromClock: () => void;

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
    runningEndsAt: null,
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
        runningEndsAt: computeRunningEndsAt(totalSeconds),
      },
    }));

    scheduleHeadsUp(get(), 'focus', totalSeconds);
  },

  pauseFocus: () => {
    set((s) => {
      const secondsRemaining = getEffectiveSecondsRemaining(s.active);
      return {
        active: {
          ...s.active,
          status: 'paused',
          secondsRemaining,
          runningEndsAt: null,
        },
      };
    });
    // Pausing makes the prior heads-up's fire date meaningless.
    focusTransitionAlerts.cancel();
  },

  resumeFocus: () => {
    set((s) => ({
      active: {
        ...s.active,
        status: 'running',
        runningEndsAt: computeRunningEndsAt(s.active.secondsRemaining),
      },
    }));
    // Re-schedule based on whatever time is left, not the full preset
    // — a session resumed with 4 minutes left should still get a
    // 1-minute-out cue (if enabled).
    const { active } = get();
    scheduleHeadsUp(get(), active.phase, active.secondsRemaining);
  },

  tickSecond: () => {
    const { active, focusSessions } = get();
    if (active.status !== 'running' || active.sessionId === null) return 0;

    const newSeconds = active.secondsRemaining - 1;

    if (newSeconds > 0) {
      set((s) => ({
        active: {
          ...s.active,
          secondsRemaining: newSeconds,
          runningEndsAt: computeRunningEndsAt(newSeconds),
        },
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

    // The heads-up for *this* phase is no longer meaningful — the
    // phase already ended. The next phase auto-pauses below, so the
    // user's `resumeFocus` will schedule the cue for the new phase.
    focusTransitionAlerts.cancel();

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
          runningEndsAt: null,
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
          runningEndsAt: null,
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
        runningEndsAt: null,
      },
    }));
    // Skipping ends the current phase early — the heads-up no longer
    // applies. The next phase auto-pauses, so the user's resume will
    // schedule a fresh one.
    focusTransitionAlerts.cancel();
  },

  reconcileFocusTimerFromClock: () => {
    const { active } = get();
    if (active.status !== 'running' || active.runningEndsAt == null) return;

    let remaining = getEffectiveSecondsRemaining(active);

    while (remaining <= 0 && get().active.status === 'running') {
      get().tickSecond();
      const next = get().active;
      if (next.status !== 'running' || next.runningEndsAt == null) return;
      remaining = getEffectiveSecondsRemaining(next);
    }

    const current = get().active;
    if (current.status !== 'running') return;

    if (remaining !== current.secondsRemaining) {
      set({
        active: {
          ...current,
          secondsRemaining: remaining,
          runningEndsAt: computeRunningEndsAt(remaining),
        },
      });
    }
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
    // Session is over — clear any pending heads-up so it doesn't
    // surprise the user later.
    focusTransitionAlerts.cancel();
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
