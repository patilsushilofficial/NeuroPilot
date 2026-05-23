import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, durations, iconSizes, hitSlop } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';
import { TaskPriority } from '../../types';
import { getPriorityBadgeVariant } from '../../constants/taskPriorities';

import { Card } from '../common/Card';
import { AnimatedCheckbox } from '../common/AnimatedCheckbox';
import { Badge } from '../common/Badge';
import { Icon } from '../common/Icon';
import { EmptyState } from '../common/EmptyState';

export type TodayItem =
  | {
      type: 'task';
      id: string;
      title: string;
      priority: TaskPriority;
      completed: boolean;
    }
  | {
      type: 'habit';
      id: string;
      title: string;
      emoji: string;
      completed: boolean;
    };

interface TodayListProps {
  items: TodayItem[];
  /** Total count across tasks + habits — drives the "+N more" affordance. */
  totalCount: number;
  onToggleTask: (id: string) => void;
  onToggleHabit: (id: string) => void;
  onViewAllTasks: () => void;
}

const VISIBLE_LIMIT = 3;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
};

/**
 * Actionable feed of the user's most relevant items for today — a mix of
 * incomplete tasks and habits ordered by importance. Each row toggles
 * completion in place, so Home doubles as a launchpad rather than a
 * dashboard the user has to leave to act on.
 */
export const TodayList: React.FC<TodayListProps> = ({
  items,
  totalCount,
  onToggleTask,
  onToggleHabit,
  onViewAllTasks,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (totalCount === 0) {
    return (
      <Card style={styles.emptyCard}>
        <EmptyState
          emoji="🌱"
          title="A clear runway"
          subtitle="Nothing scheduled for today — capture a thought above when one lands."
        />
      </Card>
    );
  }

  const visible = items.slice(0, VISIBLE_LIMIT);
  const remaining = Math.max(0, totalCount - visible.length);

  return (
    <Card noPadding>
      {visible.map((item, index) => {
        const isLast = index === visible.length - 1 && remaining === 0;
        return (
          <Animated.View
            key={`${item.type}-${item.id}`}
            // exiting + layout pair gives the row a graceful fade-out
            // when an item is completed (and the slice removes it from the
            // selector), instead of the row vanishing on the same frame
            // the checkbox fills in.
            exiting={FadeOut.duration(durations.base)}
            layout={LinearTransition.duration(durations.base)}
            style={[styles.row, !isLast && styles.rowDivider]}
          >
            <AnimatedCheckbox
              checked={item.completed}
              onToggle={() =>
                item.type === 'task' ? onToggleTask(item.id) : onToggleHabit(item.id)
              }
            />
            <View style={styles.rowBody}>
              <Text
                style={[
                  theme.text.bodyMedium,
                  styles.rowTitle,
                  item.completed && styles.rowTitleCompleted,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </View>
            {item.type === 'task' ? (
              <Badge
                label={PRIORITY_LABELS[item.priority]}
                variant={getPriorityBadgeVariant(item.priority)}
                size="sm"
              />
            ) : (
              <View style={styles.habitTag}>
                <Text style={styles.habitTagEmoji}>{item.emoji}</Text>
                <Text style={[theme.text.labelSmall, styles.habitTagLabel]}>HABIT</Text>
              </View>
            )}
          </Animated.View>
        );
      })}

      {remaining > 0 && (
        <TouchableOpacity
          onPress={onViewAllTasks}
          style={styles.moreRow}
          hitSlop={hitSlop.sm}
          accessible
          accessibilityRole="button"
          accessibilityLabel={`View ${remaining} more items`}
        >
          <Text style={[theme.text.labelMedium, styles.moreLabel]}>+{remaining} more</Text>
          <Icon name="chevron-right" size={iconSizes.md} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyCard: {
      paddingVertical: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    rowDivider: {
      borderBottomWidth: borderWidths.hairline,
      borderBottomColor: theme.colors.divider,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      color: theme.colors.textPrimary,
      fontWeight: fontWeights.medium,
    },
    rowTitleCompleted: {
      color: theme.colors.textTertiary,
      textDecorationLine: 'line-through',
    },
    habitTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing['3xs'],
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.secondaryContainer,
    },
    habitTagEmoji: {
      fontSize: iconSizes.sm,
    },
    habitTagLabel: {
      color: theme.colors.secondaryLight,
    },
    moreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing['2xs'],
      paddingVertical: spacing.sm,
      borderTopWidth: borderWidths.hairline,
      borderTopColor: theme.colors.divider,
    },
    moreLabel: {
      color: theme.colors.primary,
    },
  });
