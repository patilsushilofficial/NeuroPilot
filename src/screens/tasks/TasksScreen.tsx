import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskCard } from '../../components/tasks/TaskCard';
import { QuickCapture } from '../../components/tasks/QuickCapture';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { spacing } from '../../theme/spacing';

type FilterTab = 'all' | 'today' | 'completed';

const FILTER_TABS: Array<{ key: FilterTab; label: string; emoji: string }> = [
  { key: 'all', label: 'All', emoji: '📋' },
  { key: 'today', label: 'Today', emoji: '📅' },
  { key: 'completed', label: 'Done', emoji: '✅' },
];

export const TasksScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<FilterTab>('all');
  const {
    tasks,
    addTask,
    completeTask,
    deleteTask,
    addXP,
    recordTaskComplete,
    getTodaysTasks,
  } = useAppStore();

  const filteredTasks = useMemo(() => {
    if (filter === 'today') return getTodaysTasks();
    if (filter === 'completed') return tasks.filter((t) => t.status === 'completed');
    return tasks.filter((t) => t.status !== 'completed');
  }, [tasks, filter, getTodaysTasks]);

  // Sort: high priority → medium → low, then by date
  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...filteredTasks].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filteredTasks]);

  const handleComplete = useCallback(
    (id: string) => {
      const xp = completeTask(id);
      if (xp > 0) {
        addXP(xp);
        recordTaskComplete();
        haptics.success();
      }
    },
    [completeTask, addXP, recordTaskComplete, haptics]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            deleteTask(id);
          },
        },
      ]);
    },
    [deleteTask, haptics]
  );

  const handleQuickCapture = useCallback(
    (title: string, priority?: 'high' | 'medium' | 'low') => {
      addTask({ title, priority: priority ?? 'medium', tags: [] });
      haptics.light();
    },
    [addTask, haptics]
  );

  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const overdueCount = useAppStore((s) => s.getOverdueTasks().length);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>Tasks</Text>
          <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
            {pendingCount} pending
            {overdueCount > 0 && (
              <Text style={{ color: theme.colors.error }}> · {overdueCount} overdue</Text>
            )}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTask')}
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add new task"
        >
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '600' }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              haptics.light();
              setFilter(tab.key);
            }}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  filter === tab.key ? theme.colors.primaryContainer : 'transparent',
                borderColor: filter === tab.key ? theme.colors.primary : theme.colors.border,
              },
            ]}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === tab.key }}
          >
            <Text style={{ fontSize: 14 }}>{tab.emoji}</Text>
            <Text
              style={[
                theme.text.labelMedium,
                {
                  color:
                    filter === tab.key ? theme.colors.primaryLight : theme.colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Capture */}
      <View style={styles.captureWrapper}>
        <QuickCapture onCapture={handleQuickCapture} />
      </View>

      {/* Task List */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={handleComplete}
            onPress={(id) => navigation.navigate('AddTask', { taskId: id })}
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
                : 'Your task list is empty. Capture a thought above — it takes 10 seconds.'
            }
            actionLabel={filter !== 'completed' ? 'Add a Task' : undefined}
            onAction={
              filter !== 'completed' ? () => navigation.navigate('AddTask') : undefined
            }
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingTop: spacing[1],
    paddingBottom: spacing[0.5],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[2],
    gap: spacing[0.5],
    marginBottom: spacing[1],
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[1.5],
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  captureWrapper: {
    paddingHorizontal: spacing[2],
    marginBottom: spacing[1],
  },
  listContent: {
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[10],
  },
});
