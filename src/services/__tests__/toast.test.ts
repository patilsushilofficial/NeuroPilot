import { DEFAULT_TOAST_DURATION_MS, toastService, type ToastInstance } from '../toast';

describe('toastService', () => {
  beforeEach(() => {
    toastService.__resetForTests();
  });

  describe('show', () => {
    it('emits a fully-resolved instance to subscribers', () => {
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      toastService.show({ message: 'Hi' });

      expect(seen).toHaveLength(1);
      // Defaults are applied here so consumers can render without
      // null-checking every optional field.
      expect(seen[0]).toMatchObject({
        message: 'Hi',
        title: '',
        variant: 'default',
        position: 'bottom',
        durationMs: DEFAULT_TOAST_DURATION_MS,
      });
      expect(seen[0]?.id).toMatch(/^toast_/);
    });

    it('preserves caller-supplied options when present', () => {
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      toastService.show({
        message: 'Done',
        title: 'Saved',
        variant: 'success',
        position: 'top',
        durationMs: 1000,
      });

      expect(seen[0]).toMatchObject({
        title: 'Saved',
        variant: 'success',
        position: 'top',
        durationMs: 1000,
      });
    });

    it('replaces an in-flight toast when a new one is shown', () => {
      // Single-slot semantics — we never want a stale message blocking
      // a brand-new one.
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      toastService.show({ message: 'first' });
      toastService.show({ message: 'second' });

      expect(seen).toHaveLength(2);
      expect(seen[1]?.message).toBe('second');
      expect(seen[0]?.id).not.toBe(seen[1]?.id);
    });

    it('returns the new toast id so callers can dismiss imperatively', () => {
      const id = toastService.show({ message: 'x' });
      expect(id).toMatch(/^toast_/);
    });

    it('issues monotonically unique ids across calls', () => {
      const a = toastService.show({ message: 'a' });
      const b = toastService.show({ message: 'b' });
      expect(a).not.toBe(b);
    });
  });

  describe('dismiss', () => {
    it('emits null to subscribers when called without an id', () => {
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      toastService.show({ message: 'x' });
      toastService.dismiss();

      expect(seen).toEqual([expect.objectContaining({ message: 'x' }), null]);
    });

    it('dismisses by id when the id matches the active toast', () => {
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      const id = toastService.show({ message: 'x' });
      toastService.dismiss(id);

      expect(seen[seen.length - 1]).toBeNull();
    });

    it('ignores dismiss-by-id when the id is stale', () => {
      // Critical guard: an auto-dismiss timer for an old toast must
      // not silently close a brand-new toast that replaced it.
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      const staleId = toastService.show({ message: 'first' });
      toastService.show({ message: 'second' });
      toastService.dismiss(staleId);

      // We expect [first, second] only — no trailing null.
      expect(seen).toHaveLength(2);
      expect(seen[1]?.message).toBe('second');
    });

    it('is a no-op when nothing is currently shown', () => {
      const seen: (ToastInstance | null)[] = [];
      toastService.subscribe((t) => seen.push(t));

      toastService.dismiss();
      toastService.dismiss('does_not_exist');

      expect(seen).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('returns an unsubscribe function that stops further emissions', () => {
      const seen: (ToastInstance | null)[] = [];
      const unsubscribe = toastService.subscribe((t) => seen.push(t));

      toastService.show({ message: 'first' });
      unsubscribe();
      toastService.show({ message: 'second' });

      expect(seen).toHaveLength(1);
      expect(seen[0]?.message).toBe('first');
    });

    it('fans out a single emission to every subscriber', () => {
      const a = jest.fn();
      const b = jest.fn();
      toastService.subscribe(a);
      toastService.subscribe(b);

      toastService.show({ message: 'x' });

      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });
  });
});
