import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import {
  fontSizes,
  fontWeights,
  letterSpacings,
} from '../../theme/typography';

export type SectionAccent = 'error' | 'primary' | 'success';

interface ListSectionHeaderProps {
  title: string;
  count: number;
  /** Tints both the leading dot and the count chip. */
  accent: SectionAccent;
}

/**
 * Header for a generic `SectionList` group. A coloured leading dot
 * makes the group's nature scannable at a glance (red = overdue or
 * urgent, primary = to-do, success = completed) and the trailing
 * count chip lets users see "how big is this pile" without parsing
 * the list.
 *
 * Pure presentation — title / count / accent come from the screen's
 * view-model. Used by both the Tasks and Habits screens; the visual
 * vocabulary stays identical so users only learn the pattern once.
 */
export const ListSectionHeader: React.FC<ListSectionHeaderProps> = ({
  title,
  count,
  accent,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const accentColor = ACCENT_TO_COLOR_KEY[accent];
  const tint = theme.colors[accentColor];

  return (
    <View style={styles.row}>
      <View style={styles.titleGroup}>
        <View style={[styles.dot, { backgroundColor: tint }]} />
        <Text style={[theme.text.labelLarge, styles.title]}>{title}</Text>
      </View>
      <View
        style={[styles.countChip, { backgroundColor: theme.colors[CHIP_BG_KEY[accent]] }]}
      >
        <Text style={[styles.countText, { color: tint }]}>{count}</Text>
      </View>
    </View>
  );
};

/** Lookup so the rendering code never has to template-string-interpolate
 *  a theme key — keeps the IconName-style autocomplete-everywhere rule. */
const ACCENT_TO_COLOR_KEY: Record<SectionAccent, 'error' | 'primary' | 'success'> = {
  error: 'error',
  primary: 'primary',
  success: 'success',
};

const CHIP_BG_KEY: Record<SectionAccent, 'errorContainer' | 'primaryContainer' | 'successContainer'> = {
  error: 'errorContainer',
  primary: 'primaryContainer',
  success: 'successContainer',
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
    },
    titleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    dot: {
      width: spacing.xs,
      height: spacing.xs,
      borderRadius: spacing.xs / 2,
    },
    title: {
      color: theme.colors.textPrimary,
    },
    countChip: {
      minWidth: spacing.lg,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing['3xs'],
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacings.wide,
    },
  });
