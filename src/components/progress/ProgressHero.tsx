import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { avatarSizes, borderWidths, iconSizes } from '../../theme/tokens';
import { letterSpacings } from '../../theme/typography';
import { getLevelTitle } from '../../utils/dateUtils';
import { moderateScale } from '../../utils/responsive';

import { Icon } from '../common/Icon';
import { ProgressBar } from '../common/ProgressBar';
import { ProgressRing } from '../common/ProgressRing';

interface ProgressHeroProps {
  profileName?: string;
  avatarEmoji: string;
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  xpInLevel: number;
  xpForLevel: number;
  xpProgress: number;
  currentStreak: number;
  longestStreak: number;
}

const AVATAR_SIZE = avatarSizes.xl;
const RING_STROKE = moderateScale(4);
const RING_PADDING = RING_STROKE * 4;

/**
 * Hero section of the Progress screen. Mirrors the visual contract of
 * `HomeHero` (avatar wrapped in a `ProgressRing` showing XP-to-next-level)
 * but adds a full XP bar with explicit "X / Y" numbers underneath, plus a
 * "best streak" subline so the user can see their personal best at a
 * glance even when the current streak is shorter.
 */
export const ProgressHero: React.FC<ProgressHeroProps> = ({
  profileName,
  avatarEmoji,
  level,
  totalXP,
  xpToNextLevel,
  xpInLevel,
  xpForLevel,
  xpProgress,
  currentStreak,
  longestStreak,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const avatarGlowStyle = useMemo<ViewStyle>(
    () => theme.shadows.glow(theme.colors.primary),
    [theme]
  );

  const showsBestStreak = longestStreak > currentStreak && longestStreak > 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.avatarWrapper, avatarGlowStyle]}>
          <ProgressRing
            progress={xpProgress}
            size={AVATAR_SIZE + RING_PADDING}
            strokeWidth={RING_STROKE}
            color={theme.colors.primary}
            trackColor={theme.colors.border}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.summary}>
          <Text style={[theme.text.labelSmall, styles.levelLabel]} numberOfLines={1}>
            LEVEL {level} · {getLevelTitle(level).toUpperCase()}
          </Text>
          <Text style={[theme.text.h2, styles.profileName]} numberOfLines={1}>
            {profileName ?? 'Pilot'}
          </Text>
          <Text style={[theme.text.xpDisplay, styles.xpDisplay]}>
            {totalXP.toLocaleString()} <Text style={styles.xpUnit}>XP</Text>
          </Text>
        </View>

        <View
          style={styles.streakChip}
          accessible
          accessibilityLabel={`${currentStreak} day streak`}
        >
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[theme.text.h3, styles.streakNumber]}>{currentStreak}</Text>
          <Text style={[theme.text.labelSmall, styles.streakLabel]}>DAYS</Text>
        </View>
      </View>

      <View style={styles.xpBlock}>
        <View style={styles.xpHeader}>
          <Text style={[theme.text.labelSmall, styles.xpHeaderLabel]}>LEVEL {level} PROGRESS</Text>
          <Text style={[theme.text.labelMedium, styles.xpHeaderValue]}>
            {xpInLevel.toLocaleString()} / {xpForLevel.toLocaleString()} XP
          </Text>
        </View>
        <ProgressBar progress={xpProgress} color={theme.colors.primary} style={styles.xpBar} />
        <View style={styles.xpFooter}>
          <Icon name="trending-up" size={iconSizes.sm} color={theme.colors.textSecondary} />
          <Text style={[theme.text.bodySmall, styles.xpFooterText]}>
            {xpToNextLevel.toLocaleString()} XP to Level {level + 1}
          </Text>
          {showsBestStreak && (
            <Text
              style={[theme.text.bodySmall, styles.bestStreak]}
              accessible
              accessibilityLabel={`Best streak ${longestStreak} days`}
            >
              · Best {longestStreak}d
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.cardElevated,
      borderRadius: borderRadius['2xl'],
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      padding: spacing.md,
      gap: spacing.md,
      ...shadows.sm,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatarWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInner: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarEmoji: {
      fontSize: iconSizes['2xl'],
    },
    summary: {
      flex: 1,
      gap: spacing['3xs'],
    },
    levelLabel: {
      color: theme.colors.primary,
      letterSpacing: letterSpacings.widest,
    },
    profileName: {
      color: theme.colors.textPrimary,
    },
    xpDisplay: {
      color: theme.colors.textPrimary,
    },
    xpUnit: {
      color: theme.colors.primary,
    },
    streakChip: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.warningContainer,
      gap: spacing['3xs'],
    },
    streakEmoji: {
      fontSize: iconSizes.lg,
    },
    streakNumber: {
      color: theme.colors.streakFire,
    },
    streakLabel: {
      color: theme.colors.streakFire,
      letterSpacing: letterSpacings.wider,
    },
    xpBlock: {
      gap: spacing.xs,
    },
    xpHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    xpHeaderLabel: {
      color: theme.colors.textTertiary,
    },
    xpHeaderValue: {
      color: theme.colors.primary,
    },
    xpBar: {
      marginTop: spacing['3xs'],
    },
    xpFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
    },
    xpFooterText: {
      color: theme.colors.textSecondary,
    },
    bestStreak: {
      color: theme.colors.textTertiary,
    },
  });
