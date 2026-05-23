import React, { useMemo } from 'react';
import { StyleSheet, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { controlSizes, opacity, zIndex } from '../../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';

interface FloatingActionButtonProps {
  /** Ionicons glyph name — defaults to a "+" `add`. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Button background. Defaults to `theme.colors.primary`. */
  color?: string;
  /** Tap handler. */
  onPress: () => void;
  /** Required for screen-reader users. */
  accessibilityLabel: string;
  /**
   * Optional visible text. When provided, the FAB renders as an
   * **extended FAB** — pill-shaped, with the icon and label sitting
   * side by side. Without it, the FAB stays a circle (existing
   * behaviour for callers that don't want the label).
   */
  label?: string;
  /** Optional override for the position / margins. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable bottom-right Floating Action Button. Pinned with absolute
 * positioning so it floats above any list / FlatList content.
 *
 * Two visual modes:
 *  - **Compact** (default): a circular icon button — minimal footprint.
 *  - **Extended** (when `label` is set): a pill-shaped icon + label
 *    button — more discoverable, used when the action benefits from a
 *    spelled-out CTA (e.g. an empty Tasks list).
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = 'add',
  color,
  onPress,
  accessibilityLabel,
  label,
  style,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const background = color ?? theme.colors.primary;

  const isExtended = Boolean(label);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={opacity.hover}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.fab,
        isExtended ? styles.fabExtended : styles.fabCompact,
        { backgroundColor: background },
        style,
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={controlSizes.fab * 0.5} color={theme.colors.textOnPrimary} />
        {isExtended && (
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={[styles.label, { color: theme.colors.textOnPrimary }]}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (_theme: Theme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.md,
      height: controlSizes.fab,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.overlay,
      ...shadows.md,
    },
    fabCompact: {
      width: controlSizes.fab,
      borderRadius: controlSizes.fab / 2,
    },
    fabExtended: {
      // Pill — `borderRadius.full` snaps to whatever the height is so the
      // ends are perfect half-circles regardless of label length.
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.full,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    label: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.wide,
    },
  });
