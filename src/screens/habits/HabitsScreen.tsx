import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { HabitCard } from '../../components/habits/HabitCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgressBar } from '../../components/common/ProgressBar';
import { spacing } from '../../theme/spacing';

export const HabitsScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<any>();

  const {
    getTodaysHabits,
    completeHabit,
    uncompleteHabit,
    isHabitCompletedToday,
    addXP,
    recordHabitComplete,
  } = useAppStore();

  const todaysHabits = getTodaysHabits();
  const completedCount = todaysHabits.filter((h) => isHabitCompletedToday(h.id)).length;
  const completionRate = todaysHabits.length > 0 ? completedCount / todaysHabits.length : 0;

  const handleToggle = useCallback(
    (habitId: string) => {
      const isAlreadyDone = isHabitCompletedToday(habitId);
      if (isAlreadyDone) {
        uncompleteHabit(habitId);
      } else {
        const xp = completeHabit(habitId);
        if (xp > 0) {
          addXP(xp);
          recordHabitComplete();
          haptics.success();
        }
      }
    },
    [completeHabit, uncompleteHabit, isHabitCompletedToday, addXP, recordHabitComplete, haptics]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>Habits</Text>
          <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
            {completedCount} of {todaysHabits.length} done today
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddHabit')}
          style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add new habit"
        >
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '600' }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Progress */}
      {todaysHabits.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary }]}>
              Daily Progress
            </Text>
            <Text style={[theme.text.labelMedium, { color: theme.colors.secondary }]}>
              {Math.round(completionRate * 100)}%
            </Text>
          </View>
          <ProgressBar progress={completionRate} color={theme.colors.secondary} height={8} />
          {completionRate === 1 && (
            <Text style={[theme.text.bodySmall, { color: theme.colors.success, marginTop: 6 }]}>
              🎉 Perfect day! All habits complete!
            </Text>
          )}
        </View>
      )}

      {/* Habit List */}
      <FlatList
        data={todaysHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            isCompletedToday={isHabitCompletedToday(item.id)}
            onToggle={handleToggle}
            onLongPress={(id) => navigation.navigate('AddHabit', { habitId: id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🌱"
            title="No habits yet"
            subtitle="Small daily habits rewire your brain over time. Start with just one."
            actionLabel="Add First Habit"
            onAction={() => navigation.navigate('AddHabit')}
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
  progressSection: {
    paddingHorizontal: spacing[2],
    marginBottom: spacing[1],
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[10],
  },
});
