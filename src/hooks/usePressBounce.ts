import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { springs } from '../theme/tokens';

interface PressBounceConfig {
  /** Scale at the trough of the bounce (e.g. 0.93 — slight squish). */
  pressScale?: number;
  /** Scale at the peak of the bounce (e.g. 1.05 — slight overshoot). */
  peakScale?: number;
}

const DEFAULT_PRESS_SCALE = 0.93;
const DEFAULT_PEAK_SCALE = 1.05;

/**
 * Reusable squish-then-overshoot bounce used by completion-style buttons
 * (habit cards, etc.). Returns the animated style and a `bounce()` trigger
 * that can be invoked from any press handler.
 */
export const usePressBounce = (config: PressBounceConfig = {}) => {
  const pressScale = config.pressScale ?? DEFAULT_PRESS_SCALE;
  const peakScale = config.peakScale ?? DEFAULT_PEAK_SCALE;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bounce = () => {
    scale.value = withSequence(
      withSpring(pressScale, springs.gentle),
      withSpring(peakScale, springs.snappy),
      withSpring(1, springs.gentle)
    );
  };

  return { animatedStyle, bounce };
};
