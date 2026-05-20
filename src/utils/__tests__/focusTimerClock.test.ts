import { computeRunningEndsAt, getEffectiveSecondsRemaining } from '../focusTimerClock';

describe('focusTimerClock', () => {
  const baseActive = {
    sessionId: 'focus_1',
    phase: 'focus' as const,
    status: 'running' as const,
    secondsRemaining: 100,
    totalSeconds: 1500,
    completedPomodoros: 0,
    currentTaskId: null,
    presetId: 'classic',
    runningEndsAt: null as number | null,
  };

  it('computes runningEndsAt from remaining seconds', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    expect(computeRunningEndsAt(90)).toBe(Date.now() + 90_000);
    jest.useRealTimers();
  });

  it('derives remaining seconds from runningEndsAt while running', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    const endsAt = Date.now() + 45_000;

    expect(
      getEffectiveSecondsRemaining({
        ...baseActive,
        secondsRemaining: 999,
        runningEndsAt: endsAt,
      })
    ).toBe(45);

    jest.useRealTimers();
  });

  it('uses secondsRemaining when paused', () => {
    expect(
      getEffectiveSecondsRemaining({
        ...baseActive,
        status: 'paused',
        secondsRemaining: 12,
        runningEndsAt: null,
      })
    ).toBe(12);
  });
});
