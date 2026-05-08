import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useFocusTimer } from '../../hooks/useFocusTimer';
import { CircularTimer } from '../../components/focus/CircularTimer';
import { FocusShield } from '../../components/focus/FocusShield';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FOCUS_PRESETS } from '../../constants/focusPresets';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';
import { formatFocusTime } from '../../utils/dateUtils';

export const FocusScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    active,
    shieldActive,
    selectedPreset,
    handleSelectPreset,
    preset,
    isIdle,
    isRunning,
    isActive,
    handleStart,
    handlePauseResume,
    handleAbandon,
    handleSkipPhase,
    todaySessions,
    todayFocusMinutes,
    toggleShield,
    tipText,
    infoItems,
  } = useFocusTimer();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[theme.text.h2, styles.title]}>Focus</Text>
          <View style={styles.headerStats}>
            <Badge label={`Today: ${formatFocusTime(todayFocusMinutes)}`} variant="primary" emoji="⏱️" />
            <Badge label={`${todaySessions.length} sessions`} variant="neutral" />
          </View>
        </View>

        {isIdle && (
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, styles.sectionLabel]}>CHOOSE A MODE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
              {FOCUS_PRESETS.map((p) => {
                const selected = selectedPreset === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handleSelectPreset(p.id)}
                    style={[
                      styles.presetCard,
                      selected ? styles.presetCardActive : styles.presetCardInactive,
                    ]}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text style={styles.presetEmoji}>{p.icon}</Text>
                    <Text
                      style={[
                        theme.text.labelMedium,
                        selected ? styles.presetNameActive : styles.presetNameInactive,
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text style={[theme.text.bodySmall, styles.presetMeta]}>
                      {p.focusMinutes}m / {p.shortBreakMinutes}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.timerSection}>
          <CircularTimer
            secondsRemaining={active.secondsRemaining}
            totalSeconds={active.totalSeconds}
            phase={active.phase}
            isRunning={isRunning}
          />

          {isActive && (
            <View style={styles.pomodoroRow}>
              {Array.from({ length: preset.sessionsBeforeLongBreak }).map((_, i) => {
                const filled = i < active.completedPomodoros % preset.sessionsBeforeLongBreak;
                return (
                  <View
                    key={i}
                    style={[
                      styles.pomodoroDot,
                      filled ? styles.pomodoroDotOn : styles.pomodoroDotOff,
                    ]}
                  />
                );
              })}
            </View>
          )}

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
                  style={styles.pauseBtn}
                />
                <TouchableOpacity
                  onPress={handleSkipPhase}
                  style={styles.skipBtn}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Skip to next phase"
                >
                  <Text style={styles.skipBtnText}>Skip ⏭</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isActive && (
            <TouchableOpacity
              onPress={handleAbandon}
              style={styles.abandonBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel="End session"
            >
              <Text style={[theme.text.bodySmall, styles.abandonText]}>End Session</Text>
            </TouchableOpacity>
          )}
        </View>

        <FocusShield isActive={shieldActive} onToggle={toggleShield} />

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            {infoItems.map((item) => (
              <View key={item.id} style={styles.infoItem}>
                <Text style={styles.infoEmoji}>{item.emoji}</Text>
                <Text style={[theme.text.h4, styles.infoValue]}>{item.value}</Text>
                <Text style={[theme.text.labelSmall, styles.infoLabel]}>
                  {item.label.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.tipCard}>
          <Text style={[theme.text.labelSmall, styles.tipHeader]}>💡 ADHD TIP</Text>
          <Text style={[theme.text.bodySmall, styles.tipBody]}>{tipText}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing['7xl'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { color: theme.colors.textPrimary },
    headerStats: {
      flexDirection: 'row',
      gap: spacing['2xs'],
    },
    section: {},
    sectionLabel: {
      color: theme.colors.textTertiary,
      marginBottom: spacing.xs,
    },
    presetScroll: {
      marginHorizontal: -spacing.md,
      paddingHorizontal: spacing.md,
    },
    presetCard: {
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
      marginRight: spacing.xs,
      width: controlSizes.presetCard,
      gap: spacing['3xs'],
    },
    presetCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    presetCardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    presetEmoji: { fontSize: iconSizes.xl },
    presetNameActive: { color: theme.colors.primaryLight },
    presetNameInactive: { color: theme.colors.textPrimary },
    presetMeta: { color: theme.colors.textTertiary },
    timerSection: {
      alignItems: 'center',
      gap: spacing.md,
    },
    pomodoroRow: {
      flexDirection: 'row',
      gap: spacing['2xs'],
    },
    pomodoroDot: {
      width: controlSizes.pomodoroDot,
      height: controlSizes.pomodoroDot,
      borderRadius: controlSizes.pomodoroDot / 2,
    },
    pomodoroDotOn: { backgroundColor: theme.colors.primary },
    pomodoroDotOff: { backgroundColor: theme.colors.border },
    controls: {
      width: '100%',
    },
    activeControls: {
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    pauseBtn: { flex: 1 },
    skipBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipBtnText: {
      color: theme.colors.textSecondary,
      fontWeight: fontWeights.semibold,
    },
    abandonBtn: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    abandonText: { color: theme.colors.textTertiary },
    infoCard: {},
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    infoItem: {
      alignItems: 'center',
      gap: spacing['3xs'],
    },
    infoEmoji: { fontSize: iconSizes.lg },
    infoValue: { color: theme.colors.textPrimary },
    infoLabel: { color: theme.colors.textTertiary },
    tipCard: {
      borderRadius: borderRadius.lg,
      borderLeftColor: theme.colors.secondary,
      borderLeftWidth: borderWidths.extraThick,
    },
    tipHeader: { color: theme.colors.secondary },
    tipBody: {
      color: theme.colors.textSecondary,
      marginTop: spacing['2xs'],
    },
  });
