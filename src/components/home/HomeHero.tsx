import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import {
  borderWidths,
  iconSizes,
  avatarSizes,
  opacity as opacityTokens,
  hitSlop,
} from '../../theme/tokens';
import { letterSpacings } from '../../theme/typography';
import { formatHomeHeaderDate, getTimeGreeting, getLevelTitle } from '../../utils/dateUtils';
import { moderateScale } from '../../utils/responsive';

import { Icon } from '../common/Icon';
import { ProgressRing } from '../common/ProgressRing';

interface HomeHeroProps {
  profileName?: string;
  avatarEmoji: string;
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  xpProgress: number;
  currentStreak: number;
  onSettingsPress: () => void;
  onAvatarPress: () => void;
  avatarAnimStyle: ViewStyle;
}

const SETTINGS_BTN_SIZE = moderateScale(40);
const AVATAR_SIZE = avatarSizes.xl;
const RING_STROKE = moderateScale(3);
const EDIT_BADGE_SIZE = moderateScale(20);

/**
 * Top section of the home screen — combines the previous header and XP
 * card into a single statement of "who you are right now". The avatar is
 * wrapped in a {@link ProgressRing} that visualises XP-to-next-level, so
 * the ring serves as the progress bar without needing a second strip below.
 */
export const HomeHero: React.FC<HomeHeroProps> = ({
  profileName,
  avatarEmoji,
  level,
  totalXP,
  xpToNextLevel,
  xpProgress,
  currentStreak,
  onSettingsPress,
  onAvatarPress,
  avatarAnimStyle,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const avatarGlowStyle = useMemo<ViewStyle>(
    () => theme.shadows.glow(theme.colors.primary),
    [theme]
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={[theme.text.labelSmall, styles.dateLabel]}>{formatHomeHeaderDate()}</Text>
          <Text style={[theme.text.displayMedium, styles.greeting]} accessibilityRole="header">
            {getTimeGreeting(profileName)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsBtn}
          hitSlop={hitSlop.md}
          accessible
          accessibilityLabel="Open settings"
          accessibilityRole="button"
        >
          <Icon name="settings" size={iconSizes.lg} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={opacityTokens.full}
          accessible
          accessibilityLabel="Edit your profile"
          accessibilityRole="button"
          style={styles.avatarTouchable}
        >
          <Animated.View style={[styles.avatarWrapper, avatarGlowStyle, avatarAnimStyle]}>
            <ProgressRing
              progress={xpProgress}
              size={AVATAR_SIZE + RING_STROKE * 4}
              strokeWidth={RING_STROKE}
              color={theme.colors.primary}
              trackColor={theme.colors.border}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
              </View>
            </ProgressRing>
            <View style={styles.editBadge}>
              <Icon name="edit-2" size={moderateScale(10)} color={theme.colors.textOnPrimary} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.statBlock}>
          <Text style={[theme.text.labelSmall, styles.levelLabel]} numberOfLines={1}>
            LEVEL {level} · {getLevelTitle(level).toUpperCase()}
          </Text>
          <Text style={[theme.text.xpDisplay, styles.xpDisplay]}>
            {totalXP.toLocaleString()} <Text style={styles.xpUnit}>XP</Text>
          </Text>
          <Text style={[theme.text.labelSmall, styles.xpToGo]}>{xpToNextLevel} TO NEXT LEVEL</Text>
        </View>

        <View style={styles.streakChip} accessibilityLabel={`${currentStreak} day streak`}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[theme.text.h3, styles.streakNumber]}>{currentStreak}</Text>
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
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    greetingBlock: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    dateLabel: {
      color: theme.colors.textSecondary,
    },
    greeting: {
      color: theme.colors.textPrimary,
      marginTop: spacing['2xs'],
    },
    settingsBtn: {
      width: SETTINGS_BTN_SIZE,
      height: SETTINGS_BTN_SIZE,
      borderRadius: SETTINGS_BTN_SIZE / 2,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatarTouchable: {
      alignItems: 'center',
      justifyContent: 'center',
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
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: EDIT_BADGE_SIZE,
      height: EDIT_BADGE_SIZE,
      borderRadius: EDIT_BADGE_SIZE / 2,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: borderWidths.base,
      borderColor: theme.colors.cardElevated,
    },
    statBlock: {
      flex: 1,
      gap: spacing['3xs'],
    },
    levelLabel: {
      color: theme.colors.primary,
      letterSpacing: letterSpacings.widest,
    },
    xpDisplay: {
      color: theme.colors.textPrimary,
    },
    xpUnit: {
      color: theme.colors.primary,
    },
    xpToGo: {
      color: theme.colors.textTertiary,
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
  });
