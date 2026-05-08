import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { fontSizes, fontWeights, letterSpacings } from '../../theme/typography';
import { iconSizes } from '../../theme/tokens';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  emoji?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  style,
  emoji,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const isSmall = size === 'sm';
  const containerSize = isSmall ? styles.containerSm : styles.containerMd;
  const containerVariant = CONTAINER_VARIANT_KEYS[variant];
  const labelVariant = LABEL_VARIANT_KEYS[variant];
  const emojiStyle = isSmall ? styles.emojiSm : styles.emojiMd;
  const labelSize = isSmall ? styles.labelSm : styles.labelMd;

  return (
    <View style={[styles.container, containerSize, styles[containerVariant], style]}>
      {emoji && <Text style={emojiStyle}>{emoji}</Text>}
      <Text style={[styles.label, labelSize, styles[labelVariant]]}>{label}</Text>
    </View>
  );
};

/**
 * Lookup tables that map a variant string to its corresponding style key.
 * Avoids the `styles[`variant_${x}`]` template-literal access pattern,
 * which is harder for a reader to grep and impossible for TypeScript to
 * narrow.
 */
const CONTAINER_VARIANT_KEYS: Record<BadgeVariant, ContainerVariantKey> = {
  primary: 'containerPrimary',
  secondary: 'containerSecondary',
  success: 'containerSuccess',
  warning: 'containerWarning',
  error: 'containerError',
  neutral: 'containerNeutral',
};

const LABEL_VARIANT_KEYS: Record<BadgeVariant, LabelVariantKey> = {
  primary: 'labelPrimary',
  secondary: 'labelSecondary',
  success: 'labelSuccess',
  warning: 'labelWarning',
  error: 'labelError',
  neutral: 'labelNeutral',
};

type ContainerVariantKey =
  | 'containerPrimary'
  | 'containerSecondary'
  | 'containerSuccess'
  | 'containerWarning'
  | 'containerError'
  | 'containerNeutral';

type LabelVariantKey =
  | 'labelPrimary'
  | 'labelSecondary'
  | 'labelSuccess'
  | 'labelWarning'
  | 'labelError'
  | 'labelNeutral';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: borderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
    },
    containerSm: {
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing['3xs'],
    },
    containerMd: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing['2xs'],
    },

    containerPrimary: { backgroundColor: theme.colors.primaryContainer },
    containerSecondary: { backgroundColor: theme.colors.secondaryContainer },
    containerSuccess: { backgroundColor: theme.colors.successContainer },
    containerWarning: { backgroundColor: theme.colors.warningContainer },
    containerError: { backgroundColor: theme.colors.errorContainer },
    containerNeutral: { backgroundColor: theme.colors.border },

    label: {
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacings.wide,
    },
    labelSm: { fontSize: fontSizes.xs },
    labelMd: { fontSize: fontSizes.sm },

    labelPrimary: { color: theme.colors.primaryLight },
    labelSecondary: { color: theme.colors.secondaryLight },
    labelSuccess: { color: theme.colors.success },
    labelWarning: { color: theme.colors.warning },
    labelError: { color: theme.colors.error },
    labelNeutral: { color: theme.colors.textSecondary },

    emojiSm: {
      fontSize: iconSizes.xs,
      marginRight: spacing['2xs'],
    },
    emojiMd: {
      fontSize: iconSizes.sm,
      marginRight: spacing['2xs'],
    },
  });
