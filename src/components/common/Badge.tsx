import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { borderRadius, spacing } from '../../theme/spacing';

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

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: theme.colors.primaryContainer, text: theme.colors.primaryLight },
    secondary: { bg: theme.colors.secondaryContainer, text: theme.colors.secondaryLight },
    success: { bg: theme.colors.successContainer, text: theme.colors.success },
    warning: { bg: theme.colors.warningContainer, text: theme.colors.warning },
    error: { bg: theme.colors.errorContainer, text: theme.colors.error },
    neutral: { bg: theme.colors.border, text: theme.colors.textSecondary },
  };

  const { bg, text } = variantColors[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 3 : 5,
          borderRadius: borderRadius.full,
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {emoji && (
        <Text style={{ fontSize: isSmall ? 11 : 13, marginRight: 4 }}>{emoji}</Text>
      )}
      <Text
        style={{
          color: text,
          fontSize: isSmall ? 11 : 13,
          fontWeight: '600',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
