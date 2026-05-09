import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useHaptics } from '../../hooks/useHaptics';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes } from '../../theme/tokens';
import { fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';
import { SettingsRowProps } from '../../screens/settings/types';

const ROW_EMOJI_WIDTH = moderateScale(28);
const ROW_RIGHT_MIN_WIDTH = moderateScale(96);
const ROW_RIGHT_MAX_WIDTH = moderateScale(150);

export const SettingsRow: React.FC<SettingsRowProps> = ({
  emoji,
  label,
  description,
  value,
  onToggle,
  onPress,
  rightText,
  danger = false,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const haptics = useHaptics();
  const showInlineValue = Boolean(rightText) && Boolean(description) && onToggle === undefined;
  const rowRole = onToggle ? 'switch' : onPress ? 'button' : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && onToggle === undefined}
      style={styles.row}
      accessible
      accessibilityRole={rowRole}
      accessibilityState={onToggle ? { checked: value } : undefined}
      accessibilityLabel={label}
    >
      <View style={styles.rowEmojiWrap}>
        <Text style={styles.rowEmoji}>{emoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[
            theme.text.bodyMedium,
            styles.rowLabel,
            danger ? styles.rowLabelDanger : styles.rowLabelDefault,
          ]}
        >
          {label}
        </Text>
        {description && <Text style={[theme.text.bodySmall, styles.rowDescription]}>{description}</Text>}
        {showInlineValue && (
          <Text style={[theme.text.bodySmall, styles.rowInlineValue]} numberOfLines={1}>
            {rightText}
          </Text>
        )}
      </View>
      {onToggle !== undefined ? (
        <Switch
          testID={`switch-${label}`}
          value={value}
          onValueChange={(v) => {
            haptics.light();
            onToggle(v);
          }}
          trackColor={styles.switchTrackColors}
          thumbColor="white"
          accessible
        />
      ) : onPress ? (
        <Text style={[theme.text.bodySmall, styles.rowChevron]}>›</Text>
      ) : (
        <Text style={[theme.text.bodySmall, styles.rowRightText]} numberOfLines={1} ellipsizeMode="tail">
          {showInlineValue ? '' : (rightText ?? '')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (theme: Theme) => {
  const switchTrackColors = { false: theme.colors.border, true: theme.colors.primary };

  return Object.assign(
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
      },
      rowEmojiWrap: {
        width: ROW_EMOJI_WIDTH,
        height: ROW_EMOJI_WIDTH,
        borderRadius: ROW_EMOJI_WIDTH / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryContainer,
      },
      rowEmoji: {
        fontSize: iconSizes.md,
      },
      rowContent: {
        flex: 1,
        gap: spacing['3xs'],
        minWidth: 0,
      },
      rowLabel: { fontWeight: fontWeights.medium },
      rowLabelDefault: { color: theme.colors.textPrimary },
      rowLabelDanger: { color: theme.colors.error },
      rowDescription: { color: theme.colors.textTertiary },
      rowInlineValue: {
        color: theme.colors.primaryLight,
        marginTop: spacing['2xs'],
        fontWeight: fontWeights.semibold,
      },
      rowChevron: { color: theme.colors.textTertiary },
      rowRightText: {
        color: theme.colors.textSecondary,
        textAlign: 'right',
        alignSelf: 'flex-start',
        marginLeft: spacing.xs,
        minWidth: ROW_RIGHT_MIN_WIDTH,
        maxWidth: ROW_RIGHT_MAX_WIDTH,
      },
    }),
    { switchTrackColors }
  );
};
