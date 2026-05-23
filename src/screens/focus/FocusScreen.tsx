import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useFocusTimer } from '../../hooks/useFocusTimer';
import { FocusShield } from '../../components/focus/FocusShield';
import { FocusSessionSummary } from '../../components/focus/FocusSessionSummary';
import { FocusHeader } from '../../components/focus/FocusHeader';
import { FocusPresetPicker } from '../../components/focus/FocusPresetPicker';
import { FocusTimerPanel } from '../../components/focus/FocusTimerPanel';
import { Card } from '../../components/common/Card';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths } from '../../theme/tokens';

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
        <FocusHeader
          isRunning={isRunning}
          isActive={isActive}
          todayFocusMinutes={todayFocusMinutes}
          sessionsCount={todaySessions.length}
        />

        {isIdle && (
          <FocusPresetPicker
            selectedPresetId={selectedPreset}
            onSelectPreset={handleSelectPreset}
          />
        )}

        <FocusTimerPanel
          phase={active.phase}
          presetName={preset.name}
          secondsRemaining={active.secondsRemaining}
          totalSeconds={active.totalSeconds}
          completedPomodoros={active.completedPomodoros}
          sessionsBeforeLongBreak={preset.sessionsBeforeLongBreak}
          isIdle={isIdle}
          isRunning={isRunning}
          isActive={isActive}
          preset={preset}
          onStart={handleStart}
          onPauseResume={handlePauseResume}
          onSkipPhase={handleSkipPhase}
          onAbandon={handleAbandon}
        />

        <View style={styles.sectionStack}>
          <Text style={[theme.text.labelSmall, styles.sectionHeading]}>FOCUS SHIELD</Text>
          <FocusShield isActive={shieldActive} onToggle={toggleShield} />
        </View>

        <View style={styles.sectionStack}>
          <Text style={[theme.text.labelSmall, styles.sectionHeading]}>THIS PRESET</Text>
          <FocusSessionSummary items={infoItems} />
        </View>

        <View style={styles.sectionStack}>
          <Text style={[theme.text.labelSmall, styles.sectionHeading]}>ADHD TIP</Text>
          <Card style={styles.tipCard}>
            <Text style={[theme.text.bodySmall, styles.tipBody]}>{tipText}</Text>
          </Card>
        </View>
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
      gap: spacing.lg,
      paddingBottom: spacing['7xl'],
    },
    sectionStack: {
      gap: spacing.xs,
    },
    sectionHeading: {
      color: theme.colors.textTertiary,
      marginLeft: spacing['2xs'],
    },
    tipCard: {
      borderRadius: borderRadius.lg,
      borderLeftColor: theme.colors.secondary,
      borderLeftWidth: borderWidths.extraThick,
    },
    tipBody: {
      color: theme.colors.textSecondary,
    },
  });
