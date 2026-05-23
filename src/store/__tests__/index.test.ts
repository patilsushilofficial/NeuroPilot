import {
  useAppStore,
  selectTasks,
  selectHabits,
  selectFocusSessions,
  selectActiveFocus,
  selectStats,
  selectSettings,
  selectProfile,
  selectPendingAchievements,
  selectPendingTasks,
  selectTodaysTasks,
  selectOverdueTasks,
  selectTodaysHabits,
} from '../index';
import { storage } from '../../services/storage';

describe('store/index', () => {
  it('exposes a fully-initialised store', () => {
    expect(useAppStore).toBeDefined();
    const state = useAppStore.getState();
    expect(state).toBeDefined();
    expect(state.tasks).toBeDefined();
    expect(state.habits).toBeDefined();
    expect(state.focusSessions).toBeDefined();
    expect(state.stats).toBeDefined();
    expect(state.settings).toBeDefined();
    expect(state.active).toBeDefined();
  });

  it('exposes typed selectors for slices', () => {
    const state = useAppStore.getState();
    expect(selectTasks(state)).toBe(state.tasks);
    expect(selectHabits(state)).toBe(state.habits);
    expect(selectFocusSessions(state)).toBe(state.focusSessions);
    expect(selectActiveFocus(state)).toBe(state.active);
    expect(selectStats(state)).toBe(state.stats);
    expect(selectSettings(state)).toBe(state.settings);
    expect(selectProfile(state)).toBe(state.profile);
    expect(selectPendingAchievements(state)).toBe(state.pendingAchievements);
  });

  it('exposes derived selectors that delegate to slice queries', () => {
    const state = useAppStore.getState();
    expect(Array.isArray(selectPendingTasks(state))).toBe(true);
    expect(Array.isArray(selectTodaysTasks(state))).toBe(true);
    expect(Array.isArray(selectOverdueTasks(state))).toBe(true);
    expect(Array.isArray(selectTodaysHabits(state))).toBe(true);
  });

  it('persists the expected slice of state via partialize', async () => {
    (storage.set as jest.Mock).mockClear();

    useAppStore.setState({ lastActiveDate: '2030-01-01' });

    await new Promise((r) => setTimeout(r, 0));

    expect(storage.set).toHaveBeenCalled();
    const writes = (storage.set as jest.Mock).mock.calls.filter((c) => c[0] === 'neuropilot-store');
    expect(writes.length).toBeGreaterThan(0);
    const persisted = JSON.parse(writes.at(-1)![1]);
    expect(persisted.state).toEqual(
      expect.objectContaining({
        tasks: expect.any(Array),
        habits: expect.any(Array),
        focusSessions: expect.any(Array),
        stats: expect.any(Object),
        settings: expect.any(Object),
        lastActiveDate: '2030-01-01',
      })
    );
    expect(persisted.state.active).toBeUndefined();
    expect(persisted.state.pendingAchievements).toBeUndefined();
  });

  describe('resetAllData', () => {
    it('clears tasks, habits, focus sessions and stats while preserving settings/profile', async () => {
      const customSettings = {
        ...useAppStore.getState().settings,
        hapticsEnabled: false,
      };
      const customProfile = {
        id: 'user-1',
        name: 'Persisted User',
        avatar: '🦊',
        joinedAt: new Date('2025-01-01').toISOString(),
      } as any;

      useAppStore.setState({
        tasks: [{ id: 't1' } as any],
        habits: [{ id: 'h1' } as any],
        focusSessions: [{ id: 's1' } as any],
        stats: {
          ...useAppStore.getState().stats,
          totalXP: 9999,
          tasksCompleted: 42,
        },
        pendingAchievements: ['ach-1'] as any,
        lastActiveDate: '2030-01-01',
        settings: customSettings,
        profile: customProfile,
      });

      await useAppStore.getState().resetAllData();

      const next = useAppStore.getState();
      expect(next.tasks).toEqual([]);
      expect(next.habits).toEqual([]);
      expect(next.focusSessions).toEqual([]);
      expect(next.pendingAchievements).toEqual([]);
      expect(next.stats.totalXP).toBe(0);
      expect(next.stats.tasksCompleted).toBe(0);
      expect(next.lastActiveDate).toBeNull();
      expect(next.active.status).toBe('idle');

      expect(next.settings).toBe(customSettings);
      expect(next.profile).toBe(customProfile);
    });

    it('clears persisted MMKV so reloads do not rehydrate stale data', async () => {
      (storage.delete as jest.Mock).mockClear();

      await useAppStore.getState().resetAllData();

      expect(storage.delete).toHaveBeenCalledWith('neuropilot-store');
    });

    it('still resets in-memory state when persisted storage cleanup fails', async () => {
      (storage.delete as jest.Mock).mockImplementationOnce(() => {
        throw new Error('disk full');
      });

      useAppStore.setState({ tasks: [{ id: 'persisted' } as any] });

      await expect(useAppStore.getState().resetAllData()).resolves.toBeUndefined();
      expect(useAppStore.getState().tasks).toEqual([]);
    });
  });
});
