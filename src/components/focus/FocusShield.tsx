import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { focusShieldService } from '../../services/FocusShieldService';
import { spacing, borderRadius } from '../../theme/spacing';
import { moderateScale } from '../../utils/responsive';

interface FocusShieldProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export const FocusShield: React.FC<FocusShieldProps> = ({ isActive, onToggle }) => {
  const theme = useAppTheme();
  const haptics = useHaptics();

  // Pulse animation for the shield glow when active
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shieldScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withTiming(1, { duration: 400 });
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(glowScale);
      glowScale.value = withSpring(1);
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const glowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const shieldAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));

  const handleToggle = async () => {
    haptics.heavy();
    shieldScale.value = withSpring(0.9, { damping: 8 }, () => {
      shieldScale.value = withSpring(1);
    });

    if (!isActive) {
      Alert.alert(
        '🛡️ Activate Focus Shield?',
        'This will:\n\n• Silence all NeuroPilot notifications\n• Open your system Do Not Disturb settings so you can block all calls and alerts\n\nYour phone will be distraction-free for your entire session.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Activate Shield',
            onPress: async () => {
              haptics.achievement();
              onToggle(true);
              await focusShieldService.activate();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '🛡️ Deactivate Focus Shield?',
        'All notifications will be restored. Remember to manually turn off Do Not Disturb if you enabled it.',
        [
          { text: 'Keep Shield On', style: 'cancel' },
          {
            text: 'Deactivate',
            style: 'destructive',
            onPress: async () => {
              haptics.medium();
              onToggle(false);
              await focusShieldService.deactivate();
            },
          },
        ]
      );
    }
  };

  const openDNDSettings = async () => {
    haptics.light();
    await focusShieldService.openDNDSettings();
  };

  const activeColor = '#2A9DB5';
  const inactiveColor = theme.colors.border;

  return (
    <View style={styles.container}>
      {/* Section label */}
      <Text style={[styles.label, { color: theme.colors.textTertiary }]}>FOCUS SHIELD</Text>

      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.9}
        accessible
        accessibilityRole="switch"
        accessibilityState={{ checked: isActive }}
        accessibilityLabel="Focus Shield — blocks all distractions"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: isActive
                ? 'rgba(42, 157, 181, 0.12)'
                : theme.colors.card,
              borderColor: isActive ? activeColor : inactiveColor,
            },
          ]}
        >
          {/* Pulsing glow ring behind shield icon */}
          <View style={styles.iconWrapper}>
            <Animated.View
              style={[
                styles.glowRing,
                { borderColor: activeColor },
                glowAnimStyle,
              ]}
            />
            <Animated.View style={shieldAnimStyle}>
              <Text style={styles.shieldEmoji}>{isActive ? '🛡️' : '🔓'}</Text>
            </Animated.View>
          </View>

          {/* Text content */}
          <View style={styles.textBlock}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {isActive ? 'Shield Active' : 'Focus Shield'}
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {isActive
                ? 'All notifications silenced. Stay in the zone.'
                : 'Block all calls, alerts, and distractions'}
            </Text>
          </View>

          {/* Toggle pill */}
          <View
            style={[
              styles.togglePill,
              { backgroundColor: isActive ? activeColor : theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: isActive ? moderateScale(14) : 0 }] },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* DND shortcut — shows only when active */}
      {isActive && (
        <TouchableOpacity
          onPress={openDNDSettings}
          style={[styles.dndLink, { borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Open Do Not Disturb settings"
        >
          <Text style={{ fontSize: moderateScale(13) }}>📵</Text>
          <Text style={[styles.dndText, { color: activeColor }]}>
            Open Do Not Disturb settings
          </Text>
          <Text style={{ color: theme.colors.textTertiary, fontSize: moderateScale(13) }}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[0.5],
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: spacing[0.5],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    padding: spacing[1.5],
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
  },
  iconWrapper: {
    width: moderateScale(52),
    height: moderateScale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    borderWidth: 1.5,
  },
  shieldEmoji: {
    fontSize: moderateScale(30),
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  description: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(17),
  },
  togglePill: {
    width: moderateScale(40),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    padding: moderateScale(3),
    justifyContent: 'center',
  },
  toggleThumb: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: '#FFFFFF',
  },
  dndLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[1.5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing[0.5],
  },
  dndText: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
});
