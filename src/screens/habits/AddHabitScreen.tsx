import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAddHabitScreen } from '../../hooks/useAddHabitScreen';
import { Button } from '../../components/common/Button';
import {
  HABIT_EMOJIS,
  HABIT_COLORS,
  HABIT_CATEGORIES,
  HABIT_FREQUENCY_OPTIONS,
} from '../../constants/habitForm';
import { withAlpha } from '../../utils/color';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';

export const AddHabitScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    title,
    emoji,
    category,
    frequency,
    color,
    isEditing,
    canSave,
    setTitle,
    handleSelectEmoji,
    handleSelectColor,
    handleSelectCategory,
    handleSelectFrequency,
    handleSave,
    handleArchive,
    handleCancel,
  } = useAddHabitScreen();

  // Habit colour drives a few accents (preview ring, title underline,
  // emoji-chip outline). They're memoized so we don't allocate new objects
  // every render — only when the user changes the colour.
  const previewRingStyle = useMemo<ViewStyle>(
    () => ({ backgroundColor: withAlpha(color, 0.2), borderColor: color }),
    [color]
  );
  const titleUnderlineStyle = useMemo<ViewStyle>(
    () => ({ borderBottomColor: title ? color : theme.colors.border }),
    [color, title, theme]
  );
  const emojiChipActiveStyle = useMemo<ViewStyle>(
    () => ({ backgroundColor: withAlpha(color, 0.2), borderColor: color }),
    [color]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[theme.text.bodyMedium, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.text.h4, styles.headerTitle]}>
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </Text>
          <Button label="Save" onPress={handleSave} variant="primary" size="sm" disabled={!canSave} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.emojiPreview}>
            <View style={[styles.emojiCircle, previewRingStyle]}>
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
          </View>

          <TextInput
            style={[styles.titleInput, titleUnderlineStyle]}
            placeholder="Habit name…"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus={!isEditing}
            returnKeyType="done"
            accessible
            accessibilityLabel="Habit title"
          />

          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, styles.sectionLabel]}>EMOJI</Text>
            <View style={styles.emojiGrid}>
              {HABIT_EMOJIS.map((e) => {
                const selected = emoji === e;
                return (
                  <TouchableOpacity
                    key={e}
                    onPress={() => handleSelectEmoji(e)}
                    style={[
                      styles.emojiChip,
                      selected ? emojiChipActiveStyle : styles.emojiChipInactive,
                    ]}
                  >
                    <Text style={styles.emojiChipText}>{e}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, styles.sectionLabel]}>COLOR</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((c) => {
                const selected = color === c;
                const dotStyle: ViewStyle = {
                  backgroundColor: c,
                  borderWidth: selected ? borderWidths.extraThick : 0,
                };
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => handleSelectColor(c)}
                    style={[styles.colorDot, dotStyle]}
                    accessibilityLabel={`Color ${c}`}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, styles.sectionLabel]}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {HABIT_CATEGORIES.map((cat) => {
                const selected = category === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => handleSelectCategory(cat.key)}
                    style={[
                      styles.categoryChip,
                      selected ? styles.chipActive : styles.chipInactive,
                    ]}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        theme.text.labelSmall,
                        selected ? styles.chipLabelActive : styles.chipLabelInactive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, styles.sectionLabel]}>FREQUENCY</Text>
            <View style={styles.freqRow}>
              {HABIT_FREQUENCY_OPTIONS.map((opt) => {
                const selected = frequency === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => handleSelectFrequency(opt.key)}
                    style={[
                      styles.freqChip,
                      selected ? styles.chipActive : styles.chipInactive,
                    ]}
                  >
                    <Text
                      style={[
                        theme.text.labelMedium,
                        selected ? styles.freqLabelActive : styles.freqLabelInactive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={[theme.text.bodySmall, styles.freqDesc]}>{opt.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {isEditing && (
            <Button
              label="Archive Habit"
              onPress={handleArchive}
              variant="ghost"
              size="md"
              fullWidth
              style={styles.archiveBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex1: { flex: 1 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: borderWidths.hairline,
      borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    cancelText: { color: theme.colors.textSecondary },
    headerTitle: { color: theme.colors.textPrimary },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing['9xl'],
    },
    emojiPreview: { alignItems: 'center' },
    emojiCircle: {
      width: controlSizes.emojiCircle,
      height: controlSizes.emojiCircle,
      borderRadius: controlSizes.emojiCircle / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: borderWidths.thick,
    },
    previewEmoji: { fontSize: iconSizes['4xl'] },
    titleInput: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      borderBottomWidth: borderWidths.thick,
      paddingBottom: spacing.xs,
      color: theme.colors.textPrimary,
    },
    section: { gap: spacing.xs },
    sectionLabel: { color: theme.colors.textTertiary },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    emojiChip: {
      width: controlSizes.emojiChip,
      height: controlSizes.emojiChip,
      borderRadius: borderRadius.md,
      borderWidth: borderWidths.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiChipInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    emojiChipText: { fontSize: iconSizes.xl },
    colorRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    colorDot: {
      width: controlSizes.colorDot,
      height: controlSizes.colorDot,
      borderRadius: controlSizes.colorDot / 2,
      borderColor: 'white',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: borderWidths.thin,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    chipInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    chipLabelActive: { color: theme.colors.primaryLight },
    chipLabelInactive: { color: theme.colors.textSecondary },
    categoryEmoji: { fontSize: iconSizes.md },
    freqRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    freqChip: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
      alignItems: 'center',
    },
    freqLabelActive: {
      color: theme.colors.primaryLight,
      textAlign: 'center',
    },
    freqLabelInactive: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    freqDesc: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    archiveBtn: { marginTop: spacing.xs },
  });
