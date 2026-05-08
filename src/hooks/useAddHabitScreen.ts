import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAppStore } from '../store';
import { HabitCategory, HabitFrequency } from '../types';
import {
  DEFAULT_HABIT_CATEGORY,
  DEFAULT_HABIT_COLOR,
  DEFAULT_HABIT_EMOJI,
  DEFAULT_HABIT_FREQUENCY,
} from '../constants/habitForm';
import { useHaptics } from './useHaptics';

interface AddHabitRouteParams {
  habitId?: string;
}

/**
 * View-model for the Add / Edit Habit screen. Mirrors `useAddTaskScreen` so
 * the two forms feel symmetric: it owns local form state, the save flow,
 * the archive flow, and haptic feedback. UI primitives (chips, swatches)
 * stay in the screen file.
 */
export const useAddHabitScreen = () => {
  const haptics = useHaptics();
  const navigation = useNavigation();
  const route = useRoute();
  const editHabitId = (route.params as AddHabitRouteParams | undefined)?.habitId;

  const { addHabit, updateHabit, archiveHabit, getHabitById } = useAppStore();
  const existingHabit = useMemo(
    () => (editHabitId ? getHabitById(editHabitId) : undefined),
    [editHabitId, getHabitById]
  );

  const isEditing = !!existingHabit;

  const [title, setTitle] = useState(existingHabit?.title ?? '');
  const [emoji, setEmoji] = useState(existingHabit?.emoji ?? DEFAULT_HABIT_EMOJI);
  const [category, setCategory] = useState<HabitCategory>(
    existingHabit?.category ?? DEFAULT_HABIT_CATEGORY
  );
  const [frequency, setFrequency] = useState<HabitFrequency>(
    existingHabit?.frequency ?? DEFAULT_HABIT_FREQUENCY
  );
  const [color, setColor] = useState(existingHabit?.color ?? DEFAULT_HABIT_COLOR);
  const [reminderTime, setReminderTime] = useState(existingHabit?.reminderTime ?? '');

  const canSave = title.trim().length > 0;

  const handleSelectEmoji = useCallback(
    (next: string) => {
      haptics.light();
      setEmoji(next);
    },
    [haptics]
  );

  const handleSelectColor = useCallback(
    (next: string) => {
      haptics.light();
      setColor(next);
    },
    [haptics]
  );

  const handleSelectCategory = useCallback(
    (next: HabitCategory) => {
      haptics.light();
      setCategory(next);
    },
    [haptics]
  );

  const handleSelectFrequency = useCallback(
    (next: HabitFrequency) => {
      haptics.light();
      setFrequency(next);
    },
    [haptics]
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    haptics.success();
    const payload = {
      title: title.trim(),
      emoji,
      category,
      frequency,
      color,
      reminderTime: reminderTime || undefined,
    };

    if (isEditing && editHabitId) {
      updateHabit(editHabitId, payload);
    } else {
      addHabit({ ...payload, description: undefined, customDays: undefined });
    }
    navigation.goBack();
  }, [
    canSave,
    title,
    emoji,
    category,
    frequency,
    color,
    reminderTime,
    isEditing,
    editHabitId,
    addHabit,
    updateHabit,
    haptics,
    navigation,
  ]);

  const handleArchive = useCallback(() => {
    if (!editHabitId) return;
    Alert.alert(
      'Archive Habit',
      'This will hide the habit from your daily list but keep your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            haptics.warning();
            archiveHabit(editHabitId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [editHabitId, archiveHabit, haptics, navigation]);

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  return {
    title,
    emoji,
    category,
    frequency,
    color,
    reminderTime,
    isEditing,
    canSave,
    setTitle,
    setReminderTime,
    handleSelectEmoji,
    handleSelectColor,
    handleSelectCategory,
    handleSelectFrequency,
    handleSave,
    handleArchive,
    handleCancel,
  };
};
