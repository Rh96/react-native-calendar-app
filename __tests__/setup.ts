/**
 * Jest setup file
 * Configures the testing environment before all tests run
 */

// Note: @testing-library/react-native v12.4+ includes matchers by default
// No need to import extend-expect

import { configure } from '@testing-library/react-native';

// findBy*/waitFor give up after 1s by default. With a cold Jest cache (always
// the case in CI), the first full-App render in a file compiles React
// Navigation on the fly and can take longer, so the first test in a file failed
// only in a clean checkout. 5s is still fast to fail on a real bug.
configure({ asyncUtilTimeout: 5000 });

// Fail any test that logs an error or warning (e.g. React act() warnings),
// so problems can't hide in test output. A test that *expects* a log should
// spy on console itself: jest.spyOn(console, 'error').mockImplementation(() => {}).
const originalConsole = { error: console.error, warn: console.warn };
let unexpectedConsoleCalls: string[] = [];

beforeEach(() => {
  unexpectedConsoleCalls = [];
  (['error', 'warn'] as const).forEach((method) => {
    console[method] = (...args: unknown[]) => {
      unexpectedConsoleCalls.push(`console.${method}: ${args.map(String).join(' ')}`);
      originalConsole[method](...args);
    };
  });
});

afterEach(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  if (unexpectedConsoleCalls.length > 0) {
    throw new Error(`Unexpected console output:\n${unexpectedConsoleCalls.join('\n')}`);
  }
});


// Mock react-native-keychain. Defaults: nothing stored, writes succeed.
jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly' },
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-biometrics with ONE shared instance (the app creates it at
// module load), reachable in tests via jest.requireMock(...).mockInstance.
// Defaults: no sensor, prompt cancelled.
jest.mock('react-native-biometrics', () => {
  const mockInstance = {
    isSensorAvailable: jest.fn(() => Promise.resolve({ available: false })),
    simplePrompt: jest.fn(() => Promise.resolve({ success: false })),
  };
  return {
    __esModule: true,
    default: jest.fn(() => mockInstance),
    mockInstance,
  };
});

// Mock react-native-safe-area-context with the library's official Jest mock.
// It covers the full API (incl. SafeAreaInsetsContext, used by React Navigation),
// which a hand-written partial mock would have to keep in sync manually.
jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);
