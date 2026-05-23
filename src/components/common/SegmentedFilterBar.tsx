import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { useAppTheme } from '../../hooks/useAppTheme';
import type { Theme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { borderWidths, iconSizes, opacity } from '../../theme/tokens';

/**
 * One segment in the segmented control. Generic over `K` so screens keep
 * their own narrow filter-key union ('all' | 'today' | …) all the way
 * down to the press handler — no string-typed escape hatch.
 */
export interface SegmentedFilterOption<K extends string> {
  key: K;
  label: string;
  /** Feather glyph rendered on the leading side of the label. */
  icon: IconName;
  /**
   * Spoken label for the underlying tab button (`Show <a11y>`). Kept
   * short so screen readers don't natter on every focus change.
   */
  a11y: string;
}

interface SegmentedFilterBarProps<K extends string> {
  options: readonly SegmentedFilterOption<K>[];
  selected: K;
  onSelect: (next: K) => void;
}

/**
 * Reusable segmented filter control — pill-shaped row of icon + label
 * tabs with a primary fill on the active one.
 *
 * Pure presentation: the screen owns the active key and the press
 * handler; this component only knows how to render and dispatch. Used
 * by both Tasks and Habits so the two list screens have an identical
 * filtering UX.
 *
 * Declared as a function (not `React.FC`) because `React.FC` doesn't
 * support generic type parameters cleanly — and we want the `K` union
 * to flow through the JSX so `onSelect` is statically narrowed.
 */
export function SegmentedFilterBar<K extends string>({
  options,
  selected,
  onSelect,
}: SegmentedFilterBarProps<K>) {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container} accessible accessibilityRole="tablist">
      {options.map((tab) => {
        const isSelected = tab.key === selected;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={[styles.segment, isSelected && styles.segmentActive]}
            activeOpacity={opacity.hover}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Show ${tab.a11y}`}
          >
            <Icon
              name={tab.icon}
              size={iconSizes.sm}
              color={isSelected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
            />
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[
                theme.text.labelMedium,
                isSelected ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.full,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      padding: spacing['3xs'],
      gap: spacing['3xs'],
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing['2xs'],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
    },
    labelActive: {
      color: theme.colors.textOnPrimary,
    },
    labelInactive: {
      color: theme.colors.textSecondary,
    },
  });
