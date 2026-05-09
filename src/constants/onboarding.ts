/**
 * Copy and structure for the Onboarding flow. Lives outside the screen so
 * marketing/UX edits don't require touching the rendering code.
 */

export type OnboardingStep = 'welcome' | 'howItWorks' | 'mode' | 'profile' | 'ready';

/** Sequence of steps; index also drives the progress dots. */
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  'welcome',
  'howItWorks',
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

export interface OnboardingQuickStartStep {
  emoji: string;
  title: string;
  description: string;
}

export const ONBOARDING_QUICK_START_STEPS: readonly OnboardingQuickStartStep[] = [
  {
    emoji: '1️⃣',
    title: 'Capture a task in seconds',
    description: 'Open Tasks and add one tiny next action whenever your brain feels overloaded.',
  },
  {
    emoji: '2️⃣',
    title: 'Run a short focus sprint',
    description: 'Use Focus timer for a 10-25 minute block to reduce overwhelm and build momentum.',
  },
  {
    emoji: '3️⃣',
    title: 'Lock in a daily habit',
    description: 'Track one repeatable habit to create consistency, even on low-energy days.',
  },
] as const;
