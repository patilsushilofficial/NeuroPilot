import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, controlSizes, iconSizes } from '../../theme/tokens';
import { letterSpacings } from '../../theme/typography';

import { Icon, IconName } from '../common/Icon';

interface HeadlineStatsProps {
  /** Display-ready value strings, computed by `useProgressScreen`. */
  tasks: string;
  habits: string;
  focus: string;
}

/** Internal: declarative blueprint for one tile. */
interface StatTile {
  key: 'tasks' | 'habits' | 'focus';
  icon: IconName;
  label: string;
  /** `theme.colors.<key>` accent. */
  accentKey: 'primary' | 'success' | 'streakFire';
  /** `theme.colors.<key>` tinted halo behind the icon. */
  tintKey: 'primaryContainer' | 'successContainer' | 'warningContainer';
}

const ICON_WRAP_SIZE = controlSizes.buttonHeight.sm;

/**
 * Visual configuration of the three marquee tiles. Lives outside the
 * component so the tile metadata reads as data, not as JSX, and so a
 * future add/reorder is a one-line change.
 */
const TILE_BLUEPRINT: StatTile[] = [
  {
    key: 'tasks',
    icon: 'check-circle',
    label: 'Tasks',
    accentKey: 'success',
    tintKey: 'successContainer',
  },
  {
    key: 'habits',
    icon: 'repeat',
    label: 'Habits',
    accentKey: 'streakFire',
    tintKey: 'warningContainer',
  },
  {
    key: 'focus',
    icon: 'clock',
    label: 'Focus',
    accentKey: 'primary',
    tintKey: 'primaryContainer',
  },
];

/**
 * Three marquee stat tiles shown directly under the hero. Purely
 * presentational — receives display-ready strings from the view-model so
 * any unit-formatting (minutes → "4h 30m") happens upstream and this
 * component never touches the domain.
 */
export const HeadlineStats: React.FC<HeadlineStatsProps> = ({ tasks, habits, focus }) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const valueByKey: Record<StatTile['key'], string> = { tasks, habits, focus };

  return (
    <View style={styles.row}>
      {TILE_BLUEPRINT.map((tile) => {
        const accent = theme.colors[tile.accentKey];
        const tint = theme.colors[tile.tintKey];
        const value = valueByKey[tile.key];
        return (
          <View
            key={tile.key}
            style={styles.tile}
            accessible
            accessibilityLabel={`${tile.label}: ${value}`}
          >
            <View style={[styles.iconWrap, { backgroundColor: tint }]}>
              <Icon name={tile.icon} size={iconSizes.md} color={accent} />
            </View>
            <Text style={[theme.text.h3, { color: accent }]} numberOfLines={1}>
              {value}
            </Text>
            <Text style={[theme.text.labelSmall, styles.label]}>{tile.label.toUpperCase()}</Text>
          </View>
        );
      })}
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    tile: {
      flex: 1,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      alignItems: 'center',
      gap: spacing['2xs'],
    },
    iconWrap: {
      width: ICON_WRAP_SIZE,
      height: ICON_WRAP_SIZE,
      borderRadius: ICON_WRAP_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: theme.colors.textTertiary,
      letterSpacing: letterSpacings.wider,
    },
  });
