import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, iconSizes, opacity } from '../../theme/tokens';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
} from '../../theme/typography';

import { Card } from '../common/Card';
import { Icon, IconName } from '../common/Icon';
import { WeeklyBarChart } from './WeeklyBarChart';

type Metric = 'xp' | 'tasks';

interface WeeklyActivityCardProps {
  weeklyXP: number[];
  weeklyTasks: number[];
  weeklyXPTotal: number;
  weeklyTasksTotal: number;
  /** Sun=0..Sat=6 — which bar to highlight as "today". */
  todayWeekIndex: number;
}

interface MetricMeta {
  key: Metric;
  label: string;
  icon: IconName;
  totalSuffix: string;
}

const METRICS: MetricMeta[] = [
  { key: 'xp', label: 'XP', icon: 'zap', totalSuffix: 'XP' },
  { key: 'tasks', label: 'Tasks', icon: 'check-circle', totalSuffix: 'completed' },
];

/**
 * "This Week" summary card. A segmented control flips between XP-earned
 * and tasks-completed so the bar chart isn't duplicated, and the total
 * for the visible metric anchors the user's gaze before they scan the
 * per-day bars.
 *
 * The highlighted bar (today) reuses the chart's accent colour so the
 * "you are here" cue is consistent across the two metrics.
 */
export const WeeklyActivityCard: React.FC<WeeklyActivityCardProps> = ({
  weeklyXP,
  weeklyTasks,
  weeklyXPTotal,
  weeklyTasksTotal,
  todayWeekIndex,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [metric, setMetric] = useState<Metric>('xp');

  const isXP = metric === 'xp';
  const data = isXP ? weeklyXP : weeklyTasks;
  const total = isXP ? weeklyXPTotal : weeklyTasksTotal;
  const accent = isXP ? theme.colors.primary : theme.colors.success;
  const todayValue = data[todayWeekIndex] ?? 0;
  const peakValue = useMemo(() => Math.max(...data, 0), [data]);

  const activeMeta = METRICS.find((m) => m.key === metric);

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={[theme.text.labelSmall, styles.weekLabel]}>
          THIS WEEK
        </Text>

        <View
          style={styles.segmentedControl}
          accessible
          accessibilityRole="tablist"
        >
          {METRICS.map((m) => {
            const selected = m.key === metric;
            return (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMetric(m.key)}
                style={[styles.segment, selected && styles.segmentActive]}
                activeOpacity={opacity.hover}
                accessible
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={`Show ${m.label}`}
              >
                <Icon
                  name={m.icon}
                  size={iconSizes.sm}
                  color={selected ? theme.colors.textOnPrimary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    theme.text.labelSmall,
                    styles.segmentLabel,
                    selected && styles.segmentLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Render the digits and the unit as TWO sibling Texts inside a
          baseline row. Nesting a smaller `Text` inside the larger one
          (the original layout) makes RN size the parent against the
          smaller child's `lineHeight` and clip the top of the bold
          digits — which is exactly the "broken number" the user saw. */}
      <View style={styles.totalRow}>
        <Text style={styles.totalNumber} numberOfLines={1} allowFontScaling={false}>
          {total.toLocaleString()}
        </Text>
        <Text style={styles.totalSuffix} numberOfLines={1}>
          {activeMeta?.totalSuffix}
        </Text>
      </View>

      <View style={styles.chartWrap}>
        <WeeklyBarChart data={data} color={accent} highlightIndex={todayWeekIndex} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <View style={[styles.metaDot, { backgroundColor: accent }]} />
          <Text style={[theme.text.bodySmall, styles.metaText]}>
            Today: <Text style={styles.metaValue}>{todayValue.toLocaleString()}</Text>
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon
            name="bar-chart-2"
            size={iconSizes.sm}
            color={theme.colors.textTertiary}
          />
          <Text style={[theme.text.bodySmall, styles.metaText]}>
            Peak: <Text style={styles.metaValue}>{peakValue.toLocaleString()}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    weekLabel: {
      flexShrink: 1,
      color: theme.colors.textTertiary,
      letterSpacing: letterSpacings.wider,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
      gap: spacing['2xs'],
      marginTop: spacing['2xs'],
      // A bit of vertical breathing room to absorb Lexend's tall
      // ascenders so bold digits never butt up against the bounding box.
      paddingVertical: spacing['3xs'],
    },
    totalNumber: {
      flexShrink: 1,
      color: theme.colors.textPrimary,
      fontFamily: fontFamilies.bold,
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      // 1.6× lineHeight (vs. the default 1.5× in `theme.text.h2`) gives
      // the glyphs enough room that RN's text engine doesn't crop the
      // tops/bottoms of bold digits when the font's actual cap-height
      // pushes against the bounding box.
      lineHeight: Math.ceil(fontSizes.xl * 1.6),
      letterSpacing: letterSpacings.tight,
      // Android-only: `includeFontPadding` adds invisible padding around
      // glyphs that, combined with our explicit lineHeight, can produce
      // off-baseline rendering. Disabling it gives consistent results.
      includeFontPadding: false,
    },
    totalSuffix: {
      color: theme.colors.textSecondary,
      fontFamily: fontFamilies.semibold,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      lineHeight: fontSizes.sm * lineHeights.normal,
      letterSpacing: letterSpacings.wide,
    },
    segmentedControl: {
      flexShrink: 0,
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.full,
      borderWidth: borderWidths.thin,
      borderColor: theme.colors.border,
      padding: spacing['3xs'],
      gap: spacing['3xs'],
    },
    segment: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['3xs'],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing['2xs'],
      borderRadius: borderRadius.full,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentLabel: {
      color: theme.colors.textSecondary,
    },
    segmentLabelActive: {
      color: theme.colors.textOnPrimary,
    },
    chartWrap: {
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing['2xs'],
    },
    metaDot: {
      width: spacing.xs,
      height: spacing.xs,
      borderRadius: spacing.xs / 2,
    },
    metaText: {
      color: theme.colors.textSecondary,
    },
    metaValue: {
      color: theme.colors.textPrimary,
    },
  });
