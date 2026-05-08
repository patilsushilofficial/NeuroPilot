import { useCallback, useEffect } from 'react';
import {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useHaptics } from './useHaptics';
import { durations, springs } from '../theme/tokens';

interface UseAnimatedCheckboxArgs {
  /** Current checked state. Drives the colour interpolation. */
  checked: boolean;
  /** User-supplied toggle handler. Called only when not disabled. */
  onToggle: () => void;
  /** Disabled state — short-circuits the press handler. */
  disabled: boolean;
  /** Resting border colour of the unchecked checkbox. */
  uncheckedBorderColor: string;
  /** Fill/border colour of the checked checkbox. */
  checkColor: string;
}

/**
 * Encapsulates every animated value, effect, and gesture handler used by
 * the `AnimatedCheckbox` component. Returns the two animated styles, the
 * press handler, and pre-shaped values so the component itself stays a
 * pure presentation surface.
 */
export const useAnimatedCheckbox = ({
  checked,
  onToggle,
  disabled,
  uncheckedBorderColor,
  checkColor,
}: UseAnimatedCheckboxArgs) => {
  const haptics = useHaptics();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: durations.fast,
      easing: Easing.out(Easing.quad),
    });
  }, [checked]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (!checked) haptics.success();
    else haptics.light();
    scale.value = withSequence(
      withSpring(0.8, springs.gentle),
      withSpring(1.1, springs.snappy),
      withSpring(1, springs.gentle)
    );
    onToggle();
  }, [checked, disabled, onToggle, haptics]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgProgress = useDerivedValue(() => progress.value);

  const circleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ['transparent', checkColor]
    ),
    borderColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      [uncheckedBorderColor, checkColor]
    ),
  }));

  return { containerStyle, circleStyle, handlePress };
};
