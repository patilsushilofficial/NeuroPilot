import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useTasksScreen } from '../../hooks/useTasksScreen';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FloatingActionButton } from '../../components/common/FloatingActionButton';
import { Theme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { borderWidths, iconSizes } from '../../theme/tokens';
import { TASK_FILTER_TABS } from '../../constants/tasksUi';

export const TasksScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    filter,
    selectFilter,
    sortedTasks,
    pendingCount,
    overdueCount,
    handleComplete,
    handleDelete,
    openAddTask,
    openTaskDetail,
  } = useTasksScreen();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[theme.text.h2, styles.title]}>Tasks</Text>
        <Text style={[theme.text.bodySmall, styles.subtitle]}>
          {pendingCount} pending
          {overdueCount > 0 && (
            <Text style={styles.overdueText}> · {overdueCount} overdue</Text>
          )}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {TASK_FILTER_TABS.map((tab) => {
          const selected = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => selectFilter(tab.key)}
              style={[
                styles.filterTab,
                selected ? styles.filterTabActive : styles.filterTabInactive,
              ]}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={styles.filterEmoji}>{tab.emoji}</Text>
              <Text
                style={[
                  theme.text.labelMedium,
                  selected ? styles.filterLabelActive : styles.filterLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={handleComplete}
            onPress={openTaskDetail}
            onLongPress={handleDelete}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="📋"
            title={filter === 'completed' ? 'No completed tasks yet' : 'Brain clear!'}
            subtitle={
              filter === 'completed'
                ? 'Complete some tasks to see them here.'
                : 'Your task list is empty. Tap + to add a task.'
            }
          />
        }
      />

      <FloatingActionButton
        onPress={openAddTask}
        accessibilityLabel="Add new task"
      />
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
      paddingBottom: spacing['2xs'],
    },
    title: { color: theme.colors.textPrimary },
    subtitle: { color: theme.colors.textSecondary },
    overdueText: { color: theme.colors.error },
    filterRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      gap: spacing['2xs'],
      marginBottom: spacing.xs,
    },
    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius['2xl'],
      borderWidth: borderWidths.thin,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    filterTabInactive: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    filterEmoji: { fontSize: iconSizes.sm },
    filterLabelActive: { color: theme.colors.primaryLight },
    filterLabelInactive: { color: theme.colors.textSecondary },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing['8xl'],
    },
  });
