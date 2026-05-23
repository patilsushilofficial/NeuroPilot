import { useMemo } from 'react';

import { toastService, type ToastOptions, type ToastVariant } from '../services/toast';

/** Variant shorthand options exclude the keys we set ourselves. */
type VariantShorthandOptions = Omit<ToastOptions, 'message' | 'variant'>;

/**
 * React-ergonomic façade over `toastService`.
 *
 * - Memoised so the returned object is referentially stable — safe to
 *   list in `useEffect` / `useCallback` dependency arrays without
 *   re-firing on every render.
 * - Variant shorthands (`success`, `error`, `warning`, `info`) keep the
 *   common case to one positional argument while still allowing the
 *   full options object to override defaults like position / duration.
 * - Direct passthrough for `show` and `dismiss` so callers that need
 *   explicit control (custom variant + title + position in one call)
 *   don't have to detour through the service import.
 *
 * Components that don't need React lifecycle can import `toastService`
 * directly; this hook exists so component code keeps a single React
 * idiom (call a hook, get back functions).
 */
export const useToast = () => {
  return useMemo(() => {
    const showWithVariant = (
      variant: ToastVariant,
      message: string,
      options?: VariantShorthandOptions
    ) => toastService.show({ ...options, message, variant });

    return {
      show: (options: ToastOptions) => toastService.show(options),
      dismiss: (id?: string) => toastService.dismiss(id),
      success: (message: string, options?: VariantShorthandOptions) =>
        showWithVariant('success', message, options),
      error: (message: string, options?: VariantShorthandOptions) =>
        showWithVariant('error', message, options),
      warning: (message: string, options?: VariantShorthandOptions) =>
        showWithVariant('warning', message, options),
      info: (message: string, options?: VariantShorthandOptions) =>
        showWithVariant('info', message, options),
    };
  }, []);
};
