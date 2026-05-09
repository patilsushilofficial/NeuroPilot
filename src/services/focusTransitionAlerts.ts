import {
  cancelNotification,
  scheduleFocusTransitionAlert,
} from '../utils/notifications';
import type { FocusPhase } from '../types';

/**
 * Lead time, in seconds, between the heads-up notification and the
 * end of a phase. Mirrors the offset baked into
 * `scheduleFocusTransitionAlert` so we can avoid a wasted round-trip
 * for phases that are already too short for the cue to be useful.
 */
const HEADS_UP_LEAD_SECONDS = 3 * 60;

/**
 * Lifecycle owner for the "wrap up — phase ending in 3 minutes" cue.
 *
 * There is only ever **one** active focus session at a time, so the
 * service holds the current notification id in module-local state
 * instead of bloating the persisted store shape with a transient id.
 *
 * SoC layering:
 *  - `utils/notifications.ts` knows *how* to talk to expo-notifications.
 *  - This service knows *when* a heads-up is appropriate (lead-time
 *    check, mapping FocusPhase → 'focus' | 'break', cancel-before-
 *    schedule semantics).
 *  - `focusSlice` only calls `scheduleFor` / `cancel` at phase
 *    transitions — it never touches notification ids.
 *
 * The service is exposed as a singleton (`focusTransitionAlerts`) so
 * callers don't have to thread state through React or Zustand.
 */
class FocusTransitionAlerts {
  private currentId: string | null = null;

  /**
   * Schedule (or re-schedule) the heads-up for the active phase.
   * Cancels any prior alert first so callers don't have to remember
   * the order; safe to call from `startFocus` / `resumeFocus` /
   * mid-phase resumes alike.
   *
   * No-ops when there's not enough remaining time for a useful cue —
   * a 3-minute warning on a 2-minute break would arrive late.
   */
  async scheduleFor(phase: FocusPhase, secondsRemaining: number): Promise<void> {
    await this.cancel();
    if (secondsRemaining <= HEADS_UP_LEAD_SECONDS) return;

    const minutesUntil = secondsRemaining / 60;
    const alertPhase: 'focus' | 'break' =
      phase === 'focus' ? 'focus' : 'break';

    this.currentId = await scheduleFocusTransitionAlert(alertPhase, minutesUntil);
  }

  /**
   * Cancel the currently scheduled heads-up, if any. Idempotent — safe
   * to call from `pauseFocus` / `skipPhase` / `abandonFocus` /
   * `tickSecond` rollover without first checking whether anything is
   * actually scheduled.
   */
  async cancel(): Promise<void> {
    if (this.currentId === null) return;
    const idToCancel = this.currentId;
    this.currentId = null;
    await cancelNotification(idToCancel);
  }

  /**
   * Test-only escape hatch — lets the service be reset between unit
   * tests without poking at the private field. Production code should
   * never need this; mutating in-flight schedules from outside the
   * service breaks the cancel-before-schedule contract.
   */
  __resetForTests(): void {
    this.currentId = null;
  }
}

export const focusTransitionAlerts = new FocusTransitionAlerts();
