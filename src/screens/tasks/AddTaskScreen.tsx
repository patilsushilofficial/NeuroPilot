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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useAddTaskScreen } from '../../hooks/useAddTaskScreen';
import { Button } from '../../components/common/Button';
import { TASK_PRIORITY_OPTIONS } from '../../constants/taskPriorities';
import { TIME_ESTIMATES } from '../../constants/taskForm';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

const SUBTASK_ADD_SIZE = moderateScale(28);

/**
 * AddTaskScreen — Progressive-disclosure form rendered by the hook.
 *
 * ADHD principle: only show Title initially. Expanded fields appear after
 * a title is typed. All non-rendering logic lives in `useAddTaskScreen`.
 */
export const AddTaskScreen: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    title,
    description,
    priority,
    dueDate,
    showDatePicker,
    estimatedMinutes,
    subtaskInput,
    subtasks,
    showAdvanced,
    isEditing,
    canSave,
    setDescription,
    setSubtaskInput,
    setShowDatePicker,
    handleTitleChange,
    handleSelectPriority,
    handleSelectTimeEstimate,
    handleOpenDatePicker,
    handleClearDueDate,
    handleAddSubtask,
    handleRemoveSubtask,
    handleSave,
    handleDelete,
    handleCancel,
    handleDatePickerChange,
  } = useAddTaskScreen();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[theme.text.bodyMedium, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[theme.text.h4, styles.headerTitle]}>
            {isEditing ? 'Edit Task' : 'New Task'}
          </Text>
          <Button
            label="Save"
            onPress={handleSave}
            variant="primary"
            size="sm"
            disabled={!canSave}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <TextInput
              style={[
                styles.titleInput,
                title ? styles.titleInputActive : styles.titleInputInactive,
              ]}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={handleTitleChange}
              autoFocus={!isEditing}
              returnKeyType="next"
              multiline={false}
              accessible
              accessibilityLabel="Task title"
            />
          </View>

          {showAdvanced && (
            <>
              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, styles.sectionLabel]}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                  {TASK_PRIORITY_OPTIONS.map((opt) => {
                    const selected = priority === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => handleSelectPriority(opt.key)}
                        style={[
                          styles.priorityCard,
                          selected ? styles.priorityCardActive : styles.priorityCardInactive,
                        ]}
                        accessible
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                      >
                        <Text style={styles.priorityEmoji}>{opt.emoji}</Text>
                        <Text style={[theme.text.labelMedium, styles.priorityLabel]}>
                          {opt.label}
                        </Text>
                        <Text style={[theme.text.bodySmall, styles.priorityDesc]}>
                          {opt.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, styles.sectionLabel]}>NOTES (OPTIONAL)</Text>
                <TextInput
                  style={styles.descInput}
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

              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, styles.sectionLabel]}>TIME ESTIMATE</Text>
                <View style={styles.timeRow}>
                  {TIME_ESTIMATES.map((t) => {
                    const selected = estimatedMinutes === t.value;
                    return (
                      <TouchableOpacity
                        key={t.value}
                        onPress={() => handleSelectTimeEstimate(t.value)}
                        style={[
                          styles.timeChip,
                          selected ? styles.chipActive : styles.chipInactive,
                        ]}
                      >
                        <Text
                          style={[
                            theme.text.labelMedium,
                            selected ? styles.chipLabelActive : styles.chipLabelInactive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, styles.sectionLabel]}>DUE DATE</Text>
                <TouchableOpacity
                  onPress={handleOpenDatePicker}
                  style={[styles.dateBtn, dueDate ? styles.chipActive : styles.chipInactive]}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={
                    dueDate ? `Due date: ${dueDate.toDateString()}` : 'Set due date'
                  }
                >
                  <Text style={styles.dateIcon}>{dueDate ? '📅' : '➕'}</Text>
                  <Text
                    style={[
                      theme.text.bodyMedium,
                      dueDate ? styles.dateTextActive : styles.dateTextInactive,
                    ]}
                  >
                    {dueDate
                      ? dueDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Add due date'}
                  </Text>
                  {dueDate && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleClearDueDate();
                      }}
                      style={styles.clearDate}
                    >
                      <Text style={styles.clearDateText}>✕</Text>
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
                      handleDatePickerChange(selected ?? null);
                    }}
                    themeVariant={theme.colorScheme}
                  />
                )}
              </View>

              <View style={styles.section}>
                <Text style={[theme.text.labelSmall, styles.sectionLabel]}>
                  BREAK IT DOWN (SUBTASKS)
                </Text>

                {subtasks.map((st, i) => (
                  <View key={i} style={styles.subtaskRow}>
                    <Text style={styles.subtaskCheck}>☐</Text>
                    <Text style={[theme.text.bodyMedium, styles.subtaskTitle]}>{st}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSubtask(i)}>
                      <Text style={styles.subtaskRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.subtaskInputRow}>
                  <TextInput
                    style={styles.subtaskInput}
                    placeholder="Add a step…"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={subtaskInput}
                    onChangeText={setSubtaskInput}
                    onSubmitEditing={handleAddSubtask}
                    returnKeyType="done"
                    accessible
                    accessibilityLabel="Add subtask"
                  />
                  {subtaskInput.length > 0 && (
                    <TouchableOpacity onPress={handleAddSubtask} style={styles.subtaskAdd}>
                      <Text style={styles.subtaskAddText}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isEditing && (
                <Button
                  label="🗑  Delete Task"
                  onPress={handleDelete}
                  variant="danger"
                  size="md"
                  fullWidth
                  style={styles.deleteBtn}
                />
              )}
            </>
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
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
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
    section: {},
    sectionLabel: {
      color: theme.colors.textTertiary,
      marginBottom: spacing.xs,
    },
    titleInput: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      borderBottomWidth: borderWidths.thick,
      paddingBottom: spacing.xs,
      color: theme.colors.textPrimary,
    },
    titleInputActive: { borderBottomColor: theme.colors.primary },
    titleInputInactive: { borderBottomColor: theme.colors.border },
    descInput: {
      borderWidth: borderWidths.thin,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      minHeight: spacing['8xl'],
      textAlignVertical: 'top',
      fontSize: fontSizes.base,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    priorityRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    priorityCard: {
      flex: 1,
      alignItems: 'center',
      padding: spacing.xs,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.base,
      gap: spacing['3xs'],
    },
    priorityCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    priorityCardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    priorityEmoji: { fontSize: iconSizes.lg },
    priorityLabel: { color: theme.colors.textPrimary },
    priorityDesc: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    timeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing['2xs'],
    },
    timeChip: {
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
    dateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
    },
    dateIcon: { fontSize: iconSizes.md },
    dateTextActive: { color: theme.colors.primaryLight },
    dateTextInactive: { color: theme.colors.textTertiary },
    clearDate: {
      marginLeft: 'auto',
      padding: spacing['3xs'],
    },
    clearDateText: {
      color: theme.colors.textTertiary,
      fontSize: iconSizes.md,
    },
    subtaskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      borderBottomWidth: borderWidths.hairline,
      borderColor: theme.colors.border,
    },
    subtaskCheck: { fontSize: iconSizes.sm },
    subtaskTitle: {
      color: theme.colors.textSecondary,
      flex: 1,
    },
    subtaskRemove: {
      color: theme.colors.error,
      fontSize: iconSizes.md,
    },
    subtaskInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      paddingHorizontal: spacing.sm,
      marginTop: spacing['2xs'],
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    subtaskInput: {
      flex: 1,
      paddingVertical: spacing.sm,
      fontSize: fontSizes.base,
      color: theme.colors.textPrimary,
    },
    subtaskAdd: {
      width: SUBTASK_ADD_SIZE,
      height: SUBTASK_ADD_SIZE,
      borderRadius: SUBTASK_ADD_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    subtaskAddText: {
      color: 'white',
      fontWeight: fontWeights.bold,
    },
    deleteBtn: {
      marginTop: spacing.xs,
    },
  });
