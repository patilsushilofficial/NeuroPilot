import React, { useCallback, useEffect, useState } from 'react';

import { Toast } from './Toast';
import { toastService, type ToastInstance } from '../../services/toast';

/**
 * Bridges the imperative `toastService` to the React tree. Mount once
 * near the app root (inside `SafeAreaProvider` so the visual layer can
 * respect insets) — every screen automatically gets toast support and
 * no caller has to render anything itself.
 *
 * Responsibilities:
 *  - Subscribe to `toastService` and hold the active toast in local
 *    state so React can render it.
 *  - Own the auto-dismiss timer. The service is React-free on purpose,
 *    so timer management lives here where `useEffect` can clean up.
 *  - Pass the dismiss-by-id call through so a stale auto-dismiss can't
 *    close a brand-new toast that replaced the previous one.
 */
export const ToastHost: React.FC = () => {
  const [active, setActive] = useState<ToastInstance | null>(null);

  useEffect(() => toastService.subscribe(setActive), []);

  useEffect(() => {
    if (!active) return undefined;
    // Pass the id so service.dismiss() ignores us if a newer toast has
    // since replaced this one (race avoidance).
    const handle = setTimeout(() => toastService.dismiss(active.id), active.durationMs);
    return () => clearTimeout(handle);
  }, [active]);

  const handleDismiss = useCallback(() => {
    if (active) toastService.dismiss(active.id);
  }, [active]);

  if (!active) return null;
  // Keying by id forces React to remount on each new toast so the
  // entry animation replays even when only the message changed.
  return <Toast key={active.id} toast={active} onDismiss={handleDismiss} />;
};
