import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { moderateScale } from '../../utils/responsive';
import { getLastNDates } from '../../utils/dateUtils';

const MINI_DOT_SIZE = moderateScale(8);

interface MiniCalendarProps {
  /** YYYY-MM-DD strings for every day on which the habit was completed. */
  completions: readonly string[];
  /** Per-habit tint used to fill completed dots. */
  color: string;
  /** Number of days to render (most recent last). Defaults to 7. */
  days?: number;
}

/**
 * Renders the trailing N days of a habit as small dots, filled with the
 * habit's tint when completed. Lifted out of `HabitCard` so the screen-row
 * stays declarative and the dot row can be reused (and tested) in
 * isolation.
 */
export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  completions,
  color,
  days = DEFAULT_DAYS,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const lastNDates = useMemo(() => getLastNDates(days), [days]);
  const completionSet = useMemo(() => new Set(completions), [completions]);
  const completedFill = useMemo<ViewStyle>(() => ({ backgroundColor: color }), [color]);

  return (
    <View style={styles.row}>
      {lastNDates.map((date) => (
        <View
          key={date}
          style={[styles.dot, completionSet.has(date) ? completedFill : styles.dotEmpty]}
        />
      ))}
    </View>
  );
};

const DEFAULT_DAYS = 7;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing['2xs'],
    },
    dot: {
      width: MINI_DOT_SIZE,
      height: MINI_DOT_SIZE,
      borderRadius: MINI_DOT_SIZE / 2,
    },
    dotEmpty: {
      backgroundColor: theme.colors.border,
    },
  });
