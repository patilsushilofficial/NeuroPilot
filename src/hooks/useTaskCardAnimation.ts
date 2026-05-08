import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { spacing } from '../theme/spacing';
import { springs } from '../theme/tokens';

interface UseTaskCardAnimationArgs {
  /** Whether the task is already complete — when true, the press handler
   *  short-circuits (no double completions). */
  isCompleted: boolean;
  /** Domain handler invoked once the slide-out animation finishes. */
  onComplete: () => void;
}

/** ms to wait between starting the slide-out and dispatching `onComplete`,
 *  so the user actually sees the bounce before the card disappears. */
const COMPLETE_DELAY_MS = 200;

/**
 * Wraps the small bounce animation that plays when a task card is marked
 * complete, plus the deferred `onComplete` dispatch. The component file
 * stays free of `useSharedValue`, `withSequence`, and `setTimeout`.
 */
export const useTaskCardAnimation = ({
  isCompleted,
  onComplete,
}: UseTaskCardAnimationArgs) => {
  const opacityValue = useSharedValue(1);
  const translateX = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handleComplete = useCallback(() => {
    if (isCompleted) return;
    translateX.value = withSequence(
      withSpring(spacing.xs, springs.gentle),
      withSpring(0, springs.snappy)
    );
    setTimeout(onComplete, COMPLETE_DELAY_MS);
  }, [isCompleted, onComplete]);

  return { containerStyle, handleComplete };
};
