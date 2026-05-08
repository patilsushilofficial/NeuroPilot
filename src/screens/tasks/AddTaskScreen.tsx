import React, { useState, useCallback, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { useAppStore } from '../../store';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TaskPriority } from '../../types';
import { spacing, borderRadius } from '../../theme/spacing';

/**
 * AddTaskScreen — Progressive disclosure form.
 * ADHD principle: only show Title initially.
 * Expanded fields appear after title is entered.
 */
export const AddTaskScreen: React.FC = () => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const editTaskId = route.params?.taskId;

  const { addTask, updateTask, deleteTask, getTaskById } = useAppStore();
  const existingTask = editTaskId ? getTaskById(editTaskId) : undefined;

  // Form state
  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<Date | null>(
    existingTask?.dueDate ? new Date(existingTask.dueDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    existingTask?.estimatedMinutes?.toString() ?? ''
  );
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(
    existingTask?.subtasks.map((s) => s.title) ?? []
  );
  const [showAdvanced, setShowAdvanced] = useState(!!existingTask);

  const isEditing = !!existingTask;
  const canSave = title.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    haptics.success();

    const basePayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate?.getTime(),
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
      tags: [],
    };

    if (isEditing && editTaskId) {
      // For updates, we need full SubTask objects (or we can just omit if we handle it differently, but here we recreate them)
      updateTask(editTaskId, {
        ...basePayload,
        subtasks: subtasks.filter(Boolean).map((t) => ({
          id: Math.random().toString(),
          title: t,
          completed: false,
        })),
      });
    } else {
      addTask({
        ...basePayload,
        subtasks: subtasks.filter(Boolean).map((t) => ({ title: t })),
      });
    }
    navigation.goBack();
  }, [
    canSave, title, description, priority, dueDate, estimatedMinutes,
    subtasks, isEditing, editTaskId, addTask, updateTask, haptics, navigation,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Task', 'Permanently delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          deleteTask(editTaskId);
          navigation.goBack();
        },
      },
    ]);
  }, [editTaskId, deleteTask, haptics, navigation]);

  const addSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    haptics.light();
    setSubtasks((prev) => [...prev, trimmed]);
    setSubtaskInput('');
  };

  const PRIORITY_OPTIONS: Array<{ key: TaskPriority; emoji: string; label: string; desc: string }> = [
    { key: 'high', emoji: '🔴', label: 'High', desc: 'Must do today' },
    { key: 'medium', emoji: '🟡', label: 'Medium', desc: 'Important but flexible' },
    { key: 'low', emoji: '🟢', label: 'Low', desc: 'Nice to do' },
  ];

  const TIME_ESTIMATES = [
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '30m', value: '30' },
    { label: '1h', value: '60' },
    { label: '2h', value: '120' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessible accessibilityRole="button" accessibilityLabel="Go back">
            <Text style={[theme.text.bodyMedium, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.text.h4, { color: theme.colors.textPrimary }]}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
          <Button label="Save" onPress={handleSave} variant="primary" size="sm" disabled={!canSave} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title — always visible, primary input */}
          <View style={styles.section}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: theme.colors.textPrimary,
                  borderBottomColor: title ? theme.colors.primary : theme.colors.border,
                },
              ]}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (t.length > 0 && !showAdvanced) setShowAdvanced(true);
              }}
              autoFocus={!isEditing}
              returnKeyType="next"
              multiline={false}
              accessible
              accessibilityLabel="Task title"
            />
          </View>

          {/* Progressive disclosure — shown after title is entered */}
          {showAdvanced && (
            <>
              {/* Priority */}
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: spacing[1] }]}>
                  PRIORITY
                </Text>
                <View style={styles.priorityRow}>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => {
                        haptics.light();
                        setPriority(opt.key);
                      }}
                      style={[
                        styles.priorityCard,
                        {
                          backgroundColor:
                            priority === opt.key ? theme.colors.primaryContainer : theme.colors.card,
                          borderColor: priority === opt.key ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ selected: priority === opt.key }}
                    >
                      <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                      <Text style={[theme.text.labelMedium, { color: theme.colors.textPrimary }]}>
                        {opt.label}
                      </Text>
                      <Text style={[theme.text.bodySmall, { color: theme.colors.textTertiary, textAlign: 'center' }]}>
                        {opt.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: 8 }]}>
                  NOTES (OPTIONAL)
                </Text>
                <TextInput
                  style={[
                    styles.descInput,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.textPrimary,
                    },
                  ]}
                  placeholder="Add context or notes…"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  accessible
                  accessibilityLabel="Task description"
                />
              </View>

              {/* Time Estimate */}
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: 8 }]}>
                  TIME ESTIMATE
                </Text>
                <View style={styles.timeRow}>
                  {TIME_ESTIMATES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => {
                        haptics.light();
                        setEstimatedMinutes(estimatedMinutes === t.value ? '' : t.value);
                      }}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor:
                            estimatedMinutes === t.value
                              ? theme.colors.primaryContainer
                              : theme.colors.card,
                          borderColor:
                            estimatedMinutes === t.value
                              ? theme.colors.primary
                              : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          theme.text.labelMedium,
                          {
                            color:
                              estimatedMinutes === t.value
                                ? theme.colors.primaryLight
                                : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: 8 }]}>
                  DUE DATE
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    setShowDatePicker(true);
                  }}
                  style={[
                    styles.dateBtn,
                    {
                      backgroundColor: dueDate ? theme.colors.primaryContainer : theme.colors.card,
                      borderColor: dueDate ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={dueDate ? `Due date: ${dueDate.toDateString()}` : 'Set due date'}
                >
                  <Text style={{ fontSize: 16 }}>{dueDate ? '📅' : '➕'}</Text>
                  <Text
                    style={[
                      theme.text.bodyMedium,
                      { color: dueDate ? theme.colors.primaryLight : theme.colors.textTertiary },
                    ]}
                  >
                    {dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add due date'}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        haptics.light();
                        setDueDate(null);
                      }}
                      style={styles.clearDate}
                    >
                      <Text style={{ color: theme.colors.textTertiary, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={new Date()}
                    onChange={(_, selected) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selected) setDueDate(selected);
                    }}
                    themeVariant={theme.mode}
                  />
                )}
              </View>

              {/* Subtasks */}
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, { color: theme.colors.textTertiary, marginBottom: 8 }]}>
                  BREAK IT DOWN (SUBTASKS)
                </Text>

                {subtasks.map((st, i) => (
                  <View key={i} style={[styles.subtaskRow, { borderColor: theme.colors.border }]}>
                    <Text style={{ fontSize: 14 }}>☐</Text>
                    <Text style={[theme.text.bodyMedium, { color: theme.colors.textSecondary, flex: 1 }]}>
                      {st}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        haptics.light();
                        setSubtasks((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                    >
                      <Text style={{ color: theme.colors.error, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={[styles.subtaskInputRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <TextInput
                    style={[styles.subtaskInput, { color: theme.colors.textPrimary }]}
                    placeholder="Add a step…"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    onSubmitEditing={addSubtask}
                    returnKeyType="done"
                    accessible
                    accessibilityLabel="Add subtask"
                  />
                  {subtaskInput.length > 0 && (
                    <TouchableOpacity onPress={addSubtask} style={[styles.subtaskAdd, { backgroundColor: theme.colors.primary }]}>
                      <Text style={{ color: 'white', fontWeight: '700' }}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Delete (edit mode only) */}
              {isEditing && (
                <Button
                  label="🗑  Delete Task"
                  onPress={handleDelete}
                  variant="danger"
                  size="md"
                  fullWidth
                  style={{ marginTop: spacing[1] }}
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1.5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    padding: spacing[2],
    gap: spacing[2],
    paddingBottom: 100,
  },
  section: {},
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    borderBottomWidth: 2,
    paddingBottom: spacing[1],
  },
  descInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[1.5],
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[1],
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[0.5],
  },
  timeChip: {
    paddingHorizontal: spacing[1.5],
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    padding: spacing[1.5],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  clearDate: {
    marginLeft: 'auto',
    padding: 4,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[1.5],
    marginTop: spacing[0.5],
  },
  subtaskInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  subtaskAdd: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
