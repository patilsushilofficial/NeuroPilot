import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useAppStore, selectActiveFocus, selectStats } from '../store';
import { useHaptics } from './useHaptics';
import { getPresetById, DEFAULT_PRESET_ID } from '../constants/focusPresets';
import { FOCUS_INFO_TILES, FOCUS_PHASE_TIPS } from '../constants/focus';

interface FocusInfoItem {
  id: 'focus' | 'shortBreak' | 'longBreak' | 'xp';
  label: string;
  emoji: string;
  value: string;
}

export const useFocusTimer = () => {
  const haptics = useHaptics();

  const active = useAppStore(selectActiveFocus);
  const stats = useAppStore(selectStats);
  const shieldActive = useAppStore((s) => s.shieldActive);

  // Subscribe to actions individually so the hook does not re-render on every
  // unrelated store change (previously we destructured `useAppStore()` with no
  // selector, which subscribed to the full state tree).
  const startFocus = useAppStore((s) => s.startFocus);
  const pauseFocus = useAppStore((s) => s.pauseFocus);
  const resumeFocus = useAppStore((s) => s.resumeFocus);
  const skipPhase = useAppStore((s) => s.skipPhase);
  const abandonFocus = useAppStore((s) => s.abandonFocus);
  const getSessionsToday = useAppStore((s) => s.getSessionsToday);
  const toggleShield = useAppStore((s) => s.toggleShield);

  const [selectedPreset, setSelectedPreset] = useState<string>(DEFAULT_PRESET_ID);

  const isIdle = active.status === 'idle';
  const isRunning = active.status === 'running';
  const isPaused = active.status === 'paused';
  const isActive = isRunning || isPaused;

  // While idle, the picker drives the displayed preset; once a session is
  // running/paused, the active session's preset is the source of truth.
  const preset = getPresetById(isIdle ? selectedPreset : active.presetId);

  // When idle, the persisted `active` snapshot still reflects whatever preset
  // was last running (or the default on first launch). Derive the displayed
  // timer from the *selected* preset so picking "Deep Work" instantly shows
  // 50:00 instead of staying at the previous preset's duration.
  const displaySecondsRemaining = isIdle
    ? preset.focusMinutes * 60
    : active.secondsRemaining;
  const displayTotalSeconds = isIdle
    ? preset.focusMinutes * 60
    : active.totalSeconds;

  // The countdown interval lives in `useGlobalFocusTicker` (mounted at the
  // app root) so the timer keeps progressing even when the user is on the
  // Home / Tasks / Habits tab. This hook now just wires up actions.

  const handleStart = useCallback(() => {
    haptics.heavy();
    startFocus(selectedPreset);
  }, [selectedPreset, startFocus, haptics]);

  const handlePauseResume = useCallback(() => {
    if (isRunning) {
      haptics.medium();
      pauseFocus();
    } else {
      haptics.medium();
      resumeFocus();
    }
  }, [isRunning, pauseFocus, resumeFocus, haptics]);

  const handleAbandon = useCallback(() => {
    Alert.alert(
      'End Focus Session?',
      'Your current session progress will be saved, but the timer will stop.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            abandonFocus();
          },
        },
      ]
    );
  }, [abandonFocus, haptics]);

  const handleSelectPreset = useCallback(
    (id: string) => {
      // Guard against picking presets while a session is active. The UI only
      // shows the picker when idle, but be defensive.
      if (!isIdle) return;
      haptics.light();
      setSelectedPreset(id);
    },
    [haptics, isIdle]
  );

  const handleSkipPhase = useCallback(() => {
    haptics.light();
    skipPhase();
  }, [haptics, skipPhase]);

  const todaySessions = getSessionsToday();
  const todayFocusMinutes = todaySessions.reduce(
    (acc, s) => acc + s.totalFocusMinutes,
    0
  );

  /** ADHD tip rotates with the active phase. Pulled from constants so copy
   *  edits don't require touching the screen. */
  const tipText = FOCUS_PHASE_TIPS[active.phase];

  /** Info card tiles. The values come from the *currently displayed* preset
   *  (selected preset while idle, active preset while running) so the tiles
   *  stay in sync with the timer. */
  const infoItems = useMemo<FocusInfoItem[]>(() => {
    const valueById: Record<FocusInfoItem['id'], string> = {
      focus: `${preset.focusMinutes}m`,
      shortBreak: `${preset.shortBreakMinutes}m`,
      longBreak: `${preset.longBreakMinutes}m`,
      xp: `+${preset.focusMinutes * 2}`,
    };
    return FOCUS_INFO_TILES.map((tile) => ({ ...tile, value: valueById[tile.id] }));
  }, [preset]);

  return {
    active: {
      ...active,
      secondsRemaining: displaySecondsRemaining,
      totalSeconds: displayTotalSeconds,
    },
    stats,
    shieldActive,
    selectedPreset,
    handleSelectPreset,
    preset,

    isIdle,
    isRunning,
    isPaused,
    isActive,
    handleStart,
    handlePauseResume,
    handleAbandon,
    todaySessions,
    todayFocusMinutes,
    handleSkipPhase,
    /** @deprecated Prefer `handleSkipPhase` so haptics fire consistently. */
    skipPhase,
    toggleShield,
    tipText,
    infoItems,
  };
};
