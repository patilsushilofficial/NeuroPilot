import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppTheme } from './src/hooks/useAppTheme';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useGlobalFocusTicker } from './src/hooks/useGlobalFocusTicker';
import { applyLexendDefaults } from './src/theme/applyLexendDefaults';

// Keep splash screen visible during initialization
SplashScreen.preventAutoHideAsync();

// Patch <Text> / <TextInput> so every render auto-resolves the right Lexend
// variant from its fontWeight. Single source of truth for app-wide coverage.
applyLexendDefaults();

function AppContent() {
  const theme = useAppTheme();
  useAppInitialization();
  // Drives the focus countdown app-wide so the timer keeps progressing
  // (and phase transitions still award XP) regardless of which screen
  // is mounted.
  useGlobalFocusTicker();

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontError) {
      console.warn('[NeuroPilot] Lexend failed to load:', fontError);
    } else if (fontsLoaded) {
      console.log('[NeuroPilot] Lexend fonts loaded ✓');
    }
  }, [fontsLoaded, fontError]);

  // While fonts are loading, the splash screen stays visible
  // (preventAutoHideAsync above). We only render `null` until fonts are
  // ready OR loading explicitly failed (in which case we render anyway and
  // fall back to the system font, so the app is never permanently blocked
  // on a font network issue).
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
