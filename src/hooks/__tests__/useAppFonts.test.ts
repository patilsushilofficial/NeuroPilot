import { renderHook } from '@testing-library/react-native';

const mockUseFonts = jest.fn().mockReturnValue([true, null]);
const mockIsLoaded = jest.fn().mockReturnValue(true);

jest.mock('@expo-google-fonts/lexend', () => ({
  useFonts: (...args: unknown[]) => mockUseFonts(...args),
  Lexend_400Regular: 'Lexend_400Regular',
  Lexend_500Medium: 'Lexend_500Medium',
  Lexend_600SemiBold: 'Lexend_600SemiBold',
  Lexend_700Bold: 'Lexend_700Bold',
  Lexend_800ExtraBold: 'Lexend_800ExtraBold',
}));

jest.mock('expo-font', () => ({
  isLoaded: (name: string) => mockIsLoaded(name),
}));

import { useAppFonts } from '../useAppFonts';

describe('useAppFonts', () => {
  beforeEach(() => {
    mockUseFonts.mockClear();
    mockIsLoaded.mockClear();
    mockUseFonts.mockReturnValue([true, null]);
    mockIsLoaded.mockReturnValue(true);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a [loaded, error] tuple from expo-font', () => {
    const { result } = renderHook(() => useAppFonts());
    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBeNull();
  });

  it('requests every Lexend weight the app uses', () => {
    renderHook(() => useAppFonts());

    expect(mockUseFonts).toHaveBeenCalledTimes(1);
    const [requested] = mockUseFonts.mock.calls[0];
    expect(Object.keys(requested as object).sort()).toEqual([
      'Lexend_400Regular',
      'Lexend_500Medium',
      'Lexend_600SemiBold',
      'Lexend_700Bold',
      'Lexend_800ExtraBold',
    ]);
  });

  it('forwards loading errors from expo-font', () => {
    const err = new Error('font network failure');
    mockUseFonts.mockReturnValue([false, err]);

    const { result } = renderHook(() => useAppFonts());
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(err);
  });

  it('logs a confirmation when every variant registers', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockIsLoaded.mockReturnValue(true);

    renderHook(() => useAppFonts());

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('All Lexend variants registered'),
      expect.any(Array)
    );
  });

  it('warns when a variant fails to register on the native side', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockIsLoaded.mockImplementation((name: string) => name !== 'Lexend_700Bold');

    renderHook(() => useAppFonts());

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('did not register'),
      expect.arrayContaining(['Lexend_700Bold'])
    );
  });
});
