import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { borderRadius, spacing } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    haptics.light();
    onPress();
  }, [disabled, loading, onPress, haptics]);

  const containerStyle = getContainerStyle(variant, size, theme.colors, fullWidth, disabled);
  const labelStyle = getLabelStyle(variant, size, theme.colors, disabled);

  return (
    <AnimatedTouchable
      style={[containerStyle, animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={disabled || loading}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textOnPrimary}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </AnimatedTouchable>
  );
};

const getContainerStyle = (
  variant: ButtonVariant,
  size: ButtonSize,
  colors: ReturnType<typeof useAppTheme>['colors'],
  fullWidth: boolean,
  disabled: boolean
): ViewStyle => {
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingHorizontal: spacing[1.5], paddingVertical: spacing[0.5] + 2, borderRadius: borderRadius.md },
    md: { paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.lg },
    lg: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: borderRadius.xl },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: disabled ? colors.textDisabled : colors.primary },
    secondary: { backgroundColor: disabled ? colors.textDisabled : colors.secondary },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: disabled ? colors.textDisabled : colors.primary,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: disabled ? colors.textDisabled : colors.error },
  };

  return {
    ...sizeStyles[size],
    ...variantStyles[variant],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: disabled ? 0.6 : 1,
  };
};

const getLabelStyle = (
  variant: ButtonVariant,
  size: ButtonSize,
  colors: ReturnType<typeof useAppTheme>['colors'],
  disabled: boolean
): TextStyle => {
  const fontSizes: Record<ButtonSize, number> = { sm: 13, md: 15, lg: 17 };

  const colorMap: Record<ButtonVariant, string> = {
    primary: colors.textOnPrimary,
    secondary: colors.textOnPrimary,
    outline: disabled ? colors.textDisabled : colors.primary,
    ghost: disabled ? colors.textDisabled : colors.primary,
    danger: colors.textOnPrimary,
  };

  return {
    fontSize: fontSizes[size],
    fontWeight: '600',
    color: colorMap[variant],
  };
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
