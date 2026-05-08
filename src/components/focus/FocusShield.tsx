import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useFocusShieldActions } from '../../hooks/useFocusShieldActions';
import { useFocusShieldAnimation } from '../../hooks/useFocusShieldAnimation';
import {
  FOCUS_SHIELD_ACTIVE_COLOR,
  FOCUS_SHIELD_BG_ACTIVE,
} from '../../constants/focusShield';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import {
  borderWidths,
  controlSizes,
  iconSizes,
  opacity,
} from '../../theme/tokens';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';

interface FocusShieldProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export const FocusShield: React.FC<FocusShieldProps> = ({ isActive, onToggle }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { requestToggle, openDNDSettings } = useFocusShieldActions({ isActive, onToggle });
  const { glowAnimStyle, shieldAnimStyle, thumbAnimStyle, pressShield } =
    useFocusShieldAnimation({ isActive });

  const handlePress = () => {
    pressShield();
    requestToggle();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>FOCUS SHIELD</Text>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={opacity.hover}
        accessible
        accessibilityRole="switch"
        accessibilityState={{ checked: isActive }}
        accessibilityLabel="Focus Shield — blocks all distractions"
      >
        <View style={[styles.card, isActive ? styles.cardActive : styles.cardInactive]}>
          {/* Pulsing glow ring behind shield icon */}
          <View style={styles.iconWrapper}>
            <Animated.View style={[styles.glowRing, glowAnimStyle]} />
            <Animated.View style={shieldAnimStyle}>
              <Text style={styles.shieldEmoji}>{isActive ? '🛡️' : '🔓'}</Text>
            </Animated.View>
          </View>

          {/* Text content */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              {isActive ? 'Shield Active' : 'Focus Shield'}
            </Text>
            <Text style={styles.description}>
              {isActive
                ? 'All notifications silenced. Stay in the zone.'
                : 'Block all calls, alerts, and distractions'}
            </Text>
          </View>

          {/* Toggle pill */}
          <View
            style={[styles.togglePill, isActive ? styles.togglePillOn : styles.togglePillOff]}
          >
            <Animated.View style={[styles.toggleThumb, thumbAnimStyle]} />
          </View>
        </View>
      </TouchableOpacity>

      {/* DND shortcut — shows only when active */}
      {isActive && (
        <TouchableOpacity
          onPress={openDNDSettings}
          style={styles.dndLink}
          accessibilityRole="button"
          accessibilityLabel="Open Do Not Disturb settings"
        >
          <Text style={styles.dndIcon}>📵</Text>
          <Text style={styles.dndText}>Open Do Not Disturb settings</Text>
          <Text style={styles.dndChevron}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing['2xs'],
    },
    label: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacings.widest,
      paddingHorizontal: spacing['2xs'],
      color: theme.colors.textTertiary,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
    },
    cardActive: {
      backgroundColor: FOCUS_SHIELD_BG_ACTIVE,
      borderColor: FOCUS_SHIELD_ACTIVE_COLOR,
    },
    cardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    iconWrapper: {
      width: controlSizes.shieldIcon,
      height: controlSizes.shieldIcon,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glowRing: {
      position: 'absolute',
      width: controlSizes.shieldIcon,
      height: controlSizes.shieldIcon,
      borderRadius: controlSizes.shieldIcon / 2,
      borderWidth: borderWidths.base,
      borderColor: FOCUS_SHIELD_ACTIVE_COLOR,
    },
    shieldEmoji: {
      fontSize: iconSizes['3xl'],
    },
    textBlock: {
      flex: 1,
      gap: spacing['3xs'],
    },
    title: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.bold,
      color: theme.colors.textPrimary,
    },
    description: {
      fontSize: fontSizes.sm,
      lineHeight: fontSizes.sm * 1.4,
      color: theme.colors.textSecondary,
    },
    togglePill: {
      width: controlSizes.toggleWidth,
      height: controlSizes.toggleHeight,
      borderRadius: controlSizes.toggleHeight / 2,
      padding: spacing['2xs'] - 1,
      justifyContent: 'center',
    },
    togglePillOn: { backgroundColor: FOCUS_SHIELD_ACTIVE_COLOR },
    togglePillOff: { backgroundColor: theme.colors.border },
    toggleThumb: {
      width: controlSizes.toggleThumb,
      height: controlSizes.toggleThumb,
      borderRadius: controlSizes.toggleThumb / 2,
      backgroundColor: '#FFFFFF',
    },
    dndLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      marginTop: spacing['2xs'],
    },
    dndIcon: { fontSize: iconSizes.sm },
    dndText: {
      flex: 1,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      color: FOCUS_SHIELD_ACTIVE_COLOR,
    },
    dndChevron: {
      color: theme.colors.textTertiary,
      fontSize: iconSizes.sm,
    },
  });
