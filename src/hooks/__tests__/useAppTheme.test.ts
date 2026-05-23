import { renderHook } from '@testing-library/react-native';
import { useAppTheme } from '../useAppTheme';
import { useAppStore } from '../../store';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, dawnTheme, duskTheme } from '../../theme';

jest.mock('../../store', () => ({
  useAppStore: jest.fn(),
}));

describe('useAppTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dark theme when preference is dark', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useAppTheme());

    expect(result.current).toBe(darkTheme);
  });

  it('should return light theme when preference is light', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() => useAppTheme());

    expect(result.current).toBe(lightTheme);
  });

  it('should return dawn theme when preference is system and hour is 10', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('system');

    const RealDate = Date;
    const mockDate = new RealDate('2026-05-08T10:00:00Z');
    mockDate.getHours = jest.fn().mockReturnValue(10);
    global.Date = jest.fn().mockImplementation(() => mockDate) as any;
    global.Date.now = RealDate.now;

    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe(dawnTheme);

    global.Date = RealDate;
  });

  it('should return light theme when preference is system and hour is 14', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('system');

    const RealDate = Date;
    const mockDate = new RealDate('2026-05-08T14:00:00Z');
    mockDate.getHours = jest.fn().mockReturnValue(14);
    global.Date = jest.fn().mockImplementation(() => mockDate) as any;
    global.Date.now = RealDate.now;

    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe(lightTheme);

    global.Date = RealDate;
  });

  it('should return dusk theme when preference is system and hour is 19', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('system');

    const RealDate = Date;
    const mockDate = new RealDate('2026-05-08T19:00:00Z');
    mockDate.getHours = jest.fn().mockReturnValue(19);
    global.Date = jest.fn().mockImplementation(() => mockDate) as any;
    global.Date.now = RealDate.now;

    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe(duskTheme);

    global.Date = RealDate;
  });

  it('should return dark theme when preference is system and hour is 22', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue('system');

    const RealDate = Date;
    const mockDate = new RealDate('2026-05-08T22:00:00Z');
    mockDate.getHours = jest.fn().mockReturnValue(22);
    global.Date = jest.fn().mockImplementation(() => mockDate) as any;
    global.Date.now = RealDate.now;

    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe(darkTheme);

    global.Date = RealDate;
  });
});
