import React, { useCallback, useMemo } from 'react';
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
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { Theme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { borderWidths, opacity, springs } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';

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
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.standard);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.standard);
  }, []);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    haptics.light();
    onPress();
  }, [disabled, loading, onPress, haptics]);

  const containerStyle = [
    styles.container,
    styles[CONTAINER_SIZE_KEYS[size]],
    styles[CONTAINER_VARIANT_KEYS[variant]],
    disabled && styles[CONTAINER_DISABLED_KEYS[variant]],
    fullWidth ? styles.containerFullWidth : styles.containerShrink,
    disabled && styles.containerDisabled,
  ];

  const labelStyle = [
    styles.label,
    styles[LABEL_SIZE_KEYS[size]],
    disabled
      ? styles[LABEL_DISABLED_KEYS[variant]]
      : styles[LABEL_VARIANT_KEYS[variant]],
  ];

  const indicatorColor =
    variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary
      : theme.colors.textOnPrimary;

  return (
    <AnimatedTouchable
      style={[containerStyle, animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={opacity.hover}
      disabled={disabled || loading}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </AnimatedTouchable>
  );
};

/**
 * Lookup tables — one entry per variant or size — that resolve the
 * StyleSheet key to apply. Pre-computed so consumers never have to do
 * `styles[`variant_${x}`]`-style template-literal access, which makes
 * static analysis and grepping easier.
 */
const CONTAINER_SIZE_KEYS: Record<ButtonSize, ContainerSizeKey> = {
  sm: 'containerSm',
  md: 'containerMd',
  lg: 'containerLg',
};

const CONTAINER_VARIANT_KEYS: Record<ButtonVariant, ContainerVariantKey> = {
  primary: 'containerPrimary',
  secondary: 'containerSecondary',
  outline: 'containerOutline',
  ghost: 'containerGhost',
  danger: 'containerDanger',
};

const CONTAINER_DISABLED_KEYS: Record<ButtonVariant, ContainerDisabledKey> = {
  primary: 'containerDisabledPrimary',
  secondary: 'containerDisabledSecondary',
  outline: 'containerDisabledOutline',
  ghost: 'containerDisabledGhost',
  danger: 'containerDisabledDanger',
};

const LABEL_SIZE_KEYS: Record<ButtonSize, LabelSizeKey> = {
  sm: 'labelSm',
  md: 'labelMd',
  lg: 'labelLg',
};

const LABEL_VARIANT_KEYS: Record<ButtonVariant, LabelVariantKey> = {
  primary: 'labelPrimary',
  secondary: 'labelSecondary',
  outline: 'labelOutline',
  ghost: 'labelGhost',
  danger: 'labelDanger',
};

const LABEL_DISABLED_KEYS: Record<ButtonVariant, LabelDisabledKey> = {
  primary: 'labelDisabledPrimary',
  secondary: 'labelDisabledSecondary',
  outline: 'labelDisabledOutline',
  ghost: 'labelDisabledGhost',
  danger: 'labelDisabledDanger',
};

type ContainerSizeKey = 'containerSm' | 'containerMd' | 'containerLg';
type ContainerVariantKey =
  | 'containerPrimary'
  | 'containerSecondary'
  | 'containerOutline'
  | 'containerGhost'
  | 'containerDanger';
type ContainerDisabledKey =
  | 'containerDisabledPrimary'
  | 'containerDisabledSecondary'
  | 'containerDisabledOutline'
  | 'containerDisabledGhost'
  | 'containerDisabledDanger';
type LabelSizeKey = 'labelSm' | 'labelMd' | 'labelLg';
type LabelVariantKey =
  | 'labelPrimary'
  | 'labelSecondary'
  | 'labelOutline'
  | 'labelGhost'
  | 'labelDanger';
type LabelDisabledKey =
  | 'labelDisabledPrimary'
  | 'labelDisabledSecondary'
  | 'labelDisabledOutline'
  | 'labelDisabledGhost'
  | 'labelDisabledDanger';

const makeStyles = (theme: Theme) => {
  const { colors } = theme;

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerFullWidth: { alignSelf: 'stretch' },
    containerShrink: { alignSelf: 'flex-start' },
    containerDisabled: { opacity: opacity.ghost },

    containerSm: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing['2xs'],
      borderRadius: borderRadius.md,
    },
    containerMd: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
    },
    containerLg: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.xl,
    },

    containerPrimary: { backgroundColor: colors.primary },
    containerSecondary: { backgroundColor: colors.secondary },
    containerOutline: {
      backgroundColor: 'transparent',
      borderWidth: borderWidths.base,
      borderColor: colors.primary,
    },
    containerGhost: { backgroundColor: 'transparent' },
    containerDanger: { backgroundColor: colors.error },

    containerDisabledPrimary: { backgroundColor: colors.textDisabled },
    containerDisabledSecondary: { backgroundColor: colors.textDisabled },
    containerDisabledOutline: { borderColor: colors.textDisabled },
    containerDisabledGhost: {},
    containerDisabledDanger: { backgroundColor: colors.textDisabled },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconLeft: { marginRight: spacing.xs },
    iconRight: { marginLeft: spacing.xs },

    label: { fontWeight: fontWeights.semibold },
    labelSm: { fontSize: fontSizes.sm },
    labelMd: { fontSize: fontSizes.base },
    labelLg: { fontSize: fontSizes.md },

    labelPrimary: { color: colors.textOnPrimary },
    labelSecondary: { color: colors.textOnPrimary },
    labelOutline: { color: colors.primary },
    labelGhost: { color: colors.primary },
    labelDanger: { color: colors.textOnPrimary },

    labelDisabledPrimary: { color: colors.textOnPrimary },
    labelDisabledSecondary: { color: colors.textOnPrimary },
    labelDisabledOutline: { color: colors.textDisabled },
    labelDisabledGhost: { color: colors.textDisabled },
    labelDisabledDanger: { color: colors.textOnPrimary },
  });
};
