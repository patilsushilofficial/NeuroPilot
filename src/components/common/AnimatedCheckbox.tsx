import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAnimatedCheckbox } from '../../hooks/useAnimatedCheckbox';
import { borderWidths } from '../../theme/tokens';
import { moderateScale } from '../../utils/responsive';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
}

const DEFAULT_SIZE = moderateScale(26);

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onToggle,
  size = DEFAULT_SIZE,
  color,
  disabled = false,
}) => {
  const theme = useAppTheme();
  const checkColor = color ?? theme.colors.primary;

  const { containerStyle, circleStyle, handlePress } = useAnimatedCheckbox({
    checked,
    onToggle,
    disabled,
    uncheckedBorderColor: theme.colors.border,
    checkColor,
  });

  const sizeStyle = useMemo<ViewStyle>(
    () => ({ width: size, height: size, borderRadius: size / 2 }),
    [size]
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      accessible
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <Animated.View style={[styles.circle, sizeStyle, circleStyle, containerStyle]}>
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
    borderWidth: borderWidths.thick,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
