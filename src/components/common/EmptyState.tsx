import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';
import { iconSizes } from '../../theme/tokens';

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
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[theme.text.h3, styles.title]}>{title}</Text>
      {subtitle && <Text style={[theme.text.bodyMedium, styles.subtitle]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.action}
        />
      )}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing['3xl'],
      paddingVertical: spacing['4xl'],
    },
    emoji: {
      fontSize: iconSizes['6xl'],
    },
    title: {
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing['2xs'],
    },
    action: {
      marginTop: spacing.md,
    },
  });
