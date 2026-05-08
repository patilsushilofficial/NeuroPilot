import { useCallback, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useHaptics } from './useHaptics';
import { springs } from '../theme/tokens';
import { TaskPriority } from '../types';

interface UseQuickCaptureFormArgs {
  /** Called once the user commits a non-empty entry. Receives the trimmed
   *  title and the priority chip selected at the time of submission. */
  onCapture: (title: string, priority?: TaskPriority) => void;
}

/**
 * Owns the local state and side-effects for the `QuickCapture` widget:
 * the input text, the expanded chip row, the selected priority, the input
 * ref, the bounce animation, and the focus/blur/submit handlers (incl.
 * haptics and keyboard dismissal). The component itself only renders.
 */
export const useQuickCaptureForm = ({ onCapture }: UseQuickCaptureFormArgs) => {
  const haptics = useHaptics();
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const inputRef = useRef<TextInput>(null);

  const inputScale = useSharedValue(1);
  const animatedInput = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    haptics.success();
    onCapture(trimmed, priority);
    setText('');
    setExpanded(false);
    Keyboard.dismiss();

    inputScale.value = withSpring(1.02, springs.gentle, () => {
      inputScale.value = withSpring(1, springs.snappy);
    });
  }, [text, priority, onCapture, haptics]);

  const handleFocus = useCallback(() => {
    setExpanded(true);
    haptics.light();
  }, [haptics]);

  const handleBlur = useCallback(() => {
    if (!text) setExpanded(false);
  }, [text]);

  const selectPriority = useCallback(
    (next: TaskPriority) => {
      haptics.light();
      setPriority(next);
    },
    [haptics]
  );

  return {
    text,
    setText,
    expanded,
    priority,
    selectPriority,
    inputRef,
    animatedInput,
    handleSubmit,
    handleFocus,
    handleBlur,
  };
};
