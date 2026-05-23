import { useCallback, useMemo, useRef, useState } from 'react';
import {
  NavigationContainerRef,
  NavigationContainerRefWithCurrent,
} from '@react-navigation/native';

import { RootStackParamList } from '../navigation/types';
import { useAppTheme } from './useAppTheme';
import { useHaptics } from './useHaptics';

interface NavigationScreenTracker {
  /** Ref to attach to the `<NavigationContainer>`. */
  navigationRef: React.MutableRefObject<NavigationContainerRef<RootStackParamList> | null>;
  /** Name of the currently focused route, or `undefined` while booting. */
  currentScreen: string | undefined;
  /** Theme object shaped for `<NavigationContainer theme={...}>`. */
  navigationTheme: {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  };
  /** Opens the modal Debug screen with a warning haptic. */
  openDebug: () => void;
  /** Pass to `<NavigationContainer onReady={...}>`. */
  handleReady: () => void;
  /** Pass to `<NavigationContainer onStateChange={...}>`. */
  handleStateChange: () => void;
}

/**
 * Wraps the navigation diagnostics that the root navigator needs:
 *  - A persistent `navigationRef` that survives renders.
 *  - The currently focused route name (drives the dev-only badge).
 *  - A `navigationTheme` derived from the app theme.
 *  - An `openDebug` helper that fires haptics and pushes the Debug modal.
 *
 * Pulled out of `RootNavigator.tsx` so the navigator can stay declarative.
 */
export const useNavigationScreenTracker = (): NavigationScreenTracker => {
  const theme = useAppTheme();
  const haptics = useHaptics();

  const navigationRef = useRef<NavigationContainerRefWithCurrent<RootStackParamList> | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string | undefined>('Home');

  const navigationTheme = useMemo(
    () => ({
      dark: theme.mode === 'dark',
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.error,
      },
    }),
    [theme]
  );

  const handleReady = useCallback(() => {
    setCurrentScreen(navigationRef.current?.getCurrentRoute()?.name);
  }, []);

  const handleStateChange = useCallback(() => {
    setCurrentScreen(navigationRef.current?.getCurrentRoute()?.name);
  }, []);

  const openDebug = useCallback(() => {
    haptics.warning();
    navigationRef.current?.navigate('Debug');
  }, [haptics]);

  return {
    navigationRef,
    currentScreen,
    navigationTheme,
    openDebug,
    handleReady,
    handleStateChange,
  };
};
