import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { formatTimerDisplay } from '../../utils/dateUtils';
import { remainingProgress } from '../../utils/svgGeometry';
import { FocusPhase } from '../../types';
import { Theme } from '../../theme';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';
import { iconSizes } from '../../theme/tokens';
import { spacing } from '../../theme/spacing';
import { moderateScale } from '../../utils/responsive';
import { FOCUS_PHASE_EMOJIS, FOCUS_PHASE_LABELS, getFocusPhaseColor } from '../../constants/focus';

import { ProgressRing } from '../common/ProgressRing';

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: FocusPhase;
  isRunning: boolean;
  size?: number;
}

const DEFAULT_SIZE = moderateScale(260);
const STROKE_WIDTH = moderateScale(10);

export const CircularTimer: React.FC<CircularTimerProps> = ({
  secondsRemaining,
  totalSeconds,
  phase,
  isRunning,
  size = DEFAULT_SIZE,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const phaseColor = getFocusPhaseColor(phase, theme);
  const phaseLabelStyle = styles[PHASE_LABEL_KEYS[phase]];

  const sizeStyle = useMemo<ViewStyle>(() => ({ width: size, height: size }), [size]);

  const progress = remainingProgress(secondsRemaining, totalSeconds);
  const isPaused = !isRunning && secondsRemaining < totalSeconds;

  return (
    <View style={[styles.container, sizeStyle]}>
      <ProgressRing
        progress={progress}
        size={size}
        strokeWidth={STROKE_WIDTH}
        color={phaseColor}
        trackColor={theme.colors.border}
      >
        <View style={styles.centerContent} pointerEvents="none">
          <Text style={styles.phaseEmoji}>{FOCUS_PHASE_EMOJIS[phase]}</Text>
          <Text style={styles.timerText}>{formatTimerDisplay(secondsRemaining)}</Text>
          <Text style={[styles.phaseLabel, phaseLabelStyle]}>{FOCUS_PHASE_LABELS[phase]}</Text>
          {isPaused && <Text style={styles.pausedLabel}>PAUSED</Text>}
        </View>
      </ProgressRing>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    phaseEmoji: {
      fontSize: iconSizes['3xl'],
      marginBottom: spacing['2xs'],
    },
    timerText: {
      fontSize: moderateScale(56),
      fontWeight: fontWeights.extrabold,
      letterSpacing: letterSpacings.tighter * 4,
      lineHeight: moderateScale(64),
      color: theme.colors.textPrimary,
    },
    phaseLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacings.widest,
      marginTop: spacing['2xs'],
    },
    pausedLabel: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.widest,
      marginTop: spacing['2xs'],
      color: theme.colors.textTertiary,
    },
    phaseLabelPrimary: { color: theme.colors.primary },
    phaseLabelSecondary: { color: theme.colors.secondary },
    phaseLabelSuccess: { color: theme.colors.successContainer },
  });

const PHASE_LABEL_KEYS: Record<FocusPhase, PhaseLabelKey> = {
  focus: 'phaseLabelPrimary',
  short_break: 'phaseLabelSecondary',
  long_break: 'phaseLabelSuccess',
};

type PhaseLabelKey = 'phaseLabelPrimary' | 'phaseLabelSecondary' | 'phaseLabelSuccess';
