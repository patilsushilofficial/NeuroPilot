import { useCallback, useState } from 'react';

import { useAppStore } from '../store';
import { UserMode } from '../types';
import { profileService } from '../services/ProfileService';
import { DEFAULT_AVATAR } from '../constants/profile';
import { ONBOARDING_STEPS, OnboardingStep } from '../constants/onboarding';
import { useHaptics } from './useHaptics';

/**
 * Onboarding state machine. Owns the current step, the form fields gathered
 * along the way (`name`, `mode`, `avatar`), and the `finish` flow that
 * persists the entity through `profileService` + `updateSettings`.
 *
 * The screen consumes `step`, `stepIndex`, the setters, and `nextStep` /
 * `finish` — it never invents profile IDs or timestamps of its own.
 */
export const useOnboarding = () => {
  const haptics = useHaptics();
  const { setProfile, updateSettings } = useAppStore();

  const [step, setStep] = useState<OnboardingStep>(ONBOARDING_STEPS[0]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [mode, setMode] = useState<UserMode>('adult');

  const stepIndex = ONBOARDING_STEPS.indexOf(step);

  const nextStep = useCallback(() => {
    haptics.medium();
    const nextIdx = stepIndex + 1;
    if (nextIdx < ONBOARDING_STEPS.length) {
      setStep(ONBOARDING_STEPS[nextIdx]);
    }
  }, [stepIndex, haptics]);

  const previousStep = useCallback(() => {
    if (stepIndex <= 0) return;
    haptics.light();
    setStep(ONBOARDING_STEPS[stepIndex - 1]);
  }, [stepIndex, haptics]);

  const skipToProfile = useCallback(() => {
    haptics.light();
    setStep('profile');
  }, [haptics]);

  const handleSelectMode = useCallback(
    (next: UserMode) => {
      haptics.medium();
      setMode(next);
    },
    [haptics]
  );

  const handleSelectAvatar = useCallback(
    (next: string) => {
      haptics.light();
      setAvatar(next);
    },
    [haptics]
  );

  const finish = useCallback(() => {
    haptics.achievement();
    setProfile(profileService.create({ name, mode, avatar }));
    updateSettings({ userMode: mode });
  }, [name, mode, avatar, setProfile, updateSettings, haptics]);

  /** Display name with the same fallback used at persistence time, so the
   *  "ready" screen and the saved profile can never diverge. */
  const displayName = name.trim() || 'Pilot';

  return {
    step,
    stepIndex,
    name,
    avatar,
    mode,
    displayName,
    setName,
    handleSelectMode,
    handleSelectAvatar,
    nextStep,
    previousStep,
    skipToProfile,
    finish,
  };
};
