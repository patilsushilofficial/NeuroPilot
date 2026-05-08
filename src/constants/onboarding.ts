/**
 * Copy and structure for the Onboarding flow. Lives outside the screen so
 * marketing/UX edits don't require touching the rendering code.
 */

export type OnboardingStep = 'welcome' | 'mode' | 'profile' | 'ready';

/** Sequence of steps; index also drives the progress dots. */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  'welcome',
  'mode',
  'profile',
  'ready',
] as const;

export interface OnboardingFeature {
  emoji: string;
  text: string;
}

export const ONBOARDING_FEATURES: readonly OnboardingFeature[] = [
  { emoji: '⚡', text: 'Fast task capture — before thoughts vanish' },
  { emoji: '⏱️', text: 'Visual timers that make time real' },
  { emoji: '🔥', text: 'Habit streaks with dopamine rewards' },
  { emoji: '🏆', text: 'XP & achievements that celebrate YOU' },
] as const;
