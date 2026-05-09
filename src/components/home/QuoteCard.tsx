import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, hitSlop, iconSizes } from '../../theme/tokens';
import { fontFamilies } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';

import { Icon } from '../common/Icon';

interface QuoteCardProps {
  text: string;
  author: string;
  onRefresh?: () => void;
}

/**
 * Motivational quote with a low-opacity decorative open-quote glyph in
 * the corner. Sits in the primary container tint so it harmonises with
 * the rest of the home screen without competing for attention.
 */
export const QuoteCard: React.FC<QuoteCardProps> = ({
  text,
  author,
  onRefresh,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.glyph} accessibilityElementsHidden importantForAccessibility="no">
        “
      </Text>

      {onRefresh && (
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshBtn}
          hitSlop={hitSlop.md}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Show another quote"
        >
          <Icon
            name="refresh-cw"
            size={iconSizes.md}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      )}

      <Text style={[theme.text.bodyMedium, styles.text]}>{text}</Text>
      <Text style={[theme.text.labelSmall, styles.author]}>— {author}</Text>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      overflow: 'hidden',
      padding: spacing.md,
      paddingTop: spacing.lg,
      borderRadius: borderRadius['2xl'],
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.primaryContainer,
    },
    glyph: {
      position: 'absolute',
      top: -moderateScale(24),
      left: spacing['2xs'],
      fontSize: moderateScale(120),
      lineHeight: moderateScale(120),
      color: theme.colors.primary,
      opacity: 0.12,
      fontFamily: fontFamilies.extrabold,
    },
    refreshBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      padding: spacing['3xs'],
    },
    text: {
      color: theme.colors.textPrimary,
      fontStyle: 'italic',
      paddingRight: spacing.xl,
    },
    author: {
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
