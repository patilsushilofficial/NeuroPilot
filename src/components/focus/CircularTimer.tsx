import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useCircularProgressAnimation } from '../../hooks/useCircularProgressAnimation';
import { formatTimerDisplay } from '../../utils/dateUtils';
import { computeCircleGeometry } from '../../utils/svgGeometry';
import { FocusPhase } from '../../types';
import { Theme } from '../../theme';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';
import { iconSizes } from '../../theme/tokens';
import { spacing } from '../../theme/spacing';
import { moderateScale } from '../../utils/responsive';
import {
  FOCUS_PHASE_EMOJIS,
  FOCUS_PHASE_LABELS,
  getFocusPhaseColor,
} from '../../constants/focus';

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: FocusPhase;
  isRunning: boolean;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  const { radius, circumference, cx, cy } = useMemo(
    () => computeCircleGeometry(size, STROKE_WIDTH),
    [size]
  );

  const sizeStyle = useMemo<ViewStyle>(
    () => ({ width: size, height: size }),
    [size]
  );

  const phaseColor = getFocusPhaseColor(phase, theme);
  const phaseLabelStyle = styles[PHASE_LABEL_KEYS[phase]];

  const { animatedProps } = useCircularProgressAnimation({
    secondsRemaining,
    totalSeconds,
    isRunning,
    circumference,
  });

  const isPaused = !isRunning && secondsRemaining < totalSeconds;

  return (
    <View style={[styles.container, sizeStyle]}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={theme.colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={phaseColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerContent}>
          <Text style={styles.phaseEmoji}>{FOCUS_PHASE_EMOJIS[phase]}</Text>
          <Text style={styles.timerText}>{formatTimerDisplay(secondsRemaining)}</Text>
          <Text style={[styles.phaseLabel, phaseLabelStyle]}>{FOCUS_PHASE_LABELS[phase]}</Text>
          {isPaused && <Text style={styles.pausedLabel}>PAUSED</Text>}
        </View>
      </View>
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
      flex: 1,
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

/**
 * Maps each focus phase to the correct phase-label style key. Resolved
 * once at module scope so consumers stay free of template-literal style
 * lookups.
 */
const PHASE_LABEL_KEYS: Record<FocusPhase, PhaseLabelKey> = {
  focus: 'phaseLabelPrimary',
  short_break: 'phaseLabelSecondary',
  long_break: 'phaseLabelSuccess',
};

type PhaseLabelKey = 'phaseLabelPrimary' | 'phaseLabelSecondary' | 'phaseLabelSuccess';
