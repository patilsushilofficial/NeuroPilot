import { darkTheme, dawnTheme, duskTheme, lightTheme, Theme } from '../theme';
import { AppSettings } from '../types';

/**
 * Resolve the active theme outside React (notifications, services).
 * Mirrors `useAppTheme` time-of-day rules for the `system` preference.
 */
export const resolveAppTheme = (preference: AppSettings['theme']): Theme => {
  if (preference === 'dark') return darkTheme;
  if (preference === 'light') return lightTheme;

  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return dawnTheme;
  if (hour >= 12 && hour < 18) return lightTheme;
  if (hour >= 18 && hour < 21) return duskTheme;
  return darkTheme;
};
