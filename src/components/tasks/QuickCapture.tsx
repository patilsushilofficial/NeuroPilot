import React, { useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useQuickCaptureForm } from '../../hooks/useQuickCaptureForm';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';
import { TaskPriority } from '../../types';
import { QUICK_CAPTURE_PRIORITY_OPTIONS } from '../../constants/taskPriorities';

const ADD_BTN_SIZE = moderateScale(32);

interface QuickCaptureProps {
  onCapture: (title: string, priority?: TaskPriority) => void;
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
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
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
  } = useQuickCaptureForm({ onCapture });

  return (
    <Animated.View
      style={[
        styles.container,
        expanded ? styles.containerExpanded : styles.containerCollapsed,
        animatedInput,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.captureEmoji}>⚡</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={text}
          onChangeText={setText}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
            style={styles.addBtn}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add task"
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && text.length > 0 && (
        <View style={styles.priorityRow}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          {QUICK_CAPTURE_PRIORITY_OPTIONS.map((opt) => {
            const selected = priority === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => selectPriority(opt.key)}
                style={[
                  styles.priorityChip,
                  selected ? styles.priorityChipActive : styles.priorityChipInactive,
                ]}
              >
                <Text style={styles.priorityEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.priorityChipText,
                    selected ? styles.priorityChipTextActive : styles.priorityChipTextInactive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing.sm,
      overflow: 'hidden',
      backgroundColor: theme.colors.card,
      borderRadius: borderRadius.xl,
    },
    containerCollapsed: {
      borderColor: theme.colors.border,
      borderWidth: borderWidths.thin,
    },
    containerExpanded: {
      borderColor: theme.colors.primary,
      borderWidth: borderWidths.base,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    captureEmoji: {
      fontSize: iconSizes.lg,
    },
    input: {
      fontWeight: fontWeights.regular,
      paddingVertical: spacing['3xs'],
      color: theme.colors.textPrimary,
      fontSize: fontSizes.md,
      flex: 1,
    },
    addBtn: {
      width: ADD_BTN_SIZE,
      height: ADD_BTN_SIZE,
      borderRadius: ADD_BTN_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    addBtnText: {
      color: 'white',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.lg,
    },
    priorityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: borderWidths.hairline,
      borderTopColor: 'rgba(255,255,255,0.08)',
    },
    priorityLabel: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: theme.colors.textTertiary,
    },
    priorityChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing['3xs'],
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
    },
    priorityChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    priorityChipInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    priorityEmoji: {
      fontSize: fontSizes.sm,
    },
    priorityChipText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      marginLeft: spacing['3xs'],
    },
    priorityChipTextActive: { color: theme.colors.primaryLight },
    priorityChipTextInactive: { color: theme.colors.textSecondary },
  });
