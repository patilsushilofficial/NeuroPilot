import React, { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, durations, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';
import { formatTimerDisplay } from '../../utils/dateUtils';
import { remainingProgress } from '../../utils/svgGeometry';
import { ActiveFocusState } from '../../types';
import { moderateScale } from '../../utils/responsive';
import {
  FOCUS_PHASE_LABELS,
  getFocusPhaseColor,
} from '../../constants/focus';

import { ProgressRing } from '../common/ProgressRing';
import { Icon } from '../common/Icon';

interface FocusActiveBannerProps {
  active: ActiveFocusState;
  onPress: () => void;
}

const RING_SIZE = moderateScale(44);
const RING_STROKE = moderateScale(4);
const PULSE_DURATION = durations.long * 1.5;

/**
 * Sticky-feel banner shown directly under the hero whenever a focus
 * session is running or paused. Carries a mini progress ring + remaining
 * time so the user can pick up where they left off without navigating.
 *
 * The border subtly pulses while the session is running to draw the eye
 * back to the unfinished work.
 */
export const FocusActiveBanner: React.FC<FocusActiveBannerProps> = ({
  active,
  onPress,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const phaseColor = getFocusPhaseColor(active.phase, theme);
  const progress = remainingProgress(active.secondsRemaining, active.totalSeconds);
  const isRunning = active.status === 'running';

  // Subtle border-opacity pulse — only animates while running so a paused
  // session reads as static. We cancel the animation on unmount and when
  // the running flag flips so the worklet doesn't keep ticking.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (!isRunning) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(0.4, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(pulse);
  }, [isRunning]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const phaseLabel = FOCUS_PHASE_LABELS[active.phase];
  const a11yLabel = `Focus session ${active.status} — ${formatTimerDisplay(active.secondsRemaining)} left. Tap to view.`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
      accessible
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <Animated.View style={[styles.borderOverlay, pulseStyle]} pointerEvents="none" />

      <ProgressRing
        progress={progress}
        size={RING_SIZE}
        strokeWidth={RING_STROKE}
        color={phaseColor}
        trackColor={theme.colors.border}
      >
        <Text style={styles.ringEmoji}>🎯</Text>
      </ProgressRing>

      <View style={styles.body}>
        <Text style={[theme.text.labelSmall, styles.phaseLabel]}>{phaseLabel}</Text>
        <Text style={[theme.text.h4, styles.timeText]}>
          {formatTimerDisplay(active.secondsRemaining)} left
        </Text>
      </View>

      <Icon
        name="chevron-right"
        size={iconSizes.lg}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: borderRadius.xl,
      backgroundColor: theme.colors.primaryContainer,
    },
    borderOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
      borderColor: theme.colors.primary,
    },
    ringEmoji: {
      fontSize: iconSizes.md,
    },
    body: {
      flex: 1,
    },
    phaseLabel: {
      color: theme.colors.primary,
    },
    timeText: {
      color: theme.colors.textPrimary,
      fontWeight: fontWeights.bold,
      marginTop: spacing['3xs'],
    },
  });
