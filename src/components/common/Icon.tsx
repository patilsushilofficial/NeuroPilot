import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { iconSizes } from '../../theme/tokens';

/**
 * Subset of Feather glyph names used across the app. Centralising this
 * here means the rest of the codebase never has to type-string an icon
 * name — autocomplete points at the curated set, and a future icon-set
 * swap (Lucide, custom SVGs, etc.) only edits this one file.
 */
export type IconName =
  | 'settings'
  | 'edit-2'
  | 'edit-3'
  | 'check-circle'
  | 'check'
  | 'zap'
  | 'clock'
  | 'target'
  | 'plus-square'
  | 'plus'
  | 'repeat'
  | 'trending-up'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-right'
  | 'refresh-cw'
  | 'mic'
  | 'bell'
  | 'circle'
  | 'lock'
  | 'award'
  | 'activity'
  | 'bar-chart-2'
  | 'calendar'
  | 'home'
  | 'list';

interface IconProps {
  name: IconName;
  /**
   * Pixel size of the glyph. Defaults to {@link iconSizes.md} so consumers
   * can omit the prop in 80 % of cases and still match the rest of the UI.
   */
  size?: number;
  /**
   * Stroke / fill colour. Defaults to `theme.colors.textPrimary` so an
   * icon dropped into a card naturally inherits the text colour of its
   * surroundings.
   */
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = iconSizes.md,
  color,
}) => {
  const theme = useAppTheme();
  return (
    <Feather
      name={name}
      size={size}
      color={color ?? theme.colors.textPrimary}
    />
  );
};
