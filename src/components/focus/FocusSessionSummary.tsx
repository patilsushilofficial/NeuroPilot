import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Card } from '../common/Card';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { borderWidths, iconSizes, opacity } from '../../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

export interface FocusSessionSummaryItem {
  id: string;
  label: string;
  emoji: string;
  value: string;
}

interface FocusSessionSummaryProps {
  items: readonly FocusSessionSummaryItem[];
}

const ICON_WELL = moderateScale(40);

/**
 * Read-only grid summarising the active focus preset (durations + XP).
 * Separated from `FocusScreen` so spacing, dividers, and type scale can
 * evolve without bloating the screen file.
 */
export const FocusSessionSummary: React.FC<FocusSessionSummaryProps> = ({ items }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Card variant="surface" noPadding style={styles.card}>
      <View style={styles.inner}>
        <Text style={[theme.text.labelSmall, styles.eyebrow]}>THIS PRESET</Text>
        <View style={styles.row}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.cell}>
                <View style={styles.iconWell}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.value} numberOfLines={1}>
                  {item.value}
                </Text>
                <Text style={styles.label} numberOfLines={2}>
                  {item.label.toUpperCase()}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
    },
    inner: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    eyebrow: {
      color: theme.colors.textTertiary,
      letterSpacing: letterSpacings.wider,
      marginBottom: spacing.sm,
      marginLeft: spacing['2xs'],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    divider: {
      width: borderWidths.hairline,
      alignSelf: 'stretch',
      marginVertical: spacing['2xs'],
      backgroundColor: theme.colors.border,
      opacity: opacity.hover,
    },
    cell: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      paddingHorizontal: spacing['3xs'],
      gap: spacing['2xs'],
    },
    iconWell: {
      width: ICON_WELL,
      height: ICON_WELL,
      borderRadius: ICON_WELL / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryContainer,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
    },
    emoji: {
      fontSize: iconSizes.md,
    },
    value: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.bold,
      color: theme.colors.textPrimary,
      letterSpacing: letterSpacings.tight,
    },
    label: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      color: theme.colors.primaryLight,
      letterSpacing: letterSpacings.wide,
      textAlign: 'center',
      lineHeight: fontSizes.xs * 1.35,
    },
  });
