jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue(undefined),
    displayNotification: jest.fn().mockResolvedValue(undefined),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    onForegroundEvent: jest.fn(() => jest.fn()),
    onBackgroundEvent: jest.fn(() => jest.fn()),
  },
  AndroidImportance: { DEFAULT: 3, LOW: 2 },
  EventType: { ACTION_PRESS: 1 },
}));

jest.mock('react-native-background-timer', () => ({
  __esModule: true,
  default: {
    runBackgroundTimer: jest.fn(),
    stopBackgroundTimer: jest.fn(),
  },
}));

jest.mock('react-native-mmkv', () => {
  // Each MMKV instance gets its own in-memory backing map so tests are isolated.
  class MMKV {
    constructor() {
      this._store = new Map();
    }

    set = jest.fn((key, value) => {
      this._store.set(key, String(value));
    });

    getString = jest.fn((key) => {
      const v = this._store.get(key);
      return v === undefined ? undefined : String(v);
    });

    getNumber = jest.fn((key) => {
      const v = this._store.get(key);
      return v === undefined ? undefined : Number(v);
    });

    getBoolean = jest.fn((key) => {
      const v = this._store.get(key);
      return v === undefined ? undefined : v === 'true' || v === true;
    });

    contains = jest.fn((key) => this._store.has(key));

    delete = jest.fn((key) => {
      this._store.delete(key);
    });

    getAllKeys = jest.fn(() => Array.from(this._store.keys()));

    clearAll = jest.fn(() => {
      this._store.clear();
    });

    addOnValueChangedListener = jest.fn(() => ({ remove: jest.fn() }));
  }

  return { MMKV };
});

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  actual.default.call = () => {};
  return actual;
});

// Lexend Google Font assets — return string sentinels for the .ttf requires
// so jest never tries to actually load binary font files. `useFonts` resolves
// synchronously to "loaded" so component trees can render in tests.
jest.mock('@expo-google-fonts/lexend', () => ({
  useFonts: () => [true, null],
  Lexend_100Thin: 'Lexend_100Thin',
  Lexend_200ExtraLight: 'Lexend_200ExtraLight',
  Lexend_300Light: 'Lexend_300Light',
  Lexend_400Regular: 'Lexend_400Regular',
  Lexend_500Medium: 'Lexend_500Medium',
  Lexend_600SemiBold: 'Lexend_600SemiBold',
  Lexend_700Bold: 'Lexend_700Bold',
  Lexend_800ExtraBold: 'Lexend_800ExtraBold',
  Lexend_900Black: 'Lexend_900Black',
}));
