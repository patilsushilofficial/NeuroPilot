import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { FOCUS_PRESETS } from '../../constants/focusPresets';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';

interface FocusPresetPickerProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

export const FocusPresetPicker: React.FC<FocusPresetPickerProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <Text style={[theme.text.labelSmall, styles.sectionLabel]}>CHOOSE A MODE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetScroll}
        contentContainerStyle={styles.presetContent}
      >
        {FOCUS_PRESETS.map((preset) => {
          const selected = selectedPresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onSelectPreset(preset.id)}
              style={[styles.presetCard, selected ? styles.presetCardActive : styles.presetCardInactive]}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={styles.headerRow}>
                <View style={[styles.iconWrap, selected ? styles.iconWrapActive : styles.iconWrapIdle]}>
                  <Text style={styles.presetEmoji}>{preset.icon}</Text>
                </View>
                <Text
                  style={[
                    theme.text.labelMedium,
                    styles.presetName,
                    selected ? styles.presetNameActive : styles.presetNameInactive,
                  ]}
                  numberOfLines={2}
                >
                  {preset.name}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[theme.text.bodySmall, styles.metaPrimary]}>
                  {preset.focusMinutes}m / {preset.shortBreakMinutes}m
                </Text>
                <Text style={[theme.text.bodySmall, styles.metaSecondary]}>
                  LB x{preset.sessionsBeforeLongBreak}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: borderRadius['2xl'],
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      paddingVertical: spacing.md,
      gap: spacing.xs,
      overflow: 'hidden',
    },
    sectionLabel: {
      color: theme.colors.textTertiary,
      marginHorizontal: spacing.md,
    },
    presetScroll: {},
    presetContent: {
      paddingHorizontal: spacing.md,
      paddingRight: spacing.md + spacing.xs,
    },
    presetCard: {
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      width: controlSizes.presetCard + spacing.sm,
      gap: spacing.sm,
      minHeight: controlSizes.presetCard + spacing.sm,
      marginRight: spacing.xs,
    },
    presetCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    presetCardInactive: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: spacing['3xl'],
    },
    presetEmoji: {
      fontSize: iconSizes.lg,
    },
    iconWrap: {
      width: spacing['3xl'],
      height: spacing['3xl'],
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapActive: {
      backgroundColor: theme.colors.primary,
    },
    iconWrapIdle: {
      backgroundColor: theme.colors.cardElevated ?? theme.colors.card,
    },
    presetName: {
      flex: 1,
      textAlign: 'left',
      color: theme.colors.textPrimary,
    },
    presetNameActive: { color: theme.colors.primaryLight, fontWeight: '700' },
    presetNameInactive: { color: theme.colors.textPrimary },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: borderWidths.hairline,
      borderTopColor: theme.colors.border,
      paddingTop: spacing.xs,
    },
    metaPrimary: {
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    metaSecondary: {
      color: theme.colors.textTertiary,
      opacity: 0.8,
    },
  });
