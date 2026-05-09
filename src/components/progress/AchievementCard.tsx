import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';
import { Achievement } from '../../types';

import { Badge } from '../common/Badge';

interface AchievementCardProps {
  achievement: Achievement;
}

const EMOJI_WRAP_SIZE = controlSizes.buttonHeight.md;

/**
 * Single celebratory card for an unlocked achievement. Pure presentational
 * unit — receives the domain entity, decides nothing about layout above
 * itself (the parent grid sizes the column).
 */
export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${achievement.title}: ${achievement.description}`}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{achievement.emoji}</Text>
      </View>
      <Text
        style={[theme.text.labelMedium, styles.title]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      <Text
        style={[theme.text.bodySmall, styles.description]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
      <Badge label={`+${achievement.xpReward} XP`} variant="primary" />
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: '47%',
      flexGrow: 1,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.cardElevated,
      padding: spacing.sm,
      alignItems: 'center',
      gap: spacing['2xs'],
      ...shadows.sm,
    },
    emojiWrap: {
      width: EMOJI_WRAP_SIZE,
      height: EMOJI_WRAP_SIZE,
      borderRadius: EMOJI_WRAP_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryContainer,
    },
    emoji: {
      fontSize: iconSizes.xl,
    },
    title: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    description: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
