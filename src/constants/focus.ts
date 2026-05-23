import { FocusPhase } from '../types';
import { Theme } from '../theme';

/**
 * Maps every focus phase to a key on `Theme['colors']` so UI components
 * never need to hard-code the `phase === 'focus' ? primary : ...` ladder.
 */
export type FocusPhaseColorKey = 'primary' | 'secondary' | 'successContainer';

export const FOCUS_PHASE_COLOR_KEYS: Record<FocusPhase, FocusPhaseColorKey> = {
  focus: 'primary',
  short_break: 'secondary',
  long_break: 'successContainer',
};

/**
 * Resolve the themed colour for a phase. Centralising this keeps the colour
 * decision in one place — change the mapping above and every focus-phase
 * UI updates.
 */
export const getFocusPhaseColor = (phase: FocusPhase, theme: Theme): string =>
  theme.colors[FOCUS_PHASE_COLOR_KEYS[phase]];

/**
 * Static copy and labels used by the Focus screen and timer. Keeping them
 * here so a copy edit doesn't require touching React components.
 */

export const FOCUS_PHASE_LABELS: Record<FocusPhase, string> = {
  focus: 'FOCUS',
  short_break: 'SHORT BREAK',
  long_break: 'LONG BREAK',
};

export const FOCUS_PHASE_EMOJIS: Record<FocusPhase, string> = {
  focus: '🧠',
  short_break: '☕',
  long_break: '🌿',
};

/** ADHD-aware tips that change with the active focus phase. */
export const FOCUS_PHASE_TIPS: Record<FocusPhase, string> = {
  focus:
    'Remove distractions: phone face-down, notifications off. Your brain needs one input at a time.',
  short_break:
    "Move your body! A 5-minute walk resets your prefrontal cortex's attention capacity.",
  long_break: 'Long break earned! Hydrate, stretch, or do something you genuinely enjoy.',
};

export interface FocusInfoTile {
  /** Short label (shown with `labelSmall` typography, uppercased by theme). */
  label: string;
  /** Function used by the screen to compute the displayed value from the
   *  selected preset. We store the function rather than a literal so the
   *  tile reflects whichever preset is currently active. */
  emoji: string;
  /** Short identifier used to look up the value in the screen view-model. */
  id: 'focus' | 'shortBreak' | 'longBreak' | 'xp';
}

export const FOCUS_INFO_TILES: readonly FocusInfoTile[] = [
  { id: 'focus', label: 'Work', emoji: '🧠' },
  { id: 'shortBreak', label: 'Little break', emoji: '☕' },
  { id: 'longBreak', label: 'Big break', emoji: '🌿' },
  { id: 'xp', label: 'Bonus', emoji: '⚡' },
] as const;
