/**
 * Pure geometry helpers for SVG-based UI primitives.
 *
 * Anything a presentational SVG component needs to compute about its own
 * shape (centre, radius, stroke-aware insets, circumference) lives here so
 * the component file stays declarative and the math stays unit-testable.
 */

export interface CircleGeometry {
  /** Stroke-aware radius (the visible circle never touches the SVG edge). */
  radius: number;
  /** 2πr — used for `strokeDasharray`/`strokeDashoffset` progress arcs. */
  circumference: number;
  /** Centre x. */
  cx: number;
  /** Centre y. */
  cy: number;
}

/**
 * Compute the geometry needed to render a stroked circle inside a square
 * SVG viewport.
 *
 * The radius is inset by `strokeWidth * 2` so a thick stroke never gets
 * clipped on either side; this matches what the old inline `CircularTimer`
 * math was doing.
 */
export const computeCircleGeometry = (
  size: number,
  strokeWidth: number
): CircleGeometry => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  return { radius, circumference, cx, cy };
};

/**
 * Convert a 0..1 progress fraction into the `strokeDashoffset` value that
 * draws that fraction of the perimeter (with 0 = full circle, 1 = empty).
 */
export const dashOffsetForProgress = (
  circumference: number,
  progress: number
): number => circumference * (1 - clamp01(progress));

/**
 * Compute the 0..1 progress fraction for a remaining/total pair, guarding
 * against divide-by-zero by returning 1 (i.e. "full") when total is zero.
 */
export const remainingProgress = (
  remaining: number,
  total: number
): number => (total > 0 ? clamp01(remaining / total) : 1);

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
