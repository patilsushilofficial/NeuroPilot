import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.sectionBlock}>
      <Text style={[theme.text.labelSmall, styles.sectionHeader]}>{title}</Text>
      {children}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    sectionBlock: {
      gap: spacing.xs,
    },
    sectionHeader: {
      color: theme.colors.textTertiary,
      paddingHorizontal: spacing['3xs'],
      letterSpacing: 0.6,
    },
  });
