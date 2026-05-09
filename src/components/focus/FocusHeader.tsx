import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths } from '../../theme/tokens';
import { formatFocusTime } from '../../utils/dateUtils';

interface FocusHeaderProps {
  isRunning: boolean;
  isActive: boolean;
  todayFocusMinutes: number;
  sessionsCount: number;
}

export const FocusHeader: React.FC<FocusHeaderProps> = ({
  isRunning,
  isActive,
  todayFocusMinutes,
  sessionsCount,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Card variant="glass" elevated style={styles.heroCard}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[theme.text.h2, styles.title]}>Focus</Text>
          <Text style={[theme.text.bodySmall, styles.subtitle]}>
            One task. One timer. Clear mind.
          </Text>
        </View>
        <Badge label={isRunning ? 'Live' : isActive ? 'Paused' : 'Ready'} variant="secondary" />
      </View>
      <View style={styles.heroDivider} />
      <View style={styles.statsGrid}>
        <View style={styles.statsTile}>
          <Text style={[theme.text.labelSmall, styles.statsLabel]}>TODAY</Text>
          <Text style={[theme.text.h4, styles.statsValue]}>{formatFocusTime(todayFocusMinutes)}</Text>
          <Text style={[theme.text.bodySmall, styles.statsMeta]}>Focused Time</Text>
        </View>
        <View style={styles.statsTile}>
          <Text style={[theme.text.labelSmall, styles.statsLabel]}>SESSIONS</Text>
          <Text style={[theme.text.h4, styles.statsValue]}>{sessionsCount}</Text>
          <Text style={[theme.text.bodySmall, styles.statsMeta]}>Completed Today</Text>
        </View>
      </View>
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    heroCard: {
      borderRadius: borderRadius['2xl'],
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerCopy: { gap: spacing['3xs'], flex: 1 },
    title: { color: theme.colors.textPrimary },
    subtitle: { color: theme.colors.textSecondary },
    heroDivider: {
      height: borderWidths.hairline,
      backgroundColor: theme.colors.border,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    statsTile: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      gap: spacing['3xs'],
    },
    statsLabel: { color: theme.colors.textTertiary },
    statsValue: { color: theme.colors.textPrimary },
    statsMeta: { color: theme.colors.textSecondary },
  });
