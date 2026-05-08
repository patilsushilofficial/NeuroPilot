import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAppStore, selectStats, selectTodaysTasks, selectTodaysHabits, selectActiveFocus } from '../../store';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { QuickCapture } from '../../components/tasks/QuickCapture';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  getTimeGreeting,
  formatFocusTime,
  getLevelTitle,
} from '../../utils/dateUtils';
import { getXPProgressInLevel, MOTIVATIONAL_QUOTES } from '../../constants/focusPresets';
import { moderateScale } from '../../utils/responsive';

export const HomeScreen: React.FC = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();

  // Avatar spring animation
  const avatarScale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: avatarScale.value }] }));

  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore(selectStats);
  const todaysTasks = useAppStore(selectTodaysTasks);
  const todaysHabits = useAppStore(selectTodaysHabits);
  const activeFocus = useAppStore(selectActiveFocus);
  const { addTask, recordTaskComplete, addXP, isHabitCompletedToday } = useAppStore();
  const settings = useAppStore((s) => s.settings);

  // Random quote for today (seeded by date so it doesn't change mid-day)
  const todayQuote = useMemo(() => {
    const dayIndex = new Date().getDate() % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[dayIndex];
  }, []);

  const completedTodayTasks = todaysTasks.filter((t) => t.status === 'completed').length;
  const completedHabits = todaysHabits.filter((h) => isHabitCompletedToday(h.id)).length;
  const xpProgress = getXPProgressInLevel(stats.totalXP);

  const handleQuickCapture = (title: string, priority?: 'high' | 'medium' | 'low') => {
    addTask({
      title,
      priority: priority ?? 'medium',
      tags: [],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[theme.text.h4, { color: theme.colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
            </Text>
            <Text style={[theme.text.displayMedium, { color: theme.colors.textPrimary, marginTop: moderateScale(4) }]}>
              {getTimeGreeting(profile?.name)}
            </Text>
          </View>
          {/* Premium Avatar Button with edit badge */}
          <TouchableOpacity
            onPress={() => {
              avatarScale.value = withSpring(0.88, { damping: 8 }, () => {
                avatarScale.value = withSpring(1);
              });
              navigation.navigate('Settings', { screen: 'EditProfile' });
            }}
            activeOpacity={1}
            accessible
            accessibilityLabel="Edit your profile"
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.avatarBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.primary,
                  ...theme.shadows.glow(theme.colors.primary),
                },
                avatarAnimStyle,
              ]}
            >
              <Text style={{ fontSize: moderateScale(24) }}>{profile?.avatar ?? '🧠'}</Text>
            </Animated.View>
            {/* Pencil badge */}
            <View
              style={[
                styles.editBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={{ fontSize: moderateScale(8), color: '#FFF' }}>✏</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* XP Level Card - Hero Section */}
        <Card style={styles.section} elevated>
          <View style={styles.xpRow}>
            <View>
              <Text style={[theme.text.labelSmall, { color: theme.colors.primary, letterSpacing: 2 }]}>
                LEVEL {stats.level} · {getLevelTitle(stats.level).toUpperCase()}
              </Text>
              <Text style={[theme.text.xpDisplay, { color: theme.colors.textPrimary, marginTop: moderateScale(4) }]}>
                {stats.totalXP.toLocaleString()} <Text style={{ color: theme.colors.primary }}>XP</Text>
              </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ fontSize: moderateScale(22) }}>🔥</Text>
              <Text style={[theme.text.h3, { color: theme.colors.streakFire }]}>
                {stats.currentStreak}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: spacing[2] }}>
            <ProgressBar
              progress={xpProgress}
              color={theme.colors.primary}
              height={moderateScale(8)}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: moderateScale(8) }}>
              <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>PROGRESS</Text>
              <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>
                {stats.xpToNextLevel} TO GO
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Capture */}
        <QuickCapture onCapture={handleQuickCapture} />

        {/* Today Summary Dashboard */}
        <Text style={[theme.text.h4, { color: theme.colors.textPrimary, marginTop: spacing[1] }]}>Overview</Text>
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { flex: 1 }]} variant="surface">
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={styles.summaryEmoji}>✅</Text>
            </View>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary, marginTop: moderateScale(8) }]}>
              {completedTodayTasks}<Text style={{ color: theme.colors.textTertiary, fontSize: moderateScale(16) }}>/{todaysTasks.length}</Text>
            </Text>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>TASKS</Text>
          </Card>

          <Card style={[styles.summaryCard, { flex: 1 }]} variant="surface">
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text style={styles.summaryEmoji}>🔥</Text>
            </View>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary, marginTop: moderateScale(8) }]}>
              {completedHabits}<Text style={{ color: theme.colors.textTertiary, fontSize: moderateScale(16) }}>/{todaysHabits.length}</Text>
            </Text>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>HABITS</Text>
          </Card>

          <Card style={[styles.summaryCard, { flex: 1 }]} variant="surface">
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.warningContainer }]}>
              <Text style={styles.summaryEmoji}>⏱️</Text>
            </View>
            <Text style={[theme.text.h2, { color: theme.colors.textPrimary, marginTop: moderateScale(8) }]}>
              {formatFocusTime(stats.focusMinutes)}
            </Text>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>FOCUS</Text>
          </Card>
        </View>

        {/* Active Focus Session Banner */}
        {activeFocus.status === 'running' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Focus')}
            style={[
              styles.focusBanner,
              { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Active focus session — tap to view"
          >
            <Text style={{ fontSize: 18 }}>🎯</Text>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.primaryLight, flex: 1 }]}>
              Focus session in progress…
            </Text>
            <Text style={[theme.text.labelMedium, { color: theme.colors.primary }]}>View →</Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { emoji: '📋', label: 'Add Task', onPress: () => navigation.navigate('TasksTab', { screen: 'AddTask' }) },
            { emoji: '🎯', label: 'Start Focus', onPress: () => navigation.navigate('Focus') },
            { emoji: '🔥', label: 'My Habits', onPress: () => navigation.navigate('HabitsTab') },
            { emoji: '📈', label: 'Progress', onPress: () => navigation.navigate('Progress') },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              style={[
                styles.quickAction,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
              accessible
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={{ fontSize: 24 }}>{action.emoji}</Text>
              <Text style={[theme.text.labelMedium, { color: theme.colors.textSecondary }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Motivational Quote */}
        {settings.showMotivationalQuotes && (
          <Card style={[styles.quoteCard, { borderLeftColor: theme.colors.primary }]}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.textPrimary, fontStyle: 'italic' }]}>
              "{todayQuote.text}"
            </Text>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginTop: 6 }]}>
              — {todayQuote.author}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing[2],
    gap: spacing[2],
    paddingBottom: spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  headerTextContainer: {
    flex: 1,
  },
  avatarBtn: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {},
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  streakBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: borderRadius.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  summaryCard: {
    alignItems: 'flex-start',
    gap: 2,
    paddingVertical: spacing[1.5],
    paddingHorizontal: spacing[1.5],
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmoji: {
    fontSize: moderateScale(18),
  },
  focusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[1.5],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  quickAction: {
    width: '48%',
    padding: spacing[2],
    borderRadius: borderRadius.xl,
    alignItems: 'flex-start',
    gap: moderateScale(8),
    borderWidth: 1,
  },
  quoteCard: {
    borderLeftWidth: 3,
    borderRadius: borderRadius.lg,
  },
});
