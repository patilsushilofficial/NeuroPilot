import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '../components/common/Icon';
import { useAppTheme } from '../hooks/useAppTheme';
import { Theme } from '../theme';
import { spacing, borderRadius } from '../theme/spacing';
import { borderWidths, durations, hitSlop, iconSizes, opacity, springs } from '../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../theme/typography';
import { moderateScale } from '../utils/responsive';
import type { TabItem } from '../constants/tabBar';

/** Diameter of the rounded background that wraps the icon when active. */
const ICON_PILL_SIZE = moderateScale(40);
/** Diameter of the live "session running" dot pinned to the Focus icon. */
const RUNNING_DOT_SIZE = moderateScale(8);
const RUNNING_DOT_HALO = RUNNING_DOT_SIZE + moderateScale(4);

interface TabBarItemProps {
  item: TabItem;
  focused: boolean;
  onPress: () => void;
  /**
   * Renders a small live-status dot pinned to the icon. The bar passes
   * `true` for the Focus tab while a session is running so the user gets a
   * persistent cue regardless of which tab they're on.
   */
  showRunningIndicator?: boolean;
}

/**
 * Single tab in the bottom navigation. Pure presentation:
 * the bar passes a precomputed `onPress` handler and the focus state, and
 * we own the visual treatment (icon pill animation + label + optional
 * running dot). No store reads, no navigation calls.
 */
export const TabBarItem: React.FC<TabBarItemProps> = ({
  item,
  focused,
  onPress,
  showRunningIndicator = false,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Drive the icon pill's reveal as a single 0→1 progress so we can lerp
  // both the scale (snap) and the opacity (fade) off the same value —
  // keeps the bg from popping in before the icon settles.
  const pillProgress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    pillProgress.value = withSpring(focused ? 1 : 0, springs.gentle);
  }, [focused, pillProgress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillProgress.value,
    transform: [{ scale: 0.6 + 0.4 * pillProgress.value }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={item.label}
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={opacity.pressed}
      hitSlop={hitSlop.sm}
    >
      <View style={styles.iconWrap}>
        <Animated.View pointerEvents="none" style={[styles.iconPill, pillStyle]} />
        <Icon
          name={item.icon}
          size={iconSizes.lg}
          color={focused ? theme.colors.primary : theme.colors.textSecondary}
        />
        {showRunningIndicator && <RunningIndicator theme={theme} />}
      </View>
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Soft pulsing dot pinned to the Focus icon while a session is counting
 * down. Same visual vocabulary as `FocusActiveBanner` so the cue reads as
 * "session is alive" wherever it appears.
 */
const RunningIndicator: React.FC<{ theme: Theme }> = ({ theme }) => {
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Halo expands & fades out; the inner dot stays solid so the cue is
  // legible even when the halo is mid-animation or fully transparent.
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.6);

  useEffect(() => {
    haloScale.value = withRepeat(
      withTiming(1.6, {
        duration: durations.long,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      false
    );
    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(0, {
          duration: durations.long,
          easing: Easing.out(Easing.quad),
        })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(haloScale);
      cancelAnimation(haloOpacity);
    };
  }, [haloScale, haloOpacity]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  return (
    <View
      pointerEvents="none"
      style={styles.runningWrap}
      // Position the dot on the icon's top-right corner. The accessible
      // status itself lives on the parent TouchableOpacity (Focus tab),
      // so the dot is decorative-only.
      accessible={false}
    >
      <Animated.View
        style={[styles.runningHalo, { backgroundColor: theme.colors.primary }, haloStyle]}
      />
      <View
        style={[
          styles.runningDot,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.cardElevated,
          },
        ]}
      />
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing['3xs'],
      paddingVertical: spacing['2xs'],
    },
    iconWrap: {
      width: ICON_PILL_SIZE,
      height: ICON_PILL_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconPill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primaryContainer,
    },
    label: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.tight,
    },
    labelActive: {
      color: theme.colors.primary,
      fontWeight: fontWeights.bold,
    },
    labelInactive: {
      color: theme.colors.textTertiary,
    },
    runningWrap: {
      position: 'absolute',
      top: -spacing['3xs'],
      right: -spacing['3xs'],
      width: RUNNING_DOT_HALO,
      height: RUNNING_DOT_HALO,
      alignItems: 'center',
      justifyContent: 'center',
    },
    runningHalo: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: borderRadius.full,
    },
    runningDot: {
      width: RUNNING_DOT_SIZE,
      height: RUNNING_DOT_SIZE,
      borderRadius: borderRadius.full,
      borderWidth: borderWidths.thin,
    },
  });
