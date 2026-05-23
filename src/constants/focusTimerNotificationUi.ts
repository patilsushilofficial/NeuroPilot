import { FOCUS_PHASE_EMOJIS, FOCUS_PHASE_LABELS } from './focus';
import { getPresetById } from './focusPresets';
import { FOCUS_TIMER_CHANNEL_ID } from './focusTimerNotification';
import { ActiveFocusState } from '../types';
import { Theme } from '../theme';
import { formatTimerDisplay } from '../utils/dateUtils';
import { computeRunningEndsAt, getEffectiveSecondsRemaining } from '../utils/focusTimerClock';

export interface FocusTimerNotificationDisplayModel {
  channelId: string;
  title: string;
  phaseEmoji: string;
  statusIcon: string;
  statusLabel: string;
  pausedTimeText: string;
  progressLabel: string;
  primaryActionLabel: string;
  stopActionLabel: string;
  endsAtMs: number;
  isRunning: boolean;
  totalSeconds: number;
  secondsRemaining: number;
  filledSegments: number;
  pillBackground: string;
  iconTileBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  primaryButton: string;
  stopButton: string;
  progressFilled: string;
  progressEmpty: string;
  iconOnButton: string;
}

/** Four quartile segments — fills at 25%, 50%, 75%, and 100% elapsed. */
export const computeFilledSegments = (totalSeconds: number, secondsRemaining: number): number => {
  const total = Math.max(totalSeconds, 1);
  const remaining = Math.min(Math.max(secondsRemaining, 0), total);
  const elapsed = total - remaining;
  return Math.min(4, Math.floor((elapsed * 4) / total));
};

const computeFilledSegmentsFromActive = (active: ActiveFocusState, now: number): number =>
  computeFilledSegments(active.totalSeconds, getEffectiveSecondsRemaining(active, now));

export const buildFocusTimerNotificationDisplayModel = (
  active: ActiveFocusState,
  theme: Theme,
  now = Date.now()
): FocusTimerNotificationDisplayModel => {
  const preset = getPresetById(active.presetId);
  const phaseEmoji = FOCUS_PHASE_EMOJIS[active.phase];
  const phaseLabel = FOCUS_PHASE_LABELS[active.phase];
  const isRunning = active.status === 'running';
  const secondsRemaining = getEffectiveSecondsRemaining(active, now);
  const endsAt = active.runningEndsAt ?? computeRunningEndsAt(secondsRemaining, now);

  return {
    channelId: FOCUS_TIMER_CHANNEL_ID,
    title: preset.name,
    phaseEmoji,
    statusIcon: phaseEmoji,
    statusLabel: isRunning ? 'Time remaining' : `Paused · ${phaseLabel}`,
    pausedTimeText: formatTimerDisplay(secondsRemaining),
    progressLabel: formatTimerDisplay(active.totalSeconds),
    primaryActionLabel: isRunning ? 'Pause' : 'Resume',
    stopActionLabel: 'Stop',
    endsAtMs: endsAt,
    isRunning,
    totalSeconds: active.totalSeconds,
    secondsRemaining,
    filledSegments: computeFilledSegmentsFromActive(active, now),
    pillBackground: '#000000',
    iconTileBackground: theme.colors.cardElevated,
    textPrimary: theme.colors.textPrimary,
    textSecondary: theme.colors.textSecondary,
    accent: theme.colors.focusTimer,
    primaryButton: theme.colors.primary,
    stopButton: theme.colors.error,
    progressFilled: theme.colors.focusTimer,
    progressEmpty: theme.colors.border,
    iconOnButton: theme.colors.textOnPrimary,
  };
};
