import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes } from '../../theme/tokens';
import { letterSpacings } from '../../theme/typography';
import { Achievement } from '../../types';

import { Icon } from '../common/Icon';
import { AchievementCard } from './AchievementCard';
import { LockedAchievementRow } from './LockedAchievementRow';

interface AchievementsSectionProps {
  unlocked: Achievement[];
  locked: Achievement[];
  /** Cap on the number of locked items shown so the screen doesn't grow
   *  unbounded as the achievement set expands. */
  lockedLimit?: number;
}

const DEFAULT_LOCKED_LIMIT = 6;

/**
 * Composes the unlocked grid, the locked list, and the empty state into
 * a single section. This component owns ONLY the orchestration: which
 * sub-views to show, how many locked rows to render, and the "more to
 * discover" tail. The look-and-feel of an individual card / row lives
 * in `AchievementCard` / `LockedAchievementRow` so each visual unit can
 * evolve (or be reused elsewhere) without touching the section logic.
 */
export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  unlocked,
  locked,
  lockedLimit = DEFAULT_LOCKED_LIMIT,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const visibleLocked = locked.slice(0, lockedLimit);
  const hiddenLockedCount = locked.length - visibleLocked.length;
  const isEmpty = unlocked.length === 0 && locked.length === 0;

  if (isEmpty) {
    return <AchievementsEmptyState />;
  }

  return (
    <View style={styles.container}>
      {unlocked.length > 0 && (
        <View style={styles.unlockedGrid}>
          {unlocked.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </View>
      )}

      {visibleLocked.length > 0 && (
        <View style={styles.lockedList}>
          <View style={styles.lockedHeader}>
            <Icon name="lock" size={iconSizes.sm} color={theme.colors.textTertiary} />
            <Text style={[theme.text.labelSmall, styles.lockedHeading]}>
              UP NEXT ({locked.length})
            </Text>
          </View>

          {visibleLocked.map((a) => (
            <LockedAchievementRow key={a.id} achievement={a} />
          ))}

          {hiddenLockedCount > 0 && (
            <Text style={[theme.text.bodySmall, styles.moreLabel]}>
              + {hiddenLockedCount} more to discover
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Inline empty-state. Kept inside this file (rather than its own
 * component) because it has no reuse value outside this section.
 */
const AchievementsEmptyState: React.FC = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.empty}>
      <Icon name="award" size={iconSizes.xl} color={theme.colors.textTertiary} />
      <Text style={[theme.text.bodyMedium, styles.emptyText]}>
        Achievements appear here as you build your habits.
      </Text>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    unlockedGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    lockedList: {
      gap: spacing['2xs'],
    },
    lockedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['2xs'],
      paddingHorizontal: spacing['3xs'],
      marginBottom: spacing['3xs'],
    },
    lockedHeading: {
      color: theme.colors.textTertiary,
      letterSpacing: letterSpacings.wider,
    },
    moreLabel: {
      color: theme.colors.textTertiary,
      textAlign: 'center',
      paddingTop: spacing['3xs'],
    },
    empty: {
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: borderRadius.xl,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
