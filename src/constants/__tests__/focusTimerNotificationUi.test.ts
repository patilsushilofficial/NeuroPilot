import { computeFilledSegments } from '../focusTimerNotificationUi';

describe('computeFilledSegments', () => {
  const total = 1500; // 25 minutes

  it('starts with no filled segments', () => {
    expect(computeFilledSegments(total, total)).toBe(0);
  });

  it('fills the first segment after 25% elapsed', () => {
    expect(computeFilledSegments(total, 1125)).toBe(1);
  });

  it('fills two segments at 50% elapsed', () => {
    expect(computeFilledSegments(total, 750)).toBe(2);
  });

  it('fills three segments at 75% elapsed', () => {
    expect(computeFilledSegments(total, 375)).toBe(3);
  });

  it('fills all four segments when complete', () => {
    expect(computeFilledSegments(total, 0)).toBe(4);
  });

  it('does not overfill when remaining exceeds total', () => {
    expect(computeFilledSegments(total, total + 100)).toBe(0);
  });

  it('handles short sessions', () => {
    expect(computeFilledSegments(60, 45)).toBe(1);
    expect(computeFilledSegments(60, 30)).toBe(2);
  });
});

describe('buildFocusTimerNotificationDisplayModel', () => {
  it('uses paused status copy when the session is paused', () => {
    const { buildFocusTimerNotificationDisplayModel } = require('../focusTimerNotificationUi');
    const { darkTheme } = require('../../theme');

    const model = buildFocusTimerNotificationDisplayModel(
      {
        sessionId: 'focus_1',
        phase: 'focus',
        status: 'paused',
        secondsRemaining: 600,
        totalSeconds: 1500,
        completedPomodoros: 0,
        currentTaskId: null,
        presetId: 'classic',
        runningEndsAt: null,
      },
      darkTheme
    );

    expect(model.isRunning).toBe(false);
    expect(model.statusLabel).toContain('Paused');
    expect(model.primaryActionLabel).toBe('Resume');
  });
});
