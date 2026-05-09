import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';
import { computeBarLayouts, chartWidth } from '../../utils/chartUtils';
import { getWeekDayLabels } from '../../utils/dateUtils';

const BAR_WIDTH = moderateScale(28);
const BAR_GAP = moderateScale(10);
const CHART_HEIGHT = moderateScale(96);
const HIGHLIGHT_RING_RADIUS = moderateScale(6);

export interface WeeklyBarChartProps {
  data: number[];
  /** Filled-bar tint. */
  color: string;
  /**
   * Index of the bar that should be visually emphasised (today). When
   * provided, the matching column gets a brighter fill, a halo ring, and
   * an accent label. Pass `undefined` to disable highlighting entirely.
   */
  highlightIndex?: number;
  height?: number;
}

/**
 * Compact SVG bar chart used inside `WeeklyActivityCard`. Renders 7 days
 * of data (Sun→Sat) with `today` emphasised so the user can tell at a
 * glance how the current day compares to the rest of the week.
 *
 * The chart math (`computeBarLayouts`) lives in `chartUtils.ts` so the
 * pixel positions stay unit-tested.
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  color,
  highlightIndex,
  height = CHART_HEIGHT,
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = getWeekDayLabels();
  const width = chartWidth(data.length, BAR_WIDTH, BAR_GAP);

  const layouts = useMemo(
    () =>
      computeBarLayouts({
        data,
        height,
        barWidth: BAR_WIDTH,
        barGap: BAR_GAP,
        minHeight: borderWidths.thick,
      }),
    [data, height]
  );

  const trackColor = theme.colors.border;
  const dimmedColor = color + '66'; // ~40% alpha for non-highlight bars
  const highlightColor = color;

  return (
    <View>
      <Svg width={width} height={height} accessibilityRole="image">
        <G>
          {layouts.map((bar, i) => {
            const isHighlighted = i === highlightIndex;
            const fill = isHighlighted ? highlightColor : dimmedColor;
            return (
              <G key={i}>
                <Rect
                  x={bar.x}
                  y={0}
                  width={BAR_WIDTH}
                  height={bar.trackHeight}
                  rx={borderRadius.sm}
                  fill={trackColor}
                />
                <Rect
                  x={bar.x}
                  y={bar.y}
                  width={BAR_WIDTH}
                  height={bar.fillHeight}
                  rx={borderRadius.sm}
                  fill={fill}
                />
                {isHighlighted && (
                  <Rect
                    x={bar.x - borderWidths.thick}
                    y={bar.y - borderWidths.thick}
                    width={BAR_WIDTH + borderWidths.thick * 2}
                    height={bar.fillHeight + borderWidths.thick * 2}
                    rx={HIGHLIGHT_RING_RADIUS}
                    fill="none"
                    stroke={highlightColor}
                    strokeOpacity={0.35}
                    strokeWidth={borderWidths.base}
                  />
                )}
              </G>
            );
          })}
        </G>
      </Svg>

      <View style={styles.labelRow}>
        {days.map((d, i) => {
          const isHighlighted = i === highlightIndex;
          return (
            <Text
              key={i}
              style={[
                styles.dayLabel,
                styles.dayLabelWidth,
                isHighlighted && { color: highlightColor },
              ]}
            >
              {d}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    labelRow: {
      flexDirection: 'row',
      marginTop: spacing.xs,
    },
    dayLabel: {
      fontSize: fontSizes.xs,
      textAlign: 'center',
      fontWeight: fontWeights.semibold,
      color: theme.colors.textTertiary,
    },
    dayLabelWidth: {
      width: BAR_WIDTH + BAR_GAP,
    },
  });
