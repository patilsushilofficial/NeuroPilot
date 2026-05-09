import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';

import { Icon, IconName } from '../common/Icon';

const PRIMARY_ICON_WRAP_SIZE = controlSizes.buttonHeight.md;
/** Translucent white tint for the icon halo on the primary CTA. Sized to
 *  read clearly against `theme.colors.primary` across all four palettes. */
const PRIMARY_ICON_WRAP_TINT = 'rgba(255, 255, 255, 0.18)';

interface QuickActionsGridProps {
  onStartFocus: () => void;
  onAddTask: () => void;
  onViewHabits: () => void;
  onViewProgress: () => void;
}

interface SecondaryTile {
  label: string;
  icon: IconName;
  onPress: () => void;
}

/**
 * Tiered Quick Actions:
 *  - Primary CTA (Start Focus) gets a full-width emphasis treatment so the
 *    most habit-forming action is visually unmistakeable.
 *  - Two equal-weight secondary tiles cover the next-likeliest verbs.
 *  - View Progress is a tertiary text affordance that doesn't compete for
 *    attention with the other two tiers.
 */
export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onStartFocus,
  onAddTask,
  onViewHabits,
  onViewProgress,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const secondary: SecondaryTile[] = [
    { label: 'Add Task', icon: 'plus-square', onPress: onAddTask },
    { label: 'My Habits', icon: 'repeat', onPress: onViewHabits },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onStartFocus}
        style={styles.primaryTile}
        activeOpacity={0.85}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Start Focus"
      >
        <View style={styles.primaryIconWrap}>
          <Icon
            name="target"
            size={iconSizes.xl}
            color={theme.colors.textOnPrimary}
          />
        </View>
        <View style={styles.primaryBody}>
          <Text style={[theme.text.h4, styles.primaryTitle]}>Start Focus</Text>
          <Text style={[theme.text.bodySmall, styles.primarySubtitle]}>
            Pick a preset and dive in
          </Text>
        </View>
        <Icon
          name="arrow-right"
          size={iconSizes.lg}
          color={theme.colors.textOnPrimary}
        />
      </TouchableOpacity>

      <View style={styles.secondaryRow}>
        {secondary.map((tile) => (
          <TouchableOpacity
            key={tile.label}
            onPress={tile.onPress}
            style={styles.secondaryTile}
            activeOpacity={0.85}
            accessible
            accessibilityRole="button"
            accessibilityLabel={tile.label}
          >
            <Icon
              name={tile.icon}
              size={iconSizes.lg}
              color={theme.colors.primary}
            />
            <Text style={[theme.text.labelMedium, styles.secondaryLabel]}>
              {tile.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={onViewProgress}
        style={styles.tertiary}
        activeOpacity={0.7}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Progress"
      >
        <Icon
          name="trending-up"
          size={iconSizes.md}
          color={theme.colors.textSecondary}
        />
        <Text style={[theme.text.labelMedium, styles.tertiaryLabel]}>
          See your progress
        </Text>
        <Icon
          name="chevron-right"
          size={iconSizes.md}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
    },
    primaryTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.colors.primary,
      ...shadows.md,
    },
    primaryIconWrap: {
      width: PRIMARY_ICON_WRAP_SIZE,
      height: PRIMARY_ICON_WRAP_SIZE,
      borderRadius: PRIMARY_ICON_WRAP_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: PRIMARY_ICON_WRAP_TINT,
    },
    primaryBody: {
      flex: 1,
    },
    primaryTitle: {
      color: theme.colors.textOnPrimary,
      fontWeight: fontWeights.bold,
    },
    primarySubtitle: {
      color: theme.colors.textOnPrimary,
      opacity: 0.85,
      marginTop: spacing['3xs'],
    },
    secondaryRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    secondaryTile: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.colors.card,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
    },
    secondaryLabel: {
      color: theme.colors.textPrimary,
    },
    tertiary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
    },
    tertiaryLabel: {
      flex: 1,
      color: theme.colors.textSecondary,
    },
  });
