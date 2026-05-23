import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { controlSizes, durations, springs } from '../theme/tokens';

interface UseFocusShieldAnimationArgs {
  /** True when the shield is currently engaged (DND on). Drives the looping
   *  glow pulse and the toggle thumb position. */
  isActive: boolean;
}

/**
 * Owns every Reanimated shared value, effect, and `useAnimatedStyle` used by
 * the `FocusShield` card: the breathing glow ring, the icon press squish,
 * and the toggle-thumb travel. The component itself only consumes the
 * resulting style objects and the `pressShield` trigger.
 */
export const useFocusShieldAnimation = ({ isActive }: UseFocusShieldAnimationArgs) => {
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shieldScale = useSharedValue(1);
  const thumbTranslateX = useSharedValue(isActive ? controlSizes.toggleThumbTravel : 0);

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withTiming(1, { duration: durations.slow });
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: durations.long * 1.5,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: durations.long * 1.5,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(glowScale);
      glowScale.value = withSpring(1);
      glowOpacity.value = withTiming(0, { duration: durations.base });
    }
    thumbTranslateX.value = withTiming(isActive ? controlSizes.toggleThumbTravel : 0, {
      duration: durations.base,
    });
  }, [isActive]);

  const glowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const shieldAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));

  const thumbAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbTranslateX.value }],
  }));

  /** Trigger the squish-bounce on the shield icon. Used as a press feedback
   *  side-effect and decoupled from whatever the consumer wants to do next
   *  (typically `requestToggle()`). */
  const pressShield = () => {
    shieldScale.value = withSpring(0.9, springs.bouncy, () => {
      shieldScale.value = withSpring(1);
    });
  };

  return { glowAnimStyle, shieldAnimStyle, thumbAnimStyle, pressShield };
};
