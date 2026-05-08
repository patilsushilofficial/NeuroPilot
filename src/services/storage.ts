import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * Single MMKV instance backing all on-device key/value persistence.
 *
 * MMKV is a synchronous, JSI-backed storage layer (~30x faster than AsyncStorage)
 * shared across the app: the Zustand persist middleware, the offline sync queue,
 * and any future direct key/value usage.
 */
export const storage = new MMKV({ id: 'neuropilot-storage' });

/**
 * Zustand-compatible storage adapter backed by MMKV.
 *
 * `persist` accepts both sync and async values from these methods, so we return
 * the synchronous MMKV result directly — keeping rehydration on the same tick.
 */
export const zustandMMKVStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};
