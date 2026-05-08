import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHabitsScreen } from '../../hooks/useHabitsScreen';
import { HabitCard } from '../../components/habits/HabitCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { avatarSizes, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';

export const HabitsScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    todaysHabits,
    completedCount,
    completionRate,
    isPerfectDay,
    isHabitCompletedToday,
    handleToggle,
    openAddHabit,
    openHabitDetail,
  } = useHabitsScreen();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[theme.text.h2, styles.title]}>Habits</Text>
          <Text style={[theme.text.bodySmall, styles.subtitle]}>
            {completedCount} of {todaysHabits.length} done today
          </Text>
        </View>
        <TouchableOpacity
          onPress={openAddHabit}
          style={styles.addButton}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Add new habit"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {todaysHabits.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={[theme.text.bodySmall, styles.subtitle]}>Daily Progress</Text>
            <Text style={[theme.text.labelMedium, styles.progressPercent]}>
              {Math.round(completionRate * 100)}%
            </Text>
          </View>
          <ProgressBar progress={completionRate} color={theme.colors.secondary} />
          {isPerfectDay && (
            <Text style={[theme.text.bodySmall, styles.celebrate]}>
              🎉 Perfect day! All habits complete!
            </Text>
          )}
        </View>
      )}

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
            onLongPress={openHabitDetail}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🌱"
            title="No habits yet"
            subtitle="Small daily habits rewire your brain over time. Start with just one."
            actionLabel="Add First Habit"
            onAction={openAddHabit}
          />
        }
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing['2xs'],
    },
    title: { color: theme.colors.textPrimary },
    subtitle: { color: theme.colors.textSecondary },
    addButton: {
      width: avatarSizes.md,
      height: avatarSizes.md,
      borderRadius: avatarSizes.md / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.secondary,
    },
    addButtonText: {
      color: 'white',
      fontSize: iconSizes.xl,
      fontWeight: fontWeights.semibold,
    },
    progressSection: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xs,
      gap: spacing['2xs'],
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressPercent: { color: theme.colors.secondary },
    celebrate: {
      color: theme.colors.success,
      marginTop: spacing['2xs'],
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing['8xl'],
    },
  });
