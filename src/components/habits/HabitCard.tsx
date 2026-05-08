import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { Habit } from '../../types';
import { spacing, borderRadius } from '../../theme/spacing';
import { getLastNDates } from '../../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggle: (id: string) => void;
  onLongPress?: (id: string) => void;
}

/** Shows last 7 days as small dots */
const MiniCalendar: React.FC<{ completions: string[]; color: string }> = ({
  completions,
  color,
}) => {
  const theme = useAppTheme();
  const last7 = getLastNDates(7);
  const completionSet = new Set(completions);

  return (
    <View style={styles.miniCalRow}>
      {last7.map((date) => (
        <View
          key={date}
          style={[
            styles.miniDot,
            {
              backgroundColor: completionSet.has(date) ? color : theme.colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompletedToday,
  onToggle,
  onLongPress,
}) => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.93, { damping: 15 }),
      withSpring(1.05, { damping: 12 }),
      withSpring(1, { damping: 15 })
    );
    if (!isCompletedToday) haptics.success();
    else haptics.light();
    onToggle(habit.id);
  }, [isCompletedToday, habit.id, onToggle, haptics]);

  const completionDates = habit.completions.map((c) => c.date);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isCompletedToday
              ? habit.color + '22'
              : theme.colors.card,
            borderColor: isCompletedToday ? habit.color + '55' : theme.colors.border,
          },
        ]}
        onPress={handleToggle}
        onLongPress={() => onLongPress?.(habit.id)}
        activeOpacity={0.85}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompletedToday }}
        accessibilityLabel={`${habit.title}. ${isCompletedToday ? 'Completed' : 'Not completed'} today`}
      >
        <View style={styles.row}>
          {/* Emoji and completion ring */}
          <View style={styles.emojiWrapper}>
            <View
              style={[
                styles.emojiCircle,
                {
                  backgroundColor: isCompletedToday ? habit.color : theme.colors.surface,
                  borderColor: isCompletedToday ? habit.color : theme.colors.border,
                },
              ]}
            >
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  theme.text.bodyMedium,
                  {
                    color: theme.colors.textPrimary,
                    fontWeight: '600',
                    flex: 1,
                  },
                ]}
                numberOfLines={1}
              >
                {habit.title}
              </Text>
              {isCompletedToday && (
                <Text style={[styles.doneLabel, { color: habit.color }]}>Done ✓</Text>
              )}
            </View>

            <MiniCalendar completions={completionDates} color={habit.color} />

            <View style={styles.statsRow}>
              {habit.streak > 0 && (
                <Text style={[styles.streakText, { color: theme.colors.streakFire }]}>
                  🔥 {habit.streak} day streak
                </Text>
              )}
              <Text style={[styles.xpText, { color: theme.colors.primary }]}>
                +{habit.xpPerCompletion} XP
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing[1.5],
    borderWidth: 1,
    marginBottom: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  emojiWrapper: {
    flexShrink: 0,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCalRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
  },
  doneLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
