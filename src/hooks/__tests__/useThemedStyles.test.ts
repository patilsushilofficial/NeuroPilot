import { renderHook } from '@testing-library/react-native';
import { useThemedStyles } from '../useThemedStyles';
import { useAppStore } from '../../store';
import { darkTheme } from '../../theme';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

describe('useThemedStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue('dark');
  });

  it('returns the StyleSheet produced by the factory', () => {
    const factory = jest.fn((theme) => ({
      box: { backgroundColor: theme.colors.background },
    }));

    const { result } = renderHook(() => useThemedStyles(factory));

    expect(factory).toHaveBeenCalledWith(darkTheme);
    expect(result.current.box).toEqual({ backgroundColor: darkTheme.colors.background });
  });

  it('memoizes the resulting stylesheet across renders when the factory and theme are stable', () => {
    const factory = jest.fn((theme) => ({
      surface: { backgroundColor: theme.colors.surface },
    }));

    const { result, rerender } = renderHook(() => useThemedStyles(factory));
    const first = result.current;

    rerender(undefined);
    const second = result.current;

    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('rebuilds the stylesheet when the factory changes', () => {
    const factoryA = jest.fn((theme) => ({ a: { color: theme.colors.primary } }));
    const factoryB = jest.fn((theme) => ({ b: { color: theme.colors.secondary } }));

    const { result, rerender } = renderHook(({ factory }: { factory: any }) => useThemedStyles(factory), {
      initialProps: { factory: factoryA as any },
    });
    const first = result.current;
    expect(first).toHaveProperty('a');

    rerender({ factory: factoryB as any });
    const second = result.current;

    expect(second).toHaveProperty('b');
    expect(first).not.toBe(second);
  });
});
