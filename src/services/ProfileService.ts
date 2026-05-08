import { UserMode, UserProfile } from '../types';
import { DEFAULT_AVATAR } from '../constants/profile';

/**
 * Domain helpers for `UserProfile` records. The UI layer should never
 * construct profile entities directly: it should always go through this
 * service so id/timestamp generation and defaulting stays consistent.
 */

export interface CreateProfileInput {
  name: string;
  mode: UserMode;
  avatar?: string;
}

const generateProfileId = () =>
  `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

class ProfileService {
  /**
   * Build a brand-new `UserProfile` ready to persist. Trims and defaults
   * the user-provided name, fills in `id`, `createdAt`, and marks the
   * profile as having completed onboarding.
   */
  create(input: CreateProfileInput): UserProfile {
    return {
      id: generateProfileId(),
      name: input.name.trim() || 'Pilot',
      mode: input.mode,
      avatar: input.avatar ?? DEFAULT_AVATAR,
      createdAt: Date.now(),
      onboardingComplete: true,
    };
  }
}

export const profileService = new ProfileService();
