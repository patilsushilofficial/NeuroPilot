import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { CircularTimer } from './CircularTimer';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FOCUS_PHASE_LABELS } from '../../constants/focus';
import { FocusPhase, FocusPreset } from '../../types';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes } from '../../theme/tokens';

interface FocusTimerPanelProps {
  phase: FocusPhase;
  presetName: string;
  secondsRemaining: number;
  totalSeconds: number;
  completedPomodoros: number;
  sessionsBeforeLongBreak: number;
  isIdle: boolean;
  isRunning: boolean;
  isActive: boolean;
  preset: FocusPreset;
  onStart: () => void;
  onPauseResume: () => void;
  onSkipPhase: () => void;
  onAbandon: () => void;
}

export const FocusTimerPanel: React.FC<FocusTimerPanelProps> = ({
  phase,
  presetName,
  secondsRemaining,
  totalSeconds,
  completedPomodoros,
  sessionsBeforeLongBreak,
  isIdle,
  isRunning,
  isActive,
  preset,
  onStart,
  onPauseResume,
  onSkipPhase,
  onAbandon,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const phaseLabel = FOCUS_PHASE_LABELS[phase];

  return (
    <Card variant="surface" elevated style={styles.timerCard}>
      <View style={styles.phaseHeader}>
        <Badge
          label={phaseLabel}
          variant={phase === 'focus' ? 'primary' : phase === 'short_break' ? 'secondary' : 'success'}
          emoji={phase === 'focus' ? '🧠' : phase === 'short_break' ? '☕' : '🌿'}
        />
        <Text style={[theme.text.bodySmall, styles.phaseMeta]}>{presetName} preset</Text>
      </View>

      <View style={styles.phasePillRow}>
        <View style={[styles.phasePill, phase === 'focus' && styles.phasePillActive]}>
          <Text style={[theme.text.labelSmall, styles.phasePillText]}>FOCUS</Text>
        </View>
        <View style={[styles.phasePill, phase === 'short_break' && styles.phasePillActive]}>
          <Text style={[theme.text.labelSmall, styles.phasePillText]}>SHORT BREAK</Text>
        </View>
        <View style={[styles.phasePill, phase === 'long_break' && styles.phasePillActive]}>
          <Text style={[theme.text.labelSmall, styles.phasePillText]}>LONG BREAK</Text>
        </View>
      </View>

      <View style={styles.timerSection}>
        <CircularTimer
          secondsRemaining={secondsRemaining}
          totalSeconds={totalSeconds}
          phase={phase}
          isRunning={isRunning}
        />

        {isActive && (
          <View style={styles.pomodoroRow}>
            {Array.from({ length: sessionsBeforeLongBreak }).map((_, i) => {
              const filled = i < completedPomodoros % sessionsBeforeLongBreak;
              return (
                <View
                  key={i}
                  style={[styles.pomodoroDot, filled ? styles.pomodoroDotOn : styles.pomodoroDotOff]}
                />
              );
            })}
          </View>
        )}

        <View style={styles.controls}>
          {isIdle ? (
            <Button
              label={`Start ${preset.name} 🚀`}
              onPress={onStart}
              variant="primary"
              size="lg"
              fullWidth
            />
          ) : (
            <View style={styles.activeControls}>
              <Button
                label={isRunning ? '⏸  Pause' : '▶  Resume'}
                onPress={onPauseResume}
                variant={isRunning ? 'outline' : 'primary'}
                size="lg"
                style={styles.pauseBtn}
              />
              <Button
                label="Skip to next phase"
                onPress={onSkipPhase}
                variant="ghost"
                size="md"
                style={styles.skipBtn}
              />
            </View>
          )}
        </View>

        {isActive && (
          <TouchableOpacity
            onPress={onAbandon}
            style={styles.abandonBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="End session"
          >
            <Text style={[theme.text.bodySmall, styles.abandonText]}>End Session</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    timerCard: {
      borderRadius: borderRadius['2xl'],
      gap: spacing.md,
    },
    phaseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    phaseMeta: {
      color: theme.colors.textTertiary,
    },
    phasePillRow: {
      flexDirection: 'row',
      gap: spacing['2xs'],
    },
    phasePill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: spacing['2xs'],
    },
    phasePillActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    phasePillText: {
      color: theme.colors.textSecondary,
    },
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
      alignItems: 'stretch',
    },
    pauseBtn: { flex: 1 },
    skipBtn: {
      minWidth: controlSizes.presetCard,
    },
    abandonBtn: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    abandonText: { color: theme.colors.textTertiary },
  });
