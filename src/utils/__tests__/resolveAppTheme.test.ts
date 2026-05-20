import { resolveAppTheme } from '../resolveAppTheme';
import { darkTheme, dawnTheme, duskTheme, lightTheme } from '../../theme';

describe('resolveAppTheme', () => {
  it('returns fixed themes for explicit preferences', () => {
    expect(resolveAppTheme('dark')).toBe(darkTheme);
    expect(resolveAppTheme('light')).toBe(lightTheme);
  });

  it('maps system preference to a time-of-day theme', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T08:00:00'));
    expect(resolveAppTheme('system')).toBe(dawnTheme);

    jest.setSystemTime(new Date('2026-05-20T14:00:00'));
    expect(resolveAppTheme('system')).toBe(lightTheme);

    jest.setSystemTime(new Date('2026-05-20T19:00:00'));
    expect(resolveAppTheme('system')).toBe(duskTheme);

    jest.setSystemTime(new Date('2026-05-20T23:00:00'));
    expect(resolveAppTheme('system')).toBe(darkTheme);

    jest.useRealTimers();
  });
});
