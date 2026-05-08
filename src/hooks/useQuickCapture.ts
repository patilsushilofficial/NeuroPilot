import { useCallback } from 'react';

import { useAppStore } from '../store';
import { useHaptics } from './useHaptics';
import { TaskPriority } from '../types';

/**
 * Screen-level helper that exposes a single `handleQuickCapture` callback —
 * used by surfaces (currently the Home screen) that want a one-line
 * "create a task with sensible defaults" affordance without owning any
 * priority/tag state.
 *
 * Distinct from `useQuickCaptureForm`, which owns the multi-field form
 * state of the `QuickCapture` widget.
 */
export const useQuickCapture = () => {
  const { addTask } = useAppStore();
  const haptics = useHaptics();

  const handleQuickCapture = useCallback(
    (title: string, priority: TaskPriority = 'medium') => {
      const trimmed = title.trim();
      if (!trimmed) return;
      haptics.light();
      addTask({ title: trimmed, priority, tags: [] });
    },
    [addTask, haptics]
  );

  return { handleQuickCapture };
};
