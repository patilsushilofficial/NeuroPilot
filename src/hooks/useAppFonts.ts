import { useEffect } from 'react';
import { isLoaded } from 'expo-font';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
} from '@expo-google-fonts/lexend';

const LEXEND_FAMILIES = [
  'Lexend_400Regular',
  'Lexend_500Medium',
  'Lexend_600SemiBold',
  'Lexend_700Bold',
  'Lexend_800ExtraBold',
] as const;

/**
 * Loads every Lexend variant the app's typography system references.
 *
 * Returns `[loaded, error]`. While `loaded` is false, callers should hold the
 * splash screen so users never see a flash of fallback system fonts.
 *
 * In dev builds this also logs which variants actually registered with the
 * native side — useful for diagnosing "fonts loaded but text shows in
 * system font" issues (typically caused by a stale Metro asset cache).
 */
export const useAppFonts = (): [boolean, Error | null] => {
  const [loaded, error] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
  });

  useEffect(() => {
    if (!__DEV__ || !loaded) return;
    const status = LEXEND_FAMILIES.map((name) => ({
      name,
      registered: isLoaded(name),
    }));
    const missing = status.filter((s) => !s.registered);
    if (missing.length > 0) {
      console.warn(
        '[NeuroPilot] Some Lexend variants did not register with the native font registry:',
        missing.map((m) => m.name)
      );
    } else {
      console.log('[NeuroPilot] All Lexend variants registered:', LEXEND_FAMILIES);
    }
  }, [loaded]);

  return [loaded, error];
};
