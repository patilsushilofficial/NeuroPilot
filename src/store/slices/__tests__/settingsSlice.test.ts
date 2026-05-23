import { createSettingsSlice } from '../settingsSlice';

describe('settingsSlice', () => {
  let set: jest.Mock;
  let get: jest.Mock;
  let slice: any;

  beforeEach(() => {
    jest.clearAllMocks();

    const state = {
      settings: {
        theme: 'dark',
        soundProfile: 'minimal',
        hapticsEnabled: true,
        notificationsEnabled: true,
        smartScheduling: true,
        mode: 'standard',
      },
      profile: null,
      lastActiveDate: null,
    };

    set = jest.fn((fn) => {
      const updates = typeof fn === 'function' ? fn(state) : fn;
      Object.assign(state, updates);
    });

    get = jest.fn(() => state);

    slice = createSettingsSlice(set, get, {} as any);
  });

  it('should update settings', () => {
    slice.updateSettings({ theme: 'light' });
    expect(set).toHaveBeenCalled();
    expect(get().settings.theme).toBe('light');
  });

  it('should set profile', () => {
    const profile = { name: 'Test User', avatar: 'avatar_url', bio: 'Bio' };
    slice.setProfile(profile);
    expect(set).toHaveBeenCalledWith({ profile });
  });

  it('should update profile', () => {
    const profile = { name: 'Test User', avatar: 'avatar_url', bio: 'Bio' };
    get().profile = profile;

    slice.updateProfile({ name: 'Updated Name' });
    expect(set).toHaveBeenCalled();
    expect(get().profile.name).toBe('Updated Name');
  });

  it('should toggle theme', () => {
    slice.toggleTheme();
    expect(set).toHaveBeenCalled();
    expect(get().settings.theme).toBe('light');

    slice.toggleTheme();
    expect(get().settings.theme).toBe('dark');
  });

  it('should toggle haptics', () => {
    slice.toggleHaptics();
    expect(set).toHaveBeenCalled();
    expect(get().settings.hapticsEnabled).toBe(false);
  });

  it('should set last active date', () => {
    slice.setLastActiveDate('2026-05-08');
    expect(set).toHaveBeenCalledWith({ lastActiveDate: '2026-05-08' });
  });
});
