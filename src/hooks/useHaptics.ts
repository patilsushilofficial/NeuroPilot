import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useAppStore } from '../store';

/**
 * useHaptics — Centralized haptic feedback hook.
 *
 * ADHD research: haptics provide a multi-sensory anchor that grounds the user
 * in the present moment, reinforcing the dopamine loop from task completion.
 * Each event type has a distinctive pattern.
 */
export const useHaptics = () => {
  const hapticsEnabled = useAppStore((s) => s.settings.hapticsEnabled);

  /** Light tap — for UI interactions (toggle, press) */
  const light = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hapticsEnabled]);

  /** Medium impact — for selections, navigations */
  const medium = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [hapticsEnabled]);

  /** Heavy impact — for task completions, major actions */
  const heavy = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [hapticsEnabled]);

  /** Success pattern — dopamine-trigger for completing tasks/habits */
  const success = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hapticsEnabled]);

  /** Warning pattern — for overdue tasks or timer alerts */
  const warning = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [hapticsEnabled]);

  /** Error pattern — for invalid actions */
  const error = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [hapticsEnabled]);

  /** Achievement unlocked — long, rich pattern */
  const achievement = useCallback(async () => {
    if (!hapticsEnabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 150);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
  }, [hapticsEnabled]);

  /** Focus session complete */
  const focusComplete = useCallback(async () => {
    if (!hapticsEnabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);
    setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 600);
  }, [hapticsEnabled]);

  return { light, medium, heavy, success, warning, error, achievement, focusComplete };
};
