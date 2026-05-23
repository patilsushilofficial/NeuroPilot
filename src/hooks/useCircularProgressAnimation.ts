import { useEffect } from 'react';
import { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { dashOffsetForProgress, remainingProgress } from '../utils/svgGeometry';

interface UseCircularProgressAnimationArgs {
  /** Seconds left in the current phase. */
  secondsRemaining: number;
  /** Total seconds for the current phase. */
  totalSeconds: number;
  /** Whether the timer is actively counting down. Drives the tween duration:
   *  while running we ease over a full second to mirror real time, while
   *  paused/idle we snap to the new value with a short transition. */
  isRunning: boolean;
  /** Pre-computed circumference of the progress arc. */
  circumference: number;
}

/**
 * Owns all of the Reanimated wiring for the circular progress arc used in
 * `CircularTimer`. Returns the `animatedProps` to spread onto an
 * `Animated.Circle`; the consuming component stays free of shared values,
 * effects, and easing curves.
 */
export const useCircularProgressAnimation = ({
  secondsRemaining,
  totalSeconds,
  isRunning,
  circumference,
}: UseCircularProgressAnimationArgs) => {
  const progress = remainingProgress(secondsRemaining, totalSeconds);
  const strokeDashoffset = useSharedValue(dashOffsetForProgress(circumference, progress));

  useEffect(() => {
    strokeDashoffset.value = withTiming(dashOffsetForProgress(circumference, progress), {
      duration: isRunning ? RUNNING_DURATION_MS : IDLE_DURATION_MS,
      easing: Easing.linear,
    });
  }, [progress, isRunning, circumference]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return { animatedProps };
};

/** One second matches the real-time tick of the underlying timer. */
const RUNNING_DURATION_MS = 1000;
/** Quick settle when the timer is idle/paused or the preset changes. */
const IDLE_DURATION_MS = 300;
