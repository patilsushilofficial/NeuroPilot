import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { borderWidths } from '../../theme/tokens';
import { SettingsItem } from '../../screens/settings/types';
import { SettingsRow } from './SettingsRow';

interface SettingsItemListProps {
  items: SettingsItem[];
}

export const SettingsItemList: React.FC<SettingsItemListProps> = ({ items }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <SettingsRow
            emoji={item.emoji}
            label={item.label}
            description={item.description}
            danger={item.danger}
            onPress={item.kind === 'action' ? item.onPress : undefined}
            rightText={item.kind === 'action' ? item.rightText : undefined}
            value={item.kind === 'toggle' ? item.value : undefined}
            onToggle={item.kind === 'toggle' ? item.onToggle : undefined}
          />
          {index < items.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    divider: {
      height: borderWidths.hairline,
      marginLeft: spacing['4xl'],
      backgroundColor: theme.colors.divider,
    },
  });
