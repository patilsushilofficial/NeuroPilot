import React, { useMemo } from 'react';
import { View, ViewStyle, StyleProp, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { borderWidths, opacity } from '../../theme/tokens';

type CardVariant = 'default' | 'surface' | 'glass';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  noPadding?: boolean;
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  onPress,
  noPadding = false,
  variant = 'default',
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const variantStyle =
    variant === 'surface'
      ? styles.cardSurface
      : variant === 'glass'
      ? styles.cardGlass
      : elevated
      ? styles.cardElevated
      : styles.cardDefault;

  const composedStyle = [
    styles.card,
    variantStyle,
    elevated ? styles.shadowElevated : styles.shadowResting,
    noPadding ? styles.cardNoPadding : styles.cardPadded,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={composedStyle}
        onPress={onPress}
        activeOpacity={opacity.hover}
        accessible
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={composedStyle}>{children}</View>;
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
    },
    cardPadded: {
      padding: spacing.md,
    },
    cardNoPadding: {
      padding: 0,
    },
    cardDefault: {
      backgroundColor: theme.colors.card,
    },
    cardElevated: {
      backgroundColor: theme.colors.cardElevated,
    },
    cardSurface: {
      backgroundColor: theme.colors.surface,
    },
    cardGlass: {
      backgroundColor: theme.colors.card + 'CC',
    },
    shadowResting: shadows.sm,
    shadowElevated: shadows.md,
  });
