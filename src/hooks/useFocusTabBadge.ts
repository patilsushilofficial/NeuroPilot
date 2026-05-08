import { useMemo } from 'react';
import { useAppStore } from '../store';

/**
 * Reads the active focus session status from the store and returns the
 * `tabBarBadge` options object expected by React Navigation. Pulled out of
 * the navigator so the navigator never reads from the store directly.
 */
export const useFocusTabBadge = () => {
  const isFocusRunning = useAppStore((s) => s.active.status === 'running');

  return useMemo(
    () => ({ tabBarBadge: isFocusRunning ? '●' : undefined }),
    [isFocusRunning]
  );
};
