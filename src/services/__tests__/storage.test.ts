import { storage, zustandMMKVStorage } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.clearAllMocks();
  });

  it('exposes a configured MMKV instance', () => {
    storage.set('hello', 'world');
    expect(storage.getString('hello')).toBe('world');
    expect(storage.contains('hello')).toBe(true);
  });

  describe('zustandMMKVStorage adapter', () => {
    it('writes through to MMKV', () => {
      zustandMMKVStorage.setItem('alpha', 'beta');
      expect(storage.set).toHaveBeenCalledWith('alpha', 'beta');
      expect(storage.getString('alpha')).toBe('beta');
    });

    it('reads from MMKV and returns null for missing keys', () => {
      storage.set('present', 'yes');
      expect(zustandMMKVStorage.getItem('present')).toBe('yes');
      expect(zustandMMKVStorage.getItem('missing')).toBeNull();
    });

    it('removes the key from MMKV', () => {
      storage.set('to-delete', 'value');
      zustandMMKVStorage.removeItem('to-delete');
      expect(storage.delete).toHaveBeenCalledWith('to-delete');
      expect(storage.getString('to-delete')).toBeUndefined();
    });
  });
});
