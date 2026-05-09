import React, { useEffect, useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { durations } from '../../theme/tokens';
import {
  computeCircleGeometry,
  dashOffsetForProgress,
} from '../../utils/svgGeometry';

interface ProgressRingProps {
  /** 0..1 fraction of the ring that should appear filled. */
  progress: number;
  size: number;
  strokeWidth: number;
  /** Stroke colour of the active arc. Defaults to the theme primary. */
  color?: string;
  /** Stroke colour of the unfilled track. Defaults to the theme border. */
  trackColor?: string;
  /** Optional content (e.g. an avatar) rendered centred inside the ring. */
  children?: React.ReactNode;
  /** Whether to ease the progress change. Off when used as a static badge. */
  animated?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Generic stroked progress ring built on `react-native-svg`. Reused by the
 * focus `CircularTimer` (countdown) and the home hero avatar (XP-to-next-
 * level), so all rings in the app behave identically.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size,
  strokeWidth,
  color,
  trackColor,
  children,
  animated = true,
}) => {
  const theme = useAppTheme();
  const ringColor = color ?? theme.colors.primary;
  const ringTrack = trackColor ?? theme.colors.border;

  const { radius, circumference, cx, cy } = useMemo(
    () => computeCircleGeometry(size, strokeWidth),
    [size, strokeWidth]
  );

  const clamped = Math.min(1, Math.max(0, progress));
  const dashOffset = useSharedValue(dashOffsetForProgress(circumference, clamped));

  useEffect(() => {
    const target = dashOffsetForProgress(circumference, clamped);
    dashOffset.value = animated
      ? withTiming(target, { duration: durations.slower, easing: Easing.out(Easing.cubic) })
      : target;
  }, [clamped, circumference, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [size]
  );

  return (
    <View style={containerStyle}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {children}
    </View>
  );
};
