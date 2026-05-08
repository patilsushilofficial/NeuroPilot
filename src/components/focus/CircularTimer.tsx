import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatTimerDisplay } from '../../utils/dateUtils';
import { FocusPhase } from '../../types';

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: FocusPhase;
  isRunning: boolean;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PHASE_LABELS: Record<FocusPhase, string> = {
  focus: 'FOCUS',
  short_break: 'SHORT BREAK',
  long_break: 'LONG BREAK',
};

const PHASE_EMOJIS: Record<FocusPhase, string> = {
  focus: '🧠',
  short_break: '☕',
  long_break: '🌿',
};

export const CircularTimer: React.FC<CircularTimerProps> = ({
  secondsRemaining,
  totalSeconds,
  phase,
  isRunning,
  size = 260,
}) => {
  const theme = useAppTheme();

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 1;
  const strokeDashoffset = useSharedValue(circumference * (1 - progress));

  useEffect(() => {
    strokeDashoffset.value = withTiming(circumference * (1 - progress), {
      duration: isRunning ? 1000 : 300,
      easing: Easing.linear,
    });
  }, [progress, isRunning]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const phaseColor =
    phase === 'focus'
      ? theme.colors.primary
      : phase === 'short_break'
      ? theme.colors.secondary
      : theme.colors.successContainer;

  const trackColor = theme.colors.border;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc — starts from top (rotate -90deg) */}
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={phaseColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerContent}>
          <Text style={styles.phaseEmoji}>{PHASE_EMOJIS[phase]}</Text>
          <Text style={[styles.timerText, { color: theme.colors.textPrimary }]}>
            {formatTimerDisplay(secondsRemaining)}
          </Text>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>
            {PHASE_LABELS[phase]}
          </Text>
          {!isRunning && secondsRemaining < (totalSeconds) && (
            <Text style={[styles.pausedLabel, { color: theme.colors.textTertiary }]}>
              PAUSED
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 32,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 64,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  pausedLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 4,
  },
});
