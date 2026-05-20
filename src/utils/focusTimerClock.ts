import { ActiveFocusState } from '../types';

/** Wall-clock end of the current running segment (ms since epoch). */
export const computeRunningEndsAt = (secondsRemaining: number, now = Date.now()): number =>
  now + secondsRemaining * 1000;

/**
 * Seconds left on the timer — uses `runningEndsAt` while running so the
 * countdown stays accurate even when JS timers are throttled in background.
 */
export const getEffectiveSecondsRemaining = (
  active: ActiveFocusState,
  now = Date.now()
): number => {
  if (active.status === 'running' && active.runningEndsAt != null) {
    return Math.max(0, Math.ceil((active.runningEndsAt - now) / 1000));
  }
  return active.secondsRemaining;
};
