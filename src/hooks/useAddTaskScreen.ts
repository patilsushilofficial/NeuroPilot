import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAppStore } from '../store';
import { TaskPriority } from '../types';
import { taskService } from '../services/TaskService';
import { useHaptics } from './useHaptics';

interface AddTaskRouteParams {
  taskId?: string;
}

/**
 * View-model for the Add / Edit Task screen. Owns:
 *  - Local form state (title, description, priority, due date, etc.).
 *  - Progressive disclosure: `showAdvanced` flips on once a title is typed
 *    or when editing an existing task.
 *  - Save / delete orchestration, including confirmation dialogs.
 *  - Subtask add / remove helpers.
 *
 * Domain-shaped payload assembly (subtask normalisation, ID generation) is
 * delegated to `taskService` so the form never invents IDs of its own.
 */
export const useAddTaskScreen = () => {
  const haptics = useHaptics();
  const navigation = useNavigation();
  const route = useRoute();
  const editTaskId = (route.params as AddTaskRouteParams | undefined)?.taskId;

  const { addTask, updateTask, deleteTask, getTaskById } = useAppStore();
  const existingTask = useMemo(
    () => (editTaskId ? getTaskById(editTaskId) : undefined),
    [editTaskId, getTaskById]
  );

  const isEditing = !!existingTask;

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
  const [showAdvanced, setShowAdvanced] = useState(isEditing);

  const canSave = title.trim().length > 0;

  const handleTitleChange = useCallback(
    (next: string) => {
      setTitle(next);
      if (next.length > 0 && !showAdvanced) setShowAdvanced(true);
    },
    [showAdvanced]
  );

  const handleSelectPriority = useCallback(
    (next: TaskPriority) => {
      haptics.light();
      setPriority(next);
    },
    [haptics]
  );

  const handleSelectTimeEstimate = useCallback(
    (value: string) => {
      haptics.light();
      setEstimatedMinutes((current) => (current === value ? '' : value));
    },
    [haptics]
  );

  const handleOpenDatePicker = useCallback(() => {
    haptics.light();
    setShowDatePicker(true);
  }, [haptics]);

  const handleClearDueDate = useCallback(() => {
    haptics.light();
    setDueDate(null);
  }, [haptics]);

  const handleAddSubtask = useCallback(() => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    haptics.light();
    setSubtasks((prev) => [...prev, trimmed]);
    setSubtaskInput('');
  }, [haptics, subtaskInput]);

  const handleRemoveSubtask = useCallback(
    (index: number) => {
      haptics.light();
      setSubtasks((prev) => prev.filter((_, i) => i !== index));
    },
    [haptics]
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    haptics.success();

    const trimmedEstimate = estimatedMinutes.trim();
    const basePayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate?.getTime(),
      estimatedMinutes: trimmedEstimate ? parseInt(trimmedEstimate, 10) : undefined,
      tags: [] as string[],
    };

    if (isEditing && editTaskId) {
      updateTask(editTaskId, {
        ...basePayload,
        subtasks: taskService.normalizeSubtasksForUpdate(subtasks),
      });
    } else {
      addTask({
        ...basePayload,
        subtasks: taskService.normalizeSubtasksForCreate(subtasks),
      });
    }
    navigation.goBack();
  }, [
    canSave,
    title,
    description,
    priority,
    dueDate,
    estimatedMinutes,
    subtasks,
    isEditing,
    editTaskId,
    addTask,
    updateTask,
    haptics,
    navigation,
  ]);

  const handleDelete = useCallback(() => {
    if (!editTaskId) return;
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

  const handleCancel = useCallback(() => navigation.goBack(), [navigation]);

  const handleDatePickerChange = useCallback((selected: Date | null) => {
    if (selected) setDueDate(selected);
  }, []);

  return {
    // State.
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
    // State setters used directly by inputs.
    setDescription,
    setSubtaskInput,
    setShowDatePicker,
    // Compound handlers.
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
  };
};
