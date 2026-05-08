import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore, selectActiveFocus, selectStats } from '../../store';
import { CircularTimer } from '../../components/focus/CircularTimer';
import { FocusShield } from '../../components/focus/FocusShield';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FOCUS_PRESETS, DEFAULT_PRESET_ID, getPresetById } from '../../constants/focusPresets';
import { FocusPreset } from '../../types';
import { spacing, borderRadius } from '../../theme/spacing';
import { formatFocusTime } from '../../utils/dateUtils';

export const FocusScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();

  const active = useAppStore(selectActiveFocus);
  const stats = useAppStore(selectStats);
  const shieldActive = useAppStore((s) => s.shieldActive);
  const { startFocus, pauseFocus, resumeFocus, tickSecond, skipPhase, abandonFocus, addXP, recordFocusMinutes, getSessionsToday, toggleShield } = useAppStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(DEFAULT_PRESET_ID);
  const preset = getPresetById(active.sessionId ? active.presetId : selectedPreset);

  const isIdle = active.status === 'idle';
  const isRunning = active.status === 'running';
  const isPaused = active.status === 'paused';
  const isActive = isRunning || isPaused;

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(async () => {
        const xp = tickSecond();
        if (xp > 0) {
          // Phase just completed
          const minutesCompleted = getPresetById(active.presetId).focusMinutes;
          addXP(xp);
          recordFocusMinutes(minutesCompleted);
          haptics.focusComplete();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = useCallback(() => {
    haptics.heavy();
    startFocus(selectedPreset);
  }, [selectedPreset, startFocus, haptics]);

  const handlePauseResume = useCallback(() => {
    if (isRunning) {
      haptics.medium();
      pauseFocus();
    } else {
      haptics.medium();
      resumeFocus();
    }
  }, [isRunning, pauseFocus, resumeFocus, haptics]);

  const handleAbandon = useCallback(() => {
    Alert.alert(
      'End Focus Session?',
      'Your current session progress will be saved, but the timer will stop.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            abandonFocus();
          },
        },
      ]
    );
  }, [abandonFocus, haptics]);

  const todaySessions = getSessionsToday();
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.totalFocusMinutes, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[theme.text.h2, { color: theme.colors.textPrimary }]}>Focus</Text>
          <View style={styles.headerStats}>
            <Badge label={`Today: ${formatFocusTime(todayFocusMinutes)}`} variant="primary" emoji="⏱️" />
            <Badge label={`${todaySessions.length} sessions`} variant="neutral" />
          </View>
        </View>

        {/* Preset Picker (only when idle) */}
        {isIdle && (
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: spacing[1] }]}>
              CHOOSE A MODE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {FOCUS_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    haptics.light();
                    setSelectedPreset(p.id);
                  }}
                  style={[
                    styles.presetCard,
                    {
                      backgroundColor:
                        selectedPreset === p.id ? theme.colors.primaryContainer : theme.colors.card,
                      borderColor: selectedPreset === p.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  accessible
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedPreset === p.id }}
                >
                  <Text style={{ fontSize: 24 }}>{p.icon}</Text>
                  <Text
                    style={[
                      theme.text.labelMedium,
                      { color: selectedPreset === p.id ? theme.colors.primaryLight : theme.colors.textPrimary },
                    ]}
                  >
                    {p.name}
                  </Text>
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>
                    {p.focusMinutes}m / {p.shortBreakMinutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Timer */}
        <View style={styles.timerSection}>
          <CircularTimer
            secondsRemaining={active.secondsRemaining}
            totalSeconds={active.totalSeconds}
            phase={active.phase}
            isRunning={isRunning}
            size={280}
          />

          {/* Pomodoro dots */}
          {isActive && (
            <View style={styles.pomodoroRow}>
              {Array.from({ length: preset.sessionsBeforeLongBreak }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pomodoroDot,
                    {
                      backgroundColor:
                        i < active.completedPomodoros % preset.sessionsBeforeLongBreak
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            {isIdle ? (
              <Button
                label={`Start ${preset.name} 🚀`}
                onPress={handleStart}
                variant="primary"
                size="lg"
                fullWidth
              />
            ) : (
              <View style={styles.activeControls}>
                <Button
                  label={isRunning ? '⏸  Pause' : '▶  Resume'}
                  onPress={handlePauseResume}
                  variant={isRunning ? 'outline' : 'primary'}
                  size="lg"
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    skipPhase();
                  }}
                  style={[styles.skipBtn, { borderColor: theme.colors.border }]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Skip to next phase"
                >
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>Skip ⏭</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isActive && (
            <TouchableOpacity onPress={handleAbandon} style={styles.abandonBtn} accessible accessibilityRole="button" accessibilityLabel="End session">
              <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>
                End Session
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Focus Shield */}
        <FocusShield isActive={shieldActive} onToggle={toggleShield} />

        {/* Preset Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            {[
              { label: 'Focus', value: `${preset.focusMinutes}m`, emoji: '🧠' },
              { label: 'Short Break', value: `${preset.shortBreakMinutes}m`, emoji: '☕' },
              { label: 'Long Break', value: `${preset.longBreakMinutes}m`, emoji: '🌿' },
              { label: 'XP/session', value: `+${preset.focusMinutes * 2}`, emoji: '⚡' },
            ].map((item) => (
              <View key={item.label} style={styles.infoItem}>
                <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>{item.value}</Text>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>{item.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* ADHD Tips */}
        <Card style={[styles.tipCard, { borderLeftColor: theme.colors.secondary, borderLeftWidth: 3 }]}>
          <Text style={[theme.text.labelSmall, { color: theme.colors.secondary }]}>💡 ADHD TIP</Text>
          <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, marginTop: 6 }]}>
            {active.phase === 'focus'
              ? "Remove distractions: phone face-down, notifications off. Your brain needs one input at a time."
              : active.phase === 'short_break'
              ? "Move your body! A 5-minute walk resets your prefrontal cortex's attention capacity."
              : "Long break earned! Hydrate, stretch, or do something you genuinely enjoy."}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing[2],
    gap: spacing[2],
    paddingBottom: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    gap: 6,
  },
  section: {},
  presetScroll: {
    marginHorizontal: -spacing[2],
    paddingHorizontal: spacing[2],
  },
  presetCard: {
    alignItems: 'center',
    padding: spacing[1.5],
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    marginRight: spacing[1],
    width: 120,
    gap: 4,
  },
  timerSection: {
    alignItems: 'center',
    gap: spacing[2],
  },
  pomodoroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pomodoroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  controls: {
    width: '100%',
  },
  activeControls: {
    flexDirection: 'row',
    gap: spacing[1],
    alignItems: 'center',
  },
  skipBtn: {
    paddingHorizontal: spacing[1.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abandonBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  tipCard: {
    borderRadius: borderRadius.lg,
  },
});
