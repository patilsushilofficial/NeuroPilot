import { useAppStore } from '../store';

/**
 * Returns `true` while a focus session is actively counting down (paused
 * sessions are intentionally excluded — the running state is what we want
 * to surface as a "live" cue in the tab bar / banners).
 *
 * Replaces the older `useFocusTabBadge` which returned an RN tab-screen
 * options object — that was vestigial: the custom tab bar never read those
 * options, so the badge was invisible. Returning a plain boolean lets the
 * custom bar pull the cue down to the exact icon that needs it.
 */
export const useIsFocusRunning = (): boolean => useAppStore((s) => s.active.status === 'running');
