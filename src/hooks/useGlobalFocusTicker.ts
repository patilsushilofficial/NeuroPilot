import { useEffect, useRef } from 'react';

import { useAppStore, selectActiveFocus } from '../store';
import { getPresetById } from '../constants/focusPresets';
import { useHaptics } from './useHaptics';

const TICK_INTERVAL_MS = 1000;

/**
 * App-level ticker for the active focus session. Runs whenever the session
 * is `running`, regardless of which screen is mounted, so the timer keeps
 * counting down (and phase transitions still credit XP / fire haptics)
 * even if the user is on Home, Tasks, or Habits.
 *
 * Mount this exactly once, near the app root, alongside other global
 * effects. The Focus screen no longer owns its own interval — it just
 * reads from the store like any other consumer.
 */
export const useGlobalFocusTicker = () => {
  const haptics = useHaptics();

  const status = useAppStore((s) => selectActiveFocus(s).status);
  const presetId = useAppStore((s) => selectActiveFocus(s).presetId);
  const tickSecond = useAppStore((s) => s.tickSecond);
  const addXP = useAppStore((s) => s.addXP);
  const recordFocusMinutes = useAppStore((s) => s.recordFocusMinutes);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const isRunning = status === 'running';

    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const xp = tickSecond();
      if (xp > 0) {
        // Phase just completed — credit XP and minutes from the active preset.
        const minutesCompleted = getPresetById(presetId).focusMinutes;
        addXP(xp);
        recordFocusMinutes(minutesCompleted);
        haptics.focusComplete();
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, presetId, tickSecond, addXP, recordFocusMinutes, haptics]);
};
