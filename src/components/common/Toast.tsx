import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from './Icon';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { Theme } from '../../theme';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { borderWidths, durations, iconSizes, opacity, springs, zIndex } from '../../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';
import type { ToastInstance, ToastVariant } from '../../services/toast';

interface VariantConfig {
  /** Theme color key driving the left-border accent + icon tint. */
  colorKey: 'primary' | 'success' | 'error' | 'warning' | 'textSecondary';
  /** Feather glyph rendered on the leading edge. */
  icon: IconName;
}

/**
 * One source of truth for variant → visual mapping. Adding a new variant
 * is a one-line entry here plus a new union member in `ToastVariant` —
 * the Toast renderer never branches on the variant string itself.
 */
const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  default: { colorKey: 'textSecondary', icon: 'bell' },
  info: { colorKey: 'primary', icon: 'info' },
  success: { colorKey: 'success', icon: 'check-circle' },
  warning: { colorKey: 'warning', icon: 'alert-triangle' },
  error: { colorKey: 'error', icon: 'alert-circle' },
};

interface ToastProps {
  toast: ToastInstance;
  onDismiss: () => void;
}

/**
 * Visual layer of the toast system. Pure presentation — given a
 * `ToastInstance` and a dismiss callback, it renders the bubble, plays
 * the entry animation, and fires `onDismiss` when tapped.
 *
 * The Host owns the auto-dismiss timer; the service owns the queue
 * semantics; this component owns the look and the slide-in.
 *
 * Theme integration:
 *  - Surface uses `cardElevated` so the toast sits above any card
 *    surface in either theme.
 *  - A thick left-border accent in the variant colour mirrors the
 *    cue pattern we use on TaskCard / HabitCard — users learn one
 *    visual vocabulary, not three.
 *  - Safe-area insets are added inline so the stylesheet stays a pure
 *    function of the theme.
 */
export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const variantConfig = VARIANT_CONFIG[toast.variant];
  const accent = theme.colors[variantConfig.colorKey];

  // Animate slide-in: top toasts come down from above, bottom toasts
  // ride up from below. We drive both via a single shared value so the
  // direction is purely a sign on the start position.
  const startOffset = toast.position === 'top' ? -spacing['4xl'] : spacing['4xl'];
  const offset = useSharedValue(startOffset);
  const fade = useSharedValue(0);

  useEffect(() => {
    offset.value = withSpring(0, springs.gentle);
    fade.value = withTiming(1, { duration: durations.fast });
  }, [offset, fade]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
    opacity: fade.value,
  }));

  const positionStyle = useMemo<ViewStyle>(() => {
    const insetPad =
      toast.position === 'top'
        ? { top: insets.top + spacing.sm }
        : { bottom: insets.bottom + spacing.sm };
    return {
      ...insetPad,
      left: spacing.md,
      right: spacing.md,
    };
  }, [insets.top, insets.bottom, toast.position]);

  const accentBorderStyle = useMemo<ViewStyle>(() => ({ borderLeftColor: accent }), [accent]);

  const accessibilityLabel = toast.title ? `${toast.title}: ${toast.message}` : toast.message;

  return (
    <Animated.View
      // `box-none` lets touches pass through the wrapper but still hit
      // the toast itself — keeps the rest of the screen interactive
      // while a toast is on screen.
      pointerEvents="box-none"
      style={[styles.wrapper, positionStyle, animatedStyle]}
      accessible={false}
    >
      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={opacity.hover}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Tap to dismiss"
        style={[styles.toast, accentBorderStyle]}
      >
        <Icon name={variantConfig.icon} color={accent} size={iconSizes.lg} />

        <View style={styles.body}>
          {!!toast.title && (
            <Text numberOfLines={1} style={[theme.text.labelLarge, styles.title]}>
              {toast.title}
            </Text>
          )}
          <Text numberOfLines={3} style={[theme.text.bodyMedium, styles.message]}>
            {toast.message}
          </Text>
        </View>

        <Icon name="x" color={theme.colors.textTertiary} size={iconSizes.md} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      zIndex: zIndex.toast,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.colors.cardElevated,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      // Left edge carries the variant tint — same cue language as
      // TaskCard / HabitCard. Width is reserved on the base style so
      // variants only swap the colour, never the layout.
      borderLeftWidth: borderWidths.extraThick,
      ...shadows.md,
    },
    body: {
      flex: 1,
      gap: spacing['3xs'],
    },
    title: {
      color: theme.colors.textPrimary,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacings.wide,
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: fontSizes.base,
    },
  });
