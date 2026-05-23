import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedCheckbox } from '../common/AnimatedCheckbox';
import { Badge } from '../common/Badge';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useTaskCardAnimation } from '../../hooks/useTaskCardAnimation';
import { Task } from '../../types';
import { Theme } from '../../theme';
import { formatDueDate, getPriorityConfig } from '../../utils/dateUtils';
import { getPriorityBadgeVariant } from '../../constants/taskPriorities';
import { taskService } from '../../services/TaskService';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes, opacity as opacityTokens } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onPress, onLongPress }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const priorityConfig = getPriorityConfig(task.priority);
  const isCompleted = task.status === 'completed';

  const completeTask = useCallback(() => onComplete(task.id), [onComplete, task.id]);
  const { containerStyle, handleComplete } = useTaskCardAnimation({
    isCompleted,
    onComplete: completeTask,
  });

  const dueInfo = task.dueDate ? formatDueDate(task.dueDate) : null;
  const subtaskProgress = useMemo(
    () => taskService.getSubtaskProgress(task.subtasks),
    [task.subtasks]
  );
  const hasSubtasks = subtaskProgress.total > 0;

  const subtaskFillStyle = useMemo<ViewStyle>(
    () => ({ width: `${subtaskProgress.ratio * 100}%` }),
    [subtaskProgress.ratio]
  );

  const dueStatusStyle = dueInfo?.isOverdue
    ? styles.dueOverdue
    : dueInfo?.isUrgent
      ? styles.dueUrgent
      : styles.dueNormal;

  // Priority cue rendered as a coloured left bar. Lets users feel the
  // urgency of a card before they read the badge — important for ADHD
  // scanning where the eye lands on shape/colour first. We hide it for
  // completed cards so they recede into the background.
  const accentBorderStyle = useMemo<ViewStyle>(
    () => ({
      borderLeftColor: isCompleted ? 'transparent' : theme.colors[priorityConfig.colorKey],
    }),
    [isCompleted, theme.colors, priorityConfig.colorKey]
  );

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          accentBorderStyle,
          isCompleted ? styles.cardCompleted : styles.cardActive,
        ]}
        onPress={() => onPress(task.id)}
        onLongPress={() => onLongPress?.(task.id)}
        activeOpacity={opacityTokens.hover}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Task: ${task.title}${isCompleted ? ', completed' : ''}`}
      >
        <View style={styles.row}>
          <AnimatedCheckbox
            checked={isCompleted}
            onToggle={handleComplete}
            size={iconSizes.xl}
            color={theme.colors[priorityConfig.colorKey]}
          />

          <View style={styles.content}>
            <Text
              style={[
                theme.text.bodyMedium,
                styles.title,
                isCompleted ? styles.titleCompleted : styles.titleActive,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            <View style={styles.metaRow}>
              <Badge
                label={priorityConfig.label}
                variant={getPriorityBadgeVariant(task.priority)}
                emoji={priorityConfig.emoji}
              />

              {dueInfo && <Text style={[styles.dueText, dueStatusStyle]}>{dueInfo.label}</Text>}

              {hasSubtasks && (
                <Text style={styles.subtaskCount}>
                  {subtaskProgress.completed}/{subtaskProgress.total} steps
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.xpBadge}>+{task.xpReward} XP</Text>
        </View>

        {hasSubtasks && !isCompleted && (
          <View style={styles.subtaskBar}>
            <View style={[styles.subtaskFill, subtaskFillStyle]} />
          </View>
        )}
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
      // The left border carries the priority colour cue. We always
      // reserve the width so completing/uncompleting a task doesn't
      // shift the row's content position; only the *colour* changes.
      borderLeftWidth: borderWidths.extraThick,
      marginBottom: spacing.xs,
      backgroundColor: theme.colors.card,
    },
    cardActive: {
      borderTopColor: theme.colors.border,
      borderRightColor: theme.colors.border,
      borderBottomColor: theme.colors.border,
      opacity: opacityTokens.full,
    },
    cardCompleted: {
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      opacity: opacityTokens.ghost,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    content: {
      flex: 1,
      gap: spacing['3xs'],
    },
    title: { flex: 1 },
    titleActive: {
      color: theme.colors.textPrimary,
      textDecorationLine: 'none',
    },
    titleCompleted: {
      color: theme.colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['2xs'],
      flexWrap: 'wrap',
    },
    dueText: {
      fontSize: fontSizes.sm,
    },
    dueNormal: {
      color: theme.colors.textTertiary,
      fontWeight: fontWeights.regular,
    },
    dueUrgent: {
      color: theme.colors.warning,
      fontWeight: fontWeights.semibold,
    },
    dueOverdue: {
      color: theme.colors.error,
      fontWeight: fontWeights.semibold,
    },
    subtaskCount: {
      fontSize: fontSizes.xs,
      color: theme.colors.textTertiary,
    },
    xpBadge: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      marginTop: spacing['3xs'],
      color: theme.colors.primary,
    },
    subtaskBar: {
      height: moderateScale(3),
      borderRadius: borderRadius.sm / 2,
      marginTop: spacing.xs,
      overflow: 'hidden',
      backgroundColor: theme.colors.border,
    },
    subtaskFill: {
      height: '100%',
      borderRadius: borderRadius.sm / 2,
      backgroundColor: theme.colors.primary,
    },
  });
