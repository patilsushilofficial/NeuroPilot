import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  borderWidths,
  controlSizes,
  iconSizes,
  opacity as opacityTokens,
} from '../../theme/tokens';
import { Achievement } from '../../types';

import { Badge } from '../common/Badge';

interface LockedAchievementRowProps {
  achievement: Achievement;
}

const EMOJI_WRAP_SIZE = controlSizes.buttonHeight.md;

/**
 * Single dimmed row for an achievement the user hasn't unlocked yet.
 * Pure presentational unit — uses a flatter, lower-contrast layout
 * than `AchievementCard` so the locked list stays scannable without
 * competing with the celebratory unlocked grid.
 */
export const LockedAchievementRow: React.FC<LockedAchievementRowProps> = ({ achievement }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Locked: ${achievement.title}. ${achievement.description}`}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{achievement.emoji}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[theme.text.labelMedium, styles.title]} numberOfLines={1}>
          {achievement.title}
        </Text>
        <Text style={[theme.text.bodySmall, styles.description]} numberOfLines={2}>
          {achievement.description}
        </Text>
      </View>
      <Badge label={`+${achievement.xpReward}`} variant="neutral" />
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    emojiWrap: {
      width: EMOJI_WRAP_SIZE,
      height: EMOJI_WRAP_SIZE,
      borderRadius: EMOJI_WRAP_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
    },
    emoji: {
      fontSize: iconSizes.xl,
      opacity: opacityTokens.disabled,
    },
    textWrap: {
      flex: 1,
      gap: spacing['3xs'],
    },
    title: {
      color: theme.colors.textSecondary,
    },
    description: {
      color: theme.colors.textTertiary,
    },
  });
