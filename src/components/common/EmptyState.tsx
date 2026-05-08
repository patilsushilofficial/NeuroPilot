import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[theme.text.h3, { color: theme.colors.textPrimary, textAlign: 'center', marginTop: spacing[1] }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            theme.text.bodyMedium,
            { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing[0.5], lineHeight: 22 },
          ]}
        >
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: spacing[2] }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
  },
  emoji: {
    fontSize: 56,
  },
});
