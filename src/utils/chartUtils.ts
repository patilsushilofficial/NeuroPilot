/**
 * Pure helpers for the small SVG charts on the Progress screen. Extracted so
 * the bar-height math can be unit-tested without mounting React Native.
 */

export interface BarLayout {
  /** X offset of the bar in chart-local coordinates. */
  x: number;
  /** Top edge of the filled portion (chart-local). */
  y: number;
  /** Total chart height — equal for every bar (this is the track height). */
  trackHeight: number;
  /** Filled height in pixels, never below `minHeight` so a non-zero datum is
   *  always visually present. */
  fillHeight: number;
}

interface BarLayoutOptions {
  /** Numeric data series. */
  data: readonly number[];
  /** Chart height in pixels. */
  height: number;
  /** Width of a single bar in pixels. */
  barWidth: number;
  /** Horizontal gap between bars in pixels. */
  barGap: number;
  /** Minimum visible height to apply when a value is non-zero (defaults to
   *  `0`, callers usually pass a small number like `borderWidths.thick`). */
  minHeight?: number;
}

/**
 * Convert a numeric series into a list of bar layouts ready to feed an SVG
 * renderer. Heights are scaled relative to the maximum value in the series
 * (with a floor of `1` so an all-zero series still draws empty tracks).
 */
export const computeBarLayouts = ({
  data,
  height,
  barWidth,
  barGap,
  minHeight = 0,
}: BarLayoutOptions): BarLayout[] => {
  const max = Math.max(...data, 1);
  return data.map((value, index) => {
    const barH = (value / max) * height;
    return {
      x: index * (barWidth + barGap),
      y: height - barH,
      trackHeight: height,
      fillHeight: Math.max(barH, minHeight),
    };
  });
};

/** Total chart width given a series, bar size, and gap. */
export const chartWidth = (length: number, barWidth: number, barGap: number): number =>
  length * (barWidth + barGap);
