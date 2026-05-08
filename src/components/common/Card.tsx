import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  onPress?: () => void;
  noPadding?: boolean;
  variant?: 'default' | 'surface' | 'glass';
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

  const bgColor =
    variant === 'surface'
      ? theme.colors.surface
      : variant === 'glass'
      ? theme.colors.card + 'CC' // semi-transparent
      : elevated
      ? theme.colors.cardElevated
      : theme.colors.card;

  const cardStyle: ViewStyle = {
    backgroundColor: bgColor,
    borderRadius: borderRadius.xl,
    padding: noPadding ? 0 : spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(elevated ? shadows.md : shadows.sm),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.85}
        accessible
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
