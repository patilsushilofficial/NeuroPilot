import { renderHook } from '@testing-library/react-native';

let mockState: { active: { status: 'idle' | 'running' | 'paused' } } = {
  active: { status: 'idle' },
};

jest.mock('../../store', () => ({
  useAppStore: (selector: any) =>
    selector ? selector(mockState) : mockState,
}));

import { useIsFocusRunning } from '../useIsFocusRunning';

describe('useIsFocusRunning', () => {
  it('returns false when no session is active', () => {
    mockState = { active: { status: 'idle' } };
    const { result } = renderHook(() => useIsFocusRunning());
    expect(result.current).toBe(false);
  });

  it('returns true while the session is running', () => {
    mockState = { active: { status: 'running' } };
    const { result } = renderHook(() => useIsFocusRunning());
    expect(result.current).toBe(true);
  });

  it('returns false for paused sessions — paused is not "live"', () => {
    // Intentionally narrow: a paused session shouldn't pulse the dot in
    // the bottom nav. Locking that contract in tests prevents accidental
    // expansion of "running" later on.
    mockState = { active: { status: 'paused' } };
    const { result } = renderHook(() => useIsFocusRunning());
    expect(result.current).toBe(false);
  });
});
