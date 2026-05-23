import React, { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useTasksScreen, type TaskSection } from '../../hooks/useTasksScreen';
import { TaskCard } from '../../components/tasks/TaskCard';
import { SegmentedFilterBar } from '../../components/common/SegmentedFilterBar';
import { ListSectionHeader } from '../../components/common/ListSectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { durations } from '../../theme/tokens';
import { TASK_FILTER_TABS, TASK_FILTER_EMPTY_STATE } from '../../constants/tasksUi';
import type { Task } from '../../types';

/**
 * Tasks list screen. Pure composition: the view-model
 * (`useTasksScreen`) owns state, derivations, counts, sections, and
 * navigation handlers. The screen only knows how to lay them out.
 *
 * Why composition-only:
 *  - Filter bar is the shared `SegmentedFilterBar`, not a Task-specific
 *    one — keeps the visual language identical with Habits.
 *  - Empty-state copy comes from `tasksUi.ts` (config), not an inline
 *    map declared in this file.
 *  - The eyebrow label and section partition come from the hook, so
 *    nothing here re-derives state that already lives there.
 */
export const TasksScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    filter,
    activeFilterLabel,
    selectFilter,
    sections,
    pendingCount,
    overdueCount,
    handleComplete,
    handleDelete,
    openAddTask,
    openTaskDetail,
  } = useTasksScreen();

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        onComplete={handleComplete}
        onPress={openTaskDetail}
        onLongPress={handleDelete}
      />
    ),
    [handleComplete, handleDelete, openTaskDetail]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TaskSection }) => (
      <Animated.View entering={FadeInDown.duration(durations.base)}>
        <ListSectionHeader
          title={section.title}
          count={section.data.length}
          accent={section.accent ?? 'primary'}
        />
      </Animated.View>
    ),
    []
  );

  const empty = TASK_FILTER_EMPTY_STATE[filter];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[theme.text.labelSmall, styles.eyebrow]}>
          {activeFilterLabel.toUpperCase()}
        </Text>
        <Text style={[theme.text.h1, styles.title]}>Tasks</Text>
        <Text style={[theme.text.bodySmall, styles.subtitle]}>
          {pendingCount} pending
          {overdueCount > 0 && <Text style={styles.overdueText}> · {overdueCount} overdue</Text>}
        </Text>
      </View>

      <View style={styles.filterRow}>
        <SegmentedFilterBar options={TASK_FILTER_TABS} selected={filter} onSelect={selectFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState emoji={empty.emoji} title={empty.title} subtitle={empty.subtitle} />
        }
      />

      <FloatingActionButton onPress={openAddTask} label="Add task" accessibilityLabel="Add task" />
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    eyebrow: {
      color: theme.colors.textTertiary,
      marginBottom: spacing['3xs'],
    },
    title: { color: theme.colors.textPrimary },
    subtitle: {
      color: theme.colors.textSecondary,
      marginTop: spacing['3xs'],
    },
    overdueText: { color: theme.colors.error },
    filterRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xs,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing['8xl'],
      // SectionList has no built-in vertical breathing room when empty;
      // padding-top here keeps the EmptyState centred under the filter
      // bar instead of flush against it.
      flexGrow: 1,
    },
  });
