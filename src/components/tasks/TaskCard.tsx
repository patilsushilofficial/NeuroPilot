import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedCheckbox } from '../common/AnimatedCheckbox';
import { Badge } from '../common/Badge';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Task } from '../../types';
import { formatDueDate, getPriorityConfig } from '../../utils/dateUtils';
import { spacing, borderRadius } from '../../theme/spacing';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onPress,
  onLongPress,
}) => {
  const theme = useAppTheme();
  const priorityConfig = getPriorityConfig(task.priority);
  const isCompleted = task.status === 'completed';

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handleComplete = useCallback(() => {
    if (isCompleted) return;
    translateX.value = withSequence(
      withSpring(8, { damping: 15 }),
      withSpring(0, { damping: 12 })
    );
    setTimeout(() => onComplete(task.id), 200);
  }, [isCompleted, task.id, onComplete]);

  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  return (
    <Animated.View style={[containerStyle]}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: isCompleted ? 'transparent' : theme.colors.border,
            opacity: isCompleted ? 0.55 : 1,
          },
        ]}
        onPress={() => onPress(task.id)}
        onLongPress={() => onLongPress?.(task.id)}
        activeOpacity={0.85}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Task: ${task.title}${isCompleted ? ', completed' : ''}`}
      >
        <View style={styles.row}>
          <AnimatedCheckbox
            checked={isCompleted}
            onToggle={handleComplete}
            size={24}
            color={theme.colors[priorityConfig.colorKey]}
          />

          <View style={styles.content}>
            <Text
              style={[
                theme.text.bodyMedium,
                {
                  color: isCompleted ? theme.colors.textTertiary : theme.colors.textPrimary,
                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                  flex: 1,
                },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            <View style={styles.metaRow}>
              <Badge
                label={priorityConfig.label}
                variant={
                  task.priority === 'high'
                    ? 'error'
                    : task.priority === 'medium'
                    ? 'warning'
                    : 'secondary'
                }
                emoji={priorityConfig.emoji}
              />

              {dueInfo && (
                <Text
                  style={[
                    styles.dueText,
                    {
                      color: dueInfo.isOverdue
                        ? theme.colors.error
                        : dueInfo.isUrgent
                        ? theme.colors.warning
                        : theme.colors.textTertiary,
                      fontWeight: dueInfo.isOverdue || dueInfo.isUrgent ? '600' : '400',
                    },
                  ]}
                >
                  {dueInfo.label}
                </Text>
              )}

              {hasSubtasks && (
                <Text style={[styles.subtaskCount, { color: theme.colors.textTertiary }]}>
                  {completedSubtasks}/{task.subtasks.length} steps
                </Text>
              )}
            </View>
          </View>

          {/* XP reward indicator */}
          <Text style={[styles.xpBadge, { color: theme.colors.primary }]}>
            +{task.xpReward} XP
          </Text>
        </View>

        {/* Subtask progress bar */}
        {hasSubtasks && !isCompleted && (
          <View style={[styles.subtaskBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.subtaskFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                },
              ]}
            />
          </View>
        )}
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
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  content: {
    flex: 1,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[0.5],
    flexWrap: 'wrap',
  },
  dueText: {
    fontSize: 12,
  },
  subtaskCount: {
    fontSize: 11,
  },
  xpBadge: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  subtaskBar: {
    height: 3,
    borderRadius: 2,
    marginTop: spacing[1],
    overflow: 'hidden',
  },
  subtaskFill: {
    height: '100%',
    borderRadius: 2,
  },
});
