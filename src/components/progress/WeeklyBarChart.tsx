import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';

import { useAppTheme } from '../../hooks/useAppTheme';
import { Theme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { borderWidths, opacity as opacityTokens } from '../../theme/tokens';
import { fontSizes, fontWeights } from '../../theme/typography';
import { moderateScale } from '../../utils/responsive';
import { computeBarLayouts, chartWidth } from '../../utils/chartUtils';
import { getWeekDayLabels } from '../../utils/dateUtils';

const BAR_WIDTH = moderateScale(28);
const BAR_GAP = moderateScale(8);
const CHART_HEIGHT = moderateScale(80);

export interface WeeklyBarChartProps {
  data: number[];
  /** Filled-bar tint. */
  color: string;
  /** Caption shown above the chart, e.g. "XP Earned". */
  label: string;
  height?: number;
}

/**
 * Tiny SVG bar chart used by the Progress screen's weekly summary cards.
 * Lifted out of the screen so the screen stays declarative and the chart
 * math (`computeBarLayouts`) is exercised in `chartUtils.test.ts`.
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  color,
  label,
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

  return (
    <View>
      <Text style={[theme.text.labelSmall, styles.chartLabel]}>{label.toUpperCase()}</Text>
      <Svg width={width} height={height + spacing.md}>
        <G>
          {layouts.map((bar, i) => (
            <G key={i}>
              <Rect
                x={bar.x}
                y={0}
                width={BAR_WIDTH}
                height={bar.trackHeight}
                rx={borderRadius.sm}
                fill={theme.colors.border}
              />
              <Rect
                x={bar.x}
                y={bar.y}
                width={BAR_WIDTH}
                height={bar.fillHeight}
                rx={borderRadius.sm}
                fill={color}
                opacity={opacityTokens.hover}
              />
            </G>
          ))}
        </G>
      </Svg>
      <View style={styles.dayLabels}>
        {days.map((d, i) => (
          <Text key={i} style={[styles.dayLabel, styles.dayLabelWidth]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    chartLabel: {
      color: theme.colors.textTertiary,
      marginBottom: spacing.xs,
    },
    dayLabels: {
      flexDirection: 'row',
      marginTop: spacing['3xs'],
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
