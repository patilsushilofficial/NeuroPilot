import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  Animated as RNAnimated,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { spacing, borderRadius } from '../../theme/spacing';

interface QuickCaptureProps {
  onCapture: (title: string, priority?: 'high' | 'medium' | 'low') => void;
  placeholder?: string;
}

/**
 * QuickCapture — sub-60 second task entry.
 * Key ADHD design principle: capture NOW before the thought evaporates.
 * Minimal friction: single text field, auto-focused, instant commit.
 */
export const QuickCapture: React.FC<QuickCaptureProps> = ({
  onCapture,
  placeholder = 'Capture a thought or task…',
}) => {
  const theme = useAppTheme();
  const haptics = useHaptics();
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
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

    // Pulse animation
    inputScale.value = withSpring(1.02, { damping: 15 }, () => {
      inputScale.value = withSpring(1, { damping: 12 });
    });
  }, [text, priority, onCapture, haptics]);

  const handleFocus = useCallback(() => {
    setExpanded(true);
    haptics.light();
  }, [haptics]);

  const priorityOptions: Array<{ key: 'high' | 'medium' | 'low'; emoji: string; label: string }> = [
    { key: 'high', emoji: '🔴', label: 'High' },
    { key: 'medium', emoji: '🟡', label: 'Med' },
    { key: 'low', emoji: '🟢', label: 'Low' },
  ];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: expanded ? theme.colors.primary : theme.colors.border,
          borderWidth: expanded ? 1.5 : 1,
          borderRadius: borderRadius.xl,
        },
        animatedInput,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.captureEmoji}>⚡</Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: 16,
              flex: 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={text}
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={() => !text && setExpanded(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          multiline={false}
          autoCorrect
          accessible
          accessibilityLabel="Quick task capture input"
          accessibilityHint="Type a task and press enter to save"
        />
        {text.length > 0 && (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add task"
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && text.length > 0 && (
        <View style={styles.priorityRow}>
          <Text style={[styles.priorityLabel, { color: theme.colors.textTertiary }]}>
            Priority:
          </Text>
          {priorityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                haptics.light();
                setPriority(opt.key);
              }}
              style={[
                styles.priorityChip,
                {
                  backgroundColor:
                    priority === opt.key ? theme.colors.primaryContainer : theme.colors.surface,
                  borderColor:
                    priority === opt.key ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 12 }}>{opt.emoji}</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: priority === opt.key ? theme.colors.primaryLight : theme.colors.textSecondary,
                  marginLeft: 3,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[1.5],
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  captureEmoji: {
    fontSize: 18,
  },
  input: {
    fontWeight: '400',
    paddingVertical: 4,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
});
