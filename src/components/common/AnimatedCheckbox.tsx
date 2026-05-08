import React, { useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onToggle,
  size = 26,
  color,
  disabled = false,
}) => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const checkColor = color ?? theme.colors.primary;

  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }, [checked]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (!checked) haptics.success();
    else haptics.light();
    scale.value = withSequence(
      withSpring(0.8, { damping: 15 }),
      withSpring(1.1, { damping: 12 }),
      withSpring(1, { damping: 15 })
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
      [theme.colors.border, checkColor]
    ),
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <Animated.View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, circleStyle, containerStyle]}>
        {checked && (
          <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12">
            <Path
              d="M2 6 L5 9 L10 3"
              stroke="white"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
