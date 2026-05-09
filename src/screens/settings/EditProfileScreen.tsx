import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useEditProfileScreen } from '../../hooks/useEditProfileScreen';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PROFILE_AVATARS, USER_MODE_OPTIONS } from '../../constants/profile';
import { Theme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { avatarSizes, borderWidths, iconSizes } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

const CHECK_BADGE_SIZE = moderateScale(22);
const AVATAR_CHIP_SIZE = moderateScale(52);

export const EditProfileScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    name,
    avatar,
    mode,
    isSaving,
    canSave,
    avatarAnimStyle,
    setName,
    handleSelectAvatar,
    handleSelectMode,
    handleSave,
    handleCancel,
  } = useEditProfileScreen();

  // Theme-derived glow shared by the hero avatar and the selected mode card.
  const previewGlowStyle = useMemo<ViewStyle>(
    () => shadows.glow(theme.colors.primary),
    [theme]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={[theme.text.bodyLarge, styles.backText]}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={[theme.text.h4, styles.headerTitle]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={isSaving}
          accessibilityLabel="Save profile"
          accessibilityRole="button"
        >
          <Text
            style={[
              theme.text.bodyLarge,
              styles.saveText,
              canSave ? styles.saveTextEnabled : styles.saveTextDisabled,
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
        <View style={styles.avatarPreviewSection}>
          <Animated.View
            style={[styles.avatarPreviewCircle, previewGlowStyle, avatarAnimStyle]}
          >
            <Text style={styles.avatarPreviewEmoji}>{avatar}</Text>
          </Animated.View>
          <Text style={[theme.text.h3, styles.previewName]}>
            {name.trim() || 'Your Name'}
          </Text>
          <Text style={[theme.text.bodySmall, styles.previewMode]}>
            {mode === 'child' ? '👶 Child Mode' : '💼 Adult Mode'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, styles.sectionHeader]}>DISPLAY NAME</Text>
          <Card noPadding>
            <TextInput
              style={[
                styles.nameInput,
                name ? styles.nameInputActive : styles.nameInputInactive,
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
          <Text style={[theme.text.labelSmall, styles.charCount]}>{name.length}/30</Text>
        </View>

        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, styles.sectionHeader]}>APP MODE</Text>
          <View style={styles.modeRow}>
            {USER_MODE_OPTIONS.map((opt) => {
              const isSelected = mode === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => handleSelectMode(opt.key)}
                  activeOpacity={0.85}
                  style={[
                    styles.modeCard,
                    isSelected ? styles.modeCardActive : styles.modeCardInactive,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.modeEmoji,
                      isSelected ? styles.modeEmojiActive : styles.modeEmojiInactive,
                    ]}
                    allowFontScaling={false}
                  >
                    {opt.emoji}
                  </Text>
                  <Text style={[theme.text.h4, styles.modeLabel]}>{opt.label}</Text>
                  <Text style={[theme.text.bodySmall, styles.modeDesc]}>
                    {opt.shortDescription}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons
                        name="checkmark"
                        size={CHECK_BADGE_SIZE * 0.7}
                        color="#FFF"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[theme.text.labelSmall, styles.sectionHeader]}>CHOOSE AVATAR</Text>
          <Card>
            <View style={styles.avatarGrid}>
              {PROFILE_AVATARS.map((a) => {
                const isSelected = avatar === a;
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => handleSelectAvatar(a)}
                    style={[
                      styles.avatarChip,
                      isSelected ? styles.avatarChipActive : styles.avatarChipInactive,
                    ]}
                    accessibilityLabel={`Select avatar ${a}`}
                  >
                    <Text style={styles.avatarChipText}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        <Button
          label={isSaving ? 'Saving…' : 'Save Changes'}
          onPress={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSaving || !canSave}
          style={styles.bottomSaveBtn}
        />

        <Text style={[theme.text.bodySmall, styles.footerNote]}>
          Changes are saved locally on your device
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: borderWidths.hairline,
      borderBottomColor: theme.colors.border,
    },
    backBtn: { minWidth: moderateScale(60) },
    backText: { color: theme.colors.primary },
    headerTitle: { color: theme.colors.textPrimary },
    saveBtn: {
      minWidth: moderateScale(60),
      alignItems: 'flex-end',
    },
    saveText: { fontWeight: fontWeights.bold },
    saveTextEnabled: { color: theme.colors.primary },
    saveTextDisabled: { color: theme.colors.textTertiary },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing['5xl'],
    },
    avatarPreviewSection: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing['2xs'],
    },
    avatarPreviewCircle: {
      width: avatarSizes['2xl'],
      height: avatarSizes['2xl'],
      borderRadius: avatarSizes['2xl'] / 2,
      borderWidth: borderWidths.thick,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    avatarPreviewEmoji: { fontSize: iconSizes['6xl'] },
    previewName: {
      color: theme.colors.textPrimary,
      marginTop: spacing.xs,
    },
    previewMode: { color: theme.colors.textTertiary },
    section: { gap: 0 },
    sectionHeader: {
      color: theme.colors.primary,
      marginBottom: spacing.xs,
    },
    nameInput: {
      borderWidth: borderWidths.base,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.card,
    },
    nameInputActive: { borderColor: theme.colors.primary },
    nameInputInactive: { borderColor: theme.colors.border },
    charCount: {
      color: theme.colors.textTertiary,
      marginTop: spacing['2xs'],
      textAlign: 'right',
    },
    modeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modeCard: {
      flex: 1,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      gap: spacing['2xs'],
      position: 'relative',
      overflow: 'hidden',
    },
    modeCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    modeCardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    modeEmoji: {
      fontSize: iconSizes['4xl'],
      lineHeight: iconSizes['4xl'] * 1.15,
      textAlign: 'center',
      marginBottom: spacing['2xs'],
    },
    modeEmojiActive: { opacity: 1 },
    modeEmojiInactive: { opacity: 0.85 },
    modeLabel: {
      color: theme.colors.textPrimary,
    },
    modeDesc: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    checkBadge: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: CHECK_BADGE_SIZE,
      height: CHECK_BADGE_SIZE,
      borderRadius: CHECK_BADGE_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderWidth: borderWidths.base,
      borderColor: theme.colors.background,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      justifyContent: 'center',
    },
    avatarChip: {
      width: AVATAR_CHIP_SIZE,
      height: AVATAR_CHIP_SIZE,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
      borderWidth: borderWidths.thick,
    },
    avatarChipInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: borderWidths.thin,
    },
    avatarChipText: { fontSize: iconSizes.xl },
    bottomSaveBtn: { marginTop: spacing.xs },
    footerNote: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
