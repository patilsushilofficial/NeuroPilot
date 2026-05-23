import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { usePressBounce } from '../../hooks/usePressBounce';
import { Icon } from '../common/Icon';
import { MiniCalendar } from './MiniCalendar';
import { Habit } from '../../types';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes, opacity as opacityTokens } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

const EMOJI_CIRCLE_SIZE = moderateScale(48);
const STATUS_DOT_SIZE = moderateScale(28);

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

  // Tinted card surface when complete — stays gentle (alpha-tinted bg)
  // so it reads as "done" without screaming. The non-left edges use
  // the same tint at slightly higher alpha for a subtle inset.
  const cardActiveStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: habit.color + '22',
      borderTopColor: habit.color + '55',
      borderRightColor: habit.color + '55',
      borderBottomColor: habit.color + '55',
    }),
    [habit.color]
  );

  // The left bar always carries the habit's tint at full strength —
  // even when not yet completed — so the colour cue is the very first
  // thing the eye lands on while scanning a list of mixed habits.
  const accentBarStyle = useMemo<ViewStyle>(
    () => ({ borderLeftColor: habit.color }),
    [habit.color]
  );

  const emojiCircleActive = useMemo<ViewStyle>(
    () => ({
      backgroundColor: habit.color,
      borderColor: habit.color,
    }),
    [habit.color]
  );
  const statusDotActiveStyle = useMemo<ViewStyle>(
    () => ({ backgroundColor: habit.color, borderColor: habit.color }),
    [habit.color]
  );
  const doneLabelStyle = useMemo<TextStyle>(() => ({ color: habit.color }), [habit.color]);

  const completionDates = useMemo(() => habit.completions.map((c) => c.date), [habit.completions]);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          accentBarStyle,
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
              <Text style={[theme.text.bodyMedium, styles.title]} numberOfLines={1}>
                {habit.title}
              </Text>
              {isCompletedToday && <Text style={[styles.doneLabel, doneLabelStyle]}>Done</Text>}
            </View>

            <MiniCalendar completions={completionDates} color={habit.color} />

            <View style={styles.statsRow}>
              {habit.streak > 0 && (
                <Text style={styles.streakText}>🔥 {habit.streak} day streak</Text>
              )}
              <Text style={styles.xpText}>+{habit.xpPerCompletion} XP</Text>
            </View>
          </View>

          {/* Trailing status indicator — non-interactive (the whole
              card already toggles), purely a visual cue so users can
              see at a glance whether they've ticked this habit off
              today. */}
          <View
            pointerEvents="none"
            style={[
              styles.statusDot,
              isCompletedToday ? statusDotActiveStyle : styles.statusDotInactive,
            ]}
          >
            {isCompletedToday && (
              <Icon name="check" size={iconSizes.md} color={theme.colors.textOnPrimary} />
            )}
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
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderWidth: borderWidths.thin,
      // Always reserve a thicker left edge for the habit-tint accent so
      // the row layout doesn't shift when toggling complete/incomplete
      // — only the rest of the border colour changes.
      borderLeftWidth: borderWidths.extraThick,
      marginBottom: spacing.xs,
    },
    cardInactive: {
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.border,
      borderRightColor: theme.colors.border,
      borderBottomColor: theme.colors.border,
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
      marginLeft: spacing.xs,
    },
    statusDot: {
      width: STATUS_DOT_SIZE,
      height: STATUS_DOT_SIZE,
      borderRadius: STATUS_DOT_SIZE / 2,
      borderWidth: borderWidths.thick,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
      flexShrink: 0,
    },
    statusDotInactive: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
  });
