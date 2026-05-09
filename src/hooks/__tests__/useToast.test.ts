import { renderHook } from '@testing-library/react-native';

import { useToast } from '../useToast';
import { toastService } from '../../services/toast';

describe('useToast', () => {
  beforeEach(() => {
    toastService.__resetForTests();
  });

  it('returns a stable object reference across re-renders', () => {
    // Useful so the hook's return value is safe to drop into a
    // useEffect / useCallback dependency array without thrashing.
    const { result, rerender } = renderHook(() => useToast());
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });

  it('show passes the full options through to the service', () => {
    const seen: any[] = [];
    toastService.subscribe((t) => seen.push(t));

    const { result } = renderHook(() => useToast());
    result.current.show({
      message: 'hi',
      title: 'Hey',
      variant: 'info',
      position: 'top',
      durationMs: 1000,
    });

    expect(seen[0]).toMatchObject({
      message: 'hi',
      title: 'Hey',
      variant: 'info',
      position: 'top',
      durationMs: 1000,
    });
  });

  // Each shorthand picks the right variant and forwards extra options.
  describe.each([
    ['success', 'success'],
    ['error', 'error'],
    ['warning', 'warning'],
    ['info', 'info'],
  ] as const)('%s shorthand', (method, expectedVariant) => {
    it('shows the message with the matching variant', () => {
      const seen: any[] = [];
      toastService.subscribe((t) => seen.push(t));

      const { result } = renderHook(() => useToast());
      result.current[method]('something happened');

      expect(seen[0]).toMatchObject({
        message: 'something happened',
        variant: expectedVariant,
      });
    });

    it('forwards extra options (e.g. position, title)', () => {
      const seen: any[] = [];
      toastService.subscribe((t) => seen.push(t));

      const { result } = renderHook(() => useToast());
      result.current[method]('done', { position: 'top', title: 'Title!' });

      expect(seen[0]).toMatchObject({
        variant: expectedVariant,
        position: 'top',
        title: 'Title!',
      });
    });
  });

  it('dismiss without an id closes the active toast', () => {
    const seen: any[] = [];
    toastService.subscribe((t) => seen.push(t));

    const { result } = renderHook(() => useToast());
    result.current.show({ message: 'x' });
    result.current.dismiss();

    expect(seen[seen.length - 1]).toBeNull();
  });

  it('dismiss with an id is forwarded to the service', () => {
    const seen: any[] = [];
    toastService.subscribe((t) => seen.push(t));

    const { result } = renderHook(() => useToast());
    const id = result.current.show({ message: 'x' });
    result.current.dismiss(id);

    expect(seen[seen.length - 1]).toBeNull();
  });
});
