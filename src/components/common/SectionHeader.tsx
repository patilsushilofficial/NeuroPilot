import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { hitSlop, iconSizes } from '../../theme/tokens';
import { Icon } from './Icon';

interface SectionHeaderProps {
  title: string;
  /** Optional right-aligned text. When `onAction` is provided this becomes
   *  a tappable affordance with a chevron ("View all"); otherwise it
   *  renders as a static indicator (e.g. "3 / 17"). */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Reusable section heading with an optional right-aligned slot.
 * Standardises the spacing, type ramp, and chevron treatment used across
 * Home, Progress, and (eventually) the Tasks/Habits screens.
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const renderAccessory = () => {
    if (!actionLabel) return null;
    if (onAction) {
      return (
        <TouchableOpacity
          onPress={onAction}
          style={styles.action}
          hitSlop={hitSlop.md}
          accessible
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[theme.text.labelMedium, styles.actionLabel]}>
            {actionLabel}
          </Text>
          <Icon
            name="chevron-right"
            size={iconSizes.md}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      );
    }
    return (
      <Text style={[theme.text.labelMedium, styles.indicatorLabel]}>
        {actionLabel}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[theme.text.h4, styles.title]}>{title}</Text>
      {renderAccessory()}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.colors.textPrimary,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
    },
    actionLabel: {
      color: theme.colors.primary,
    },
    indicatorLabel: {
      color: theme.colors.textSecondary,
    },
  });
