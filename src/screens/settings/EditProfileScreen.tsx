import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { moderateScale } from '../../utils/responsive';
import { UserMode } from '../../types';

const AVATARS = ['🧠', '🚀', '⚡', '🎯', '🌊', '🦋', '🔥', '✨', '🎮', '🌟', '🦁', '🐬', '🦅', '🌈', '💎'];

export const EditProfileScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<any>();
  const { profile, updateProfile, updateSettings } = useAppStore();

  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🧠');
  const [mode, setMode] = useState<UserMode>(profile?.mode ?? 'adult');
  const [isSaving, setIsSaving] = useState(false);

  const scale = useSharedValue(1);
  const avatarAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleSelectAvatar = (a: string) => {
    haptics.light();
    setAvatar(a);
    scale.value = withSpring(1.3, { damping: 8 }, () => {
      scale.value = withSpring(1);
    });
  };

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name to continue.');
      return;
    }
    haptics.achievement();
    setIsSaving(true);

    updateProfile({ name: name.trim(), avatar, mode });
    updateSettings({ userMode: mode });

    setTimeout(() => {
      setIsSaving(false);
      navigation.goBack();
    }, 400);
  }, [name, avatar, mode, updateProfile, updateSettings, haptics, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[theme.text.bodyLarge, { color: theme.colors.primary }]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={isSaving || !name.trim()}
          accessibilityLabel="Save profile"
          accessibilityRole="button"
        >
          <Text
            style={[
              theme.text.bodyLarge,
              { color: !name.trim() ? theme.colors.textTertiary : theme.colors.primary, fontWeight: '700' },
            ]}
          >
            {isSaving ? '...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Preview */}
        <View style={styles.avatarPreviewSection}>
          <Animated.View
            style={[
              styles.avatarPreviewCircle,
              { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary, ...shadows.glow(theme.colors.primary) },
              avatarAnimStyle,
            ]}
          >
            <Text style={styles.avatarPreviewEmoji}>{avatar}</Text>
          </Animated.View>
          <Text style={[theme.text.h3, { color: theme.colors.textPrimary, marginTop: spacing[1] }]}>
            {name.trim() || 'Your Name'}
          </Text>
          <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary }]}>
            {mode === 'child' ? '👶 Child Mode' : '💼 Adult Mode'}
          </Text>
        </View>

        {/* Name Field */}
        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, { color: theme.colors.primary, marginBottom: spacing[1] }]}>
            DISPLAY NAME
          </Text>
          <Card noPadding>
            <TextInput
              style={[
                styles.nameInput,
                {
                  color: theme.colors.textPrimary,
                  borderColor: name ? theme.colors.primary : theme.colors.border,
                  backgroundColor: theme.colors.card,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Your name or nickname…"
              placeholderTextColor={theme.colors.textTertiary}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              accessibilityLabel="Name input"
              maxLength={30}
            />
          </Card>
          <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginTop: spacing[0.5], textAlign: 'right' }]}>
            {name.length}/30
          </Text>
        </View>

        {/* Mode Selector */}
        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, { color: theme.colors.primary, marginBottom: spacing[1] }]}>
            APP MODE
          </Text>
          <View style={styles.modeRow}>
            {([
              { key: 'adult' as UserMode, emoji: '💼', label: 'Adult', desc: 'Professional & focused' },
              { key: 'child' as UserMode, emoji: '🌈', label: 'Child', desc: 'Fun & encouraging' },
            ] as const).map((opt) => {
              const isSelected = mode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => { haptics.medium(); setMode(opt.key); }}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.card,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      ...(isSelected ? shadows.glow(theme.colors.primary) : {}),
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={{ fontSize: moderateScale(32) }}>{opt.emoji}</Text>
                  <Text style={[theme.text.h4, { color: theme.colors.textPrimary, marginTop: spacing[0.5] }]}>
                    {opt.label}
                  </Text>
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                    {opt.desc}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={{ color: '#FFF', fontSize: moderateScale(10), fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Avatar Picker */}
        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, { color: theme.colors.primary, marginBottom: spacing[1] }]}>
            CHOOSE AVATAR
          </Text>
          <Card>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => {
                const isSelected = avatar === a;
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => handleSelectAvatar(a)}
                    style={[
                      styles.avatarChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    accessibilityLabel={`Select avatar ${a}`}
                  >
                    <Text style={{ fontSize: moderateScale(24) }}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Save Button */}
        <Button
          label={isSaving ? 'Saving…' : 'Save Changes'}
          onPress={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSaving || !name.trim()}
          style={{ marginTop: spacing[1] }}
        />

        <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
          Changes are saved locally on your device
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    minWidth: moderateScale(60),
  },
  saveBtn: {
    minWidth: moderateScale(60),
    alignItems: 'flex-end',
  },
  content: {
    padding: spacing[2],
    gap: spacing[2],
    paddingBottom: spacing[6],
  },
  avatarPreviewSection: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[0.5],
  },
  avatarPreviewCircle: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewEmoji: {
    fontSize: moderateScale(52),
  },
  section: {
    gap: 0,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    fontSize: moderateScale(17),
    fontWeight: '500',
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[1.5],
  },
  modeCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    padding: spacing[1.5],
    alignItems: 'center',
    gap: moderateScale(4),
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: moderateScale(8),
    right: moderateScale(8),
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
    justifyContent: 'center',
  },
  avatarChip: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
