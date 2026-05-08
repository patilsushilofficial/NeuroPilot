/**
 * Tiny colour helpers. Kept framework-agnostic so they're equally useful in
 * components, hooks, and tests.
 */

/**
 * Append an alpha byte to a `#RRGGBB` colour. The alpha argument is the
 * fractional opacity in the [0, 1] range.
 *
 * Example: `withAlpha('#7B6CF6', 0.2)` → `#7B6CF633`.
 *
 * Non-hex inputs are returned unchanged so callers can safely pass tokens
 * like `theme.colors.primary` even if a future swap moves colours away
 * from hex.
 */
export const withAlpha = (hexColor: string, alpha: number): string => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) return hexColor;
  const clamped = Math.max(0, Math.min(1, alpha));
  const byte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${hexColor}${byte}`;
};
