/**
 * Toast — visual flavour. Drives the colour accent and leading icon
 * picked by the `<Toast>` component.
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

/** Where the toast slides in from. */
export type ToastPosition = 'top' | 'bottom';

/** Default time on screen before the toast auto-dismisses. */
export const DEFAULT_TOAST_DURATION_MS = 3500;

export interface ToastOptions {
  /** Required body copy. Single-line truncated by the component. */
  message: string;
  /** Optional bold title rendered above the message. */
  title?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  /** Auto-dismiss delay in ms. Defaults to {@link DEFAULT_TOAST_DURATION_MS}. */
  durationMs?: number;
}

/** Fully-resolved toast — the shape consumers (Host / Toast component) get. */
export interface ToastInstance {
  id: string;
  message: string;
  title: string;
  variant: ToastVariant;
  position: ToastPosition;
  durationMs: number;
}

type Listener = (toast: ToastInstance | null) => void;

/**
 * Imperative toast hub.
 *
 * Pub/sub singleton with **zero React or theme dependencies** — anyone
 * (a hook, a service, a navigation guard) can call `toastService.show(...)`
 * and the mounted `<ToastHost>` listener picks it up. This split lets us
 * keep the slice/store layer free of React imports while still enabling
 * UI feedback from non-component code.
 *
 * Single-slot semantics (only one toast visible at a time): a fresh
 * `show` replaces the previous toast immediately. This is intentional —
 * a queue would let the most-recent message wait behind a stale one,
 * which is the opposite of the urgency a toast is for.
 */
class ToastService {
  private listeners = new Set<Listener>();
  private currentId: string | null = null;
  private idCounter = 0;

  /**
   * Subscribe to toast lifecycle. The listener is called with the new
   * toast on `show` and with `null` on `dismiss`. Returns an unsubscribe
   * function — `<ToastHost>` calls this in its `useEffect` cleanup.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Show a toast. Returns the new toast's id so callers can later
   * dismiss it explicitly (rare — the auto-dismiss timer handles 99% of
   * cases).
   */
  show(options: ToastOptions): string {
    this.idCounter += 1;
    const id = `toast_${this.idCounter}`;
    const instance: ToastInstance = {
      id,
      message: options.message,
      title: options.title ?? '',
      variant: options.variant ?? 'default',
      position: options.position ?? 'bottom',
      durationMs: options.durationMs ?? DEFAULT_TOAST_DURATION_MS,
    };
    this.currentId = id;
    this.emit(instance);
    return id;
  }

  /**
   * Dismiss the active toast. When `id` is given, the call is ignored
   * unless it matches the currently-shown toast — this prevents a
   * stale auto-dismiss timer from clearing a brand-new toast that was
   * shown right after the previous one.
   */
  dismiss(id?: string): void {
    if (id !== undefined && id !== this.currentId) return;
    if (this.currentId === null) return;
    this.currentId = null;
    this.emit(null);
  }

  private emit(toast: ToastInstance | null): void {
    for (const listener of this.listeners) listener(toast);
  }

  /**
   * Test-only escape hatch — clears subscribers and the current id so
   * tests can run without inheriting state from each other. Production
   * code should never need to reach for this.
   */
  __resetForTests(): void {
    this.listeners.clear();
    this.currentId = null;
    this.idCounter = 0;
  }
}

export const toastService = new ToastService();
