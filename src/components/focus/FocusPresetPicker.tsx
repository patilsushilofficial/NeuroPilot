import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { FOCUS_PRESETS } from '../../constants/focusPresets';
import { FocusPreset } from '../../types';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';

interface FocusPresetPickerProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

function rhythmLine(preset: FocusPreset): string {
  const n = preset.sessionsBeforeLongBreak;
  if (n === 1) {
    return 'Big break after 1 work time';
  }
  return `Big break after ${n} work times`;
}

function accessibilityDescription(preset: FocusPreset): string {
  return (
    `${preset.name}. Work ${preset.focusMinutes} minutes, ` +
    `little break ${preset.shortBreakMinutes} minutes, ` +
    `big break ${preset.longBreakMinutes} minutes, ` +
    `${preset.sessionsBeforeLongBreak} work times before the big break.`
  );
}

export const FocusPresetPicker: React.FC<FocusPresetPickerProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const lineTextStyle = (selected: boolean) => [
    theme.text.bodySmall,
    styles.summaryLine,
    selected ? styles.summaryActive : styles.summaryIdle,
  ];

  return (
    <View style={styles.section}>
      <Text style={[theme.text.labelSmall, styles.sectionLabel]}>PICK YOUR TIMER</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetScroll}
        contentContainerStyle={styles.presetContent}
        nestedScrollEnabled
      >
        {FOCUS_PRESETS.map((preset) => {
          const selected = selectedPresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              onPress={() => onSelectPreset(preset.id)}
              style={[
                styles.presetCard,
                selected ? styles.presetCardActive : styles.presetCardInactive,
              ]}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={accessibilityDescription(preset)}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardHead}>
                  <View
                    style={[
                      styles.iconWrap,
                      selected ? styles.iconWrapActive : styles.iconWrapIdle,
                    ]}
                  >
                    <Text style={styles.presetEmoji}>{preset.icon}</Text>
                  </View>
                  <Text
                    style={[
                      theme.text.labelMedium,
                      styles.presetName,
                      selected ? styles.presetNameActive : styles.presetNameInactive,
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    {preset.name}
                  </Text>
                </View>

                <View style={styles.summaryLines}>
                  <Text
                    style={lineTextStyle(selected)}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {`Work ${preset.focusMinutes} min`}
                  </Text>
                  <Text
                    style={lineTextStyle(selected)}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {`Little break ${preset.shortBreakMinutes} min`}
                  </Text>
                  <Text
                    style={lineTextStyle(selected)}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {`Big break ${preset.longBreakMinutes} min`}
                  </Text>
                  <Text
                    style={lineTextStyle(selected)}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    {rhythmLine(preset)}
                  </Text>
                </View>
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
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    sectionLabel: {
      color: theme.colors.textTertiary,
      marginLeft: spacing['2xs'],
    },
    presetScroll: {
      overflow: 'visible',
    },
    presetContent: {
      paddingTop: spacing['2xs'],
      paddingBottom: spacing['2xs'],
      paddingLeft: spacing['2xs'],
      paddingRight: spacing.lg,
      alignItems: 'stretch',
    },
    presetCard: {
      width: controlSizes.presetPickerCardWidth,
      borderRadius: borderRadius.lg,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      marginRight: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      overflow: 'hidden',
    },
    presetCardActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
      borderWidth: borderWidths.base,
    },
    presetCardInactive: {
      backgroundColor: theme.colors.card,
    },
    cardInner: {
      gap: spacing.sm,
    },
    cardHead: {
      alignItems: 'center',
      gap: spacing['2xs'],
    },
    iconWrap: {
      width: controlSizes.presetPickerIconRing,
      height: controlSizes.presetPickerIconRing,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetEmoji: {
      fontSize: iconSizes.lg,
    },
    iconWrapActive: {
      backgroundColor: theme.colors.primary,
    },
    iconWrapIdle: {
      backgroundColor: theme.colors.cardElevated ?? theme.colors.card,
    },
    presetName: {
      textAlign: 'center',
      width: '100%',
    },
    presetNameActive: { color: theme.colors.primaryLight },
    presetNameInactive: { color: theme.colors.textPrimary },
    summaryLines: {
      width: '100%',
      gap: spacing['3xs'],
    },
    summaryLine: {
      textAlign: 'center',
      width: '100%',
    },
    summaryActive: {
      color: theme.colors.primaryLight,
      fontWeight: '600',
    },
    summaryIdle: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
  });
