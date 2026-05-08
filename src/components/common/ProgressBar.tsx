import React, { useEffect, useMemo } from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { borderRadius } from '../../theme/spacing';
import { durations } from '../../theme/tokens';
import { moderateScale } from '../../utils/responsive';

interface ProgressBarProps {
  progress: number; // 0.0 to 1.0
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  rounded?: boolean;
  striped?: boolean;
}

const DEFAULT_HEIGHT = moderateScale(8);

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  backgroundColor,
  height = DEFAULT_HEIGHT,
  style,
  animated = true,
  rounded = true,
}) => {
  const theme = useAppTheme();
  const barColor = color ?? theme.colors.primary;
  const bgColor = backgroundColor ?? theme.colors.border;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(clampedProgress);

  useEffect(() => {
    if (animated) {
      width.value = withTiming(clampedProgress, {
        duration: durations.slower,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      width.value = clampedProgress;
    }
  }, [clampedProgress, animated]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  // Track and fill have to be themed/dynamic (size/color), so they're memoized
  // per render rather than living in a stylesheet — the stylesheet only owns
  // the genuinely static keys.
  const trackStyle = useMemo<ViewStyle>(
    () => ({
      height,
      backgroundColor: bgColor,
      borderRadius: rounded ? borderRadius.full : 0,
    }),
    [height, bgColor, rounded]
  );

  const fillStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: barColor,
      borderRadius: rounded ? borderRadius.full : 0,
    }),
    [barColor, rounded]
  );

  return (
    <View
      style={[styles.track, trackStyle, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
    >
      <Animated.View style={[styles.fill, fillStyle, animatedFill]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
