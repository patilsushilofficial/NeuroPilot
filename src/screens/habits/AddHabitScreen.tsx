import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Button } from '../../components/common/Button';
import { HabitCategory, HabitFrequency } from '../../types';
import { spacing, borderRadius } from '../../theme/spacing';

const HABIT_EMOJIS = ['💪', '🧘', '📚', '🏃', '💧', '🌿', '🎯', '✍️', '🧹', '🛌', '🥗', '🎮', '🎵', '🌅', '🙏'];
const HABIT_COLORS = ['#7B6CF6', '#4ECDC4', '#FF6B6B', '#FFD43B', '#51CF66', '#FF8C42', '#A9DEF9', '#E27396'];

const CATEGORIES: Array<{ key: HabitCategory; emoji: string; label: string }> = [
  { key: 'health', emoji: '💊', label: 'Health' },
  { key: 'focus', emoji: '🎯', label: 'Focus' },
  { key: 'movement', emoji: '🏃', label: 'Movement' },
  { key: 'mindfulness', emoji: '🧘', label: 'Mindfulness' },
  { key: 'sleep', emoji: '🛌', label: 'Sleep' },
  { key: 'social', emoji: '👥', label: 'Social' },
  { key: 'routine', emoji: '📋', label: 'Routine' },
  { key: 'custom', emoji: '⭐', label: 'Custom' },
];

const FREQUENCY_OPTIONS: Array<{ key: HabitFrequency; label: string; desc: string }> = [
  { key: 'daily', label: 'Every Day', desc: 'Daily' },
  { key: 'weekdays', label: 'Weekdays', desc: 'Mon–Fri' },
  { key: 'weekends', label: 'Weekends', desc: 'Sat–Sun' },
];

export const AddHabitScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editHabitId = route.params?.habitId;

  const { addHabit, updateHabit, archiveHabit, getHabitById } = useAppStore();
  const existingHabit = editHabitId ? getHabitById(editHabitId) : undefined;

  const [title, setTitle] = useState(existingHabit?.title ?? '');
  const [emoji, setEmoji] = useState(existingHabit?.emoji ?? '💪');
  const [category, setCategory] = useState<HabitCategory>(existingHabit?.category ?? 'routine');
  const [frequency, setFrequency] = useState<HabitFrequency>(existingHabit?.frequency ?? 'daily');
  const [color, setColor] = useState(existingHabit?.color ?? HABIT_COLORS[0]);
  const [reminderTime, setReminderTime] = useState(existingHabit?.reminderTime ?? '');

  const isEditing = !!existingHabit;
  const canSave = title.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    haptics.success();
    const payload = { title: title.trim(), emoji, category, frequency, color, reminderTime: reminderTime || undefined };

    if (isEditing && editHabitId) {
      updateHabit(editHabitId, payload);
    } else {
      addHabit({ ...payload, description: undefined, customDays: undefined });
    }
    navigation.goBack();
  }, [title, emoji, category, frequency, color, reminderTime, isEditing, editHabitId, addHabit, updateHabit, haptics, navigation, canSave]);

  const handleArchive = useCallback(() => {
    Alert.alert('Archive Habit', 'This will hide the habit from your daily list but keep your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: () => {
          haptics.warning();
          archiveHabit(editHabitId);
          navigation.goBack();
        },
      },
    ]);
  }, [editHabitId, archiveHabit, haptics, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[theme.text.bodyMedium, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </Text>
          <Button label="Save" onPress={handleSave} variant="primary" size="sm" disabled={!canSave} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Emoji Preview */}
          <View style={styles.emojiPreview}>
            <View style={[styles.emojiCircle, { backgroundColor: color + '33', borderColor: color }]}>
              <Text style={{ fontSize: 40 }}>{emoji}</Text>
            </View>
          </View>

          {/* Title */}
          <TextInput
            style={[styles.titleInput, { color: theme.colors.textPrimary, borderBottomColor: title ? color : theme.colors.border }]}
            placeholder="Habit name…"
            placeholderTextColor={theme.colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus={!isEditing}
            returnKeyType="done"
            accessible accessibilityLabel="Habit title"
          />

          {/* Emoji Picker */}
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>EMOJI</Text>
            <View style={styles.emojiGrid}>
              {HABIT_EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => { haptics.light(); setEmoji(e); }}
                  style={[styles.emojiChip, { backgroundColor: emoji === e ? color + '33' : theme.colors.card, borderColor: emoji === e ? color : theme.colors.border }]}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>COLOR</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { haptics.light(); setColor(c); }}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: 'white' }]}
                />
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => { haptics.light(); setCategory(cat.key); }}
                  style={[styles.categoryChip, { backgroundColor: category === cat.key ? theme.colors.primaryContainer : theme.colors.card, borderColor: category === cat.key ? theme.colors.primary : theme.colors.border }]}
                >
                  <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                  <Text style={[theme.text.labelSmall, { color: category === cat.key ? theme.colors.primaryLight : theme.colors.textSecondary }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary }]}>FREQUENCY</Text>
            <View style={styles.freqRow}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => { haptics.light(); setFrequency(opt.key); }}
                  style={[styles.freqChip, { flex: 1, backgroundColor: frequency === opt.key ? theme.colors.primaryContainer : theme.colors.card, borderColor: frequency === opt.key ? theme.colors.primary : theme.colors.border }]}
                >
                  <Text style={[theme.text.labelMedium, { color: frequency === opt.key ? theme.colors.primaryLight : theme.colors.textPrimary, textAlign: 'center' }]}>
                    {opt.label}
                  </Text>
                  <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
                    {opt.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isEditing && (
            <Button label="Archive Habit" onPress={handleArchive} variant="ghost" size="md" fullWidth style={{ marginTop: spacing[1] }} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[2], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)' },
  content: { padding: spacing[2], gap: spacing[2], paddingBottom: 100 },
  emojiPreview: { alignItems: 'center' },
  emojiCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  titleInput: { fontSize: 22, fontWeight: '600', borderBottomWidth: 2, paddingBottom: spacing[1] },
  section: { gap: 10 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiChip: { width: 48, height: 48, borderRadius: borderRadius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1 },
  freqRow: { flexDirection: 'row', gap: spacing[1] },
  freqChip: { padding: spacing[1.5], borderRadius: borderRadius.xl, borderWidth: 1.5, alignItems: 'center' },
});
