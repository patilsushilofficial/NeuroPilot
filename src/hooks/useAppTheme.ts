import { useColorScheme } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { darkTheme, lightTheme, dawnTheme, duskTheme, Theme } from '../theme';

/**
 * Returns the time-of-day ThemeMode based on the current hour.
 *  06:00–11:59 → dawn   (warm sunrise palette)
 *  12:00–17:59 → light  (clean daytime palette)
 *  18:00–20:59 → dusk   (twilight palette)
 *  21:00–05:59 → dark   (OLED night palette)
 */
function getTimeOfDayTheme(): Theme {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return dawnTheme;
  if (hour >= 12 && hour < 18) return lightTheme;
  if (hour >= 18 && hour < 21) return duskTheme;
  return darkTheme;
}

/**
 * useAppTheme — Returns the active theme object.
 * When preference is 'system', theme updates automatically every minute
 * as time-of-day transitions occur.
 */
export const useAppTheme = (): Theme => {
  const preference = useAppStore((s) => s.settings.theme);
  const systemScheme = useColorScheme();

  // Reactive clock — triggers a re-render every 60 seconds so time-based
  // themes transition smoothly as the hour changes.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (preference !== 'system') return;
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [preference]);

  return useMemo(() => {
    if (preference === 'dark') return darkTheme;
    if (preference === 'light') return lightTheme;
    // 'system' → resolve by time-of-day
    return getTimeOfDayTheme();
  }, [preference, systemScheme, tick]);
};
