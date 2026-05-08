import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { usePressBounce } from '../../hooks/usePressBounce';
import { MiniCalendar } from './MiniCalendar';
import { Habit } from '../../types';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  borderWidths,
  iconSizes,
  opacity as opacityTokens,
} from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

const EMOJI_CIRCLE_SIZE = moderateScale(48);

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggle: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompletedToday,
  onToggle,
  onLongPress,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const haptics = useHaptics();
  const { animatedStyle, bounce } = usePressBounce();

  const handleToggle = useCallback(() => {
    bounce();
    if (!isCompletedToday) haptics.success();
    else haptics.light();
    onToggle(habit.id);
  }, [isCompletedToday, habit.id, onToggle, haptics, bounce]);

  const cardActiveStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: habit.color + '22',
      borderColor: habit.color + '55',
    }),
    [habit.color]
  );
  const emojiCircleActive = useMemo<ViewStyle>(
    () => ({
      backgroundColor: habit.color,
      borderColor: habit.color,
    }),
    [habit.color]
  );
  const doneLabelStyle = useMemo<TextStyle>(() => ({ color: habit.color }), [habit.color]);

  const completionDates = useMemo(
    () => habit.completions.map((c) => c.date),
    [habit.completions]
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          isCompletedToday ? cardActiveStyle : styles.cardInactive,
        ]}
        onPress={handleToggle}
        onLongPress={() => onLongPress?.(habit.id)}
        activeOpacity={opacityTokens.hover}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompletedToday }}
        accessibilityLabel={`${habit.title}. ${isCompletedToday ? 'Completed' : 'Not completed'} today`}
      >
        <View style={styles.row}>
          <View style={styles.emojiWrapper}>
            <View
              style={[
                styles.emojiCircle,
                isCompletedToday ? emojiCircleActive : styles.emojiCircleInactive,
              ]}
            >
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[theme.text.bodyMedium, styles.title]}
                numberOfLines={1}
              >
                {habit.title}
              </Text>
              {isCompletedToday && (
                <Text style={[styles.doneLabel, doneLabelStyle]}>Done ✓</Text>
              )}
            </View>

            <MiniCalendar completions={completionDates} color={habit.color} />

            <View style={styles.statsRow}>
              {habit.streak > 0 && (
                <Text style={styles.streakText}>🔥 {habit.streak} day streak</Text>
              )}
              <Text style={styles.xpText}>+{habit.xpPerCompletion} XP</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: borderRadius.xl,
      padding: spacing.sm,
      borderWidth: borderWidths.thin,
      marginBottom: spacing.xs,
    },
    cardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    emojiWrapper: {
      flexShrink: 0,
    },
    emojiCircle: {
      width: EMOJI_CIRCLE_SIZE,
      height: EMOJI_CIRCLE_SIZE,
      borderRadius: EMOJI_CIRCLE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: borderWidths.thick,
    },
    emojiCircleInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    emoji: {
      fontSize: iconSizes.xl,
    },
    content: {
      flex: 1,
      gap: spacing['3xs'],
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.textPrimary,
      fontWeight: fontWeights.semibold,
      flex: 1,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    streakText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: theme.colors.streakFire,
    },
    xpText: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      color: theme.colors.primary,
    },
    doneLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
  });
