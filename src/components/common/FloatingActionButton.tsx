import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { shadows, spacing } from '../../theme/spacing';
import { controlSizes, opacity, zIndex } from '../../theme/tokens';

interface FloatingActionButtonProps {
  /** Ionicons glyph name — defaults to a "+" `add`. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Button background. Defaults to `theme.colors.primary`. */
  color?: string;
  /** Tap handler. */
  onPress: () => void;
  /** Required for screen-reader users. */
  accessibilityLabel: string;
  /** Optional override for the position / margins. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable bottom-right Floating Action Button. Pinned with absolute
 * positioning so it floats above any list / FlatList content.
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = 'add',
  color,
  onPress,
  accessibilityLabel,
  style,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const background = color ?? theme.colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={opacity.hover}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.fab, { backgroundColor: background }, style]}
    >
      <Ionicons name={icon} size={controlSizes.fab * 0.5} color="white" />
    </TouchableOpacity>
  );
};

const makeStyles = (_theme: Theme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.md,
      width: controlSizes.fab,
      height: controlSizes.fab,
      borderRadius: controlSizes.fab / 2,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.overlay,
      ...shadows.md,
    },
  });
