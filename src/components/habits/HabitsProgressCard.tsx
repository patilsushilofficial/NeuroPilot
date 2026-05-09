import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { ProgressBar } from '../common/ProgressBar';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { iconSizes } from '../../theme/tokens';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  letterSpacings,
} from '../../theme/typography';

interface HabitsProgressCardProps {
  /** Number of completed habits today. */
  completedCount: number;
  /** Total habits scheduled for today. */
  totalCount: number;
  /** 0..1 ratio used to drive the progress bar fill. */
  completionRate: number;
  /** When `true` the card swaps in a celebratory perfect-day strip. */
  isPerfectDay: boolean;
}

/**
 * Daily-progress headline for the Habits screen. Pure presentation:
 * the screen passes already-derived counts and ratios from
 * `useHabitsScreen`. The card itself wraps a percentage display, the
 * progress bar, and (when applicable) a perfect-day banner so the
 * "how am I doing today" answer is on a single visual surface.
 */
export const HabitsProgressCard: React.FC<HabitsProgressCardProps> = ({
  completedCount,
  totalCount,
  completionRate,
  isPerfectDay,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const percent = Math.round(completionRate * 100);

  return (
    <Card>
      <View style={styles.headRow}>
        <View style={styles.titleGroup}>
          <Text style={[theme.text.labelSmall, styles.eyebrow]}>
            DAILY PROGRESS
          </Text>
          <View style={styles.countRow}>
            <Text
              style={styles.percentNumber}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {percent}
            </Text>
            <Text style={styles.percentSuffix}>%</Text>
          </View>
        </View>

        <View style={styles.metaGroup}>
          <Text style={[theme.text.bodySmall, styles.metaText]}>
            <Text style={styles.metaValue}>{completedCount}</Text>
            <Text> / {totalCount} done</Text>
          </Text>
        </View>
      </View>

      <ProgressBar
        progress={completionRate}
        color={isPerfectDay ? theme.colors.success : theme.colors.secondary}
        backgroundColor={theme.colors.border}
      />

      {isPerfectDay && (
        <View style={styles.celebrationRow}>
          <Icon name="award" size={iconSizes.sm} color={theme.colors.success} />
          <Text style={[theme.text.bodySmall, styles.celebrationText]}>
            Perfect day — every habit complete!
          </Text>
        </View>
      )}
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    headRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    titleGroup: {
      flexShrink: 1,
    },
    eyebrow: {
      color: theme.colors.textTertiary,
      letterSpacing: letterSpacings.wider,
      marginBottom: spacing['3xs'],
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
      gap: spacing['3xs'],
      // Reserve a hair of vertical breathing room so Lexend's bold
      // ascenders never butt against the bounding box (matches the
      // pattern used in `WeeklyActivityCard`).
      paddingVertical: spacing['3xs'],
    },
    percentNumber: {
      color: theme.colors.textPrimary,
      fontFamily: fontFamilies.bold,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      lineHeight: Math.ceil(fontSizes.xl * 1.6),
      letterSpacing: letterSpacings.tight,
      includeFontPadding: false,
    },
    percentSuffix: {
      color: theme.colors.textSecondary,
      fontFamily: fontFamilies.semibold,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.wide,
    },
    metaGroup: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    metaText: {
      color: theme.colors.textSecondary,
    },
    metaValue: {
      color: theme.colors.textPrimary,
      fontWeight: fontWeights.bold,
    },
    celebrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['2xs'],
      marginTop: spacing.sm,
    },
    celebrationText: {
      color: theme.colors.success,
      fontWeight: fontWeights.semibold,
    },
  });
