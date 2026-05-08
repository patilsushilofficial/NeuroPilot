import { useCallback } from 'react';
import { useHaptics } from './useHaptics';

interface UseTabBarPressArgs {
  /** React Navigation `navigation` object passed to the tab-bar component. */
  navigation: {
    emit: (args: { type: string; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (route: string) => void;
  };
}

/**
 * Behavioural glue for the custom tab bar. Returns a `getOnPress` factory:
 * given a route plus its focus state, it produces an `onPress` handler that
 * emits the React Navigation `tabPress` event and (if the press wasn't
 * suppressed and we aren't already focused) navigates to the new tab with
 * a light haptic. Lifted out of the navigator file so the rendering code
 * stays declarative.
 */
export const useTabBarPress = ({ navigation }: UseTabBarPressArgs) => {
  const haptics = useHaptics();

  const getOnPress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        haptics.light();
        navigation.navigate(routeName);
      }
    },
    [navigation, haptics]
  );

  return { getOnPress };
};
