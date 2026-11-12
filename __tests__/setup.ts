/**
 * Jest setup file
 * Configures the testing environment before all tests run
 */

// Note: @testing-library/react-native v12.4+ includes matchers by default
// No need to import extend-expect

// Mock console methods to reduce noise in test output
globalThis.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(),
    simplePrompt: jest.fn(),
  })),
}));

// Mock react-native-safe-area-context with the library's official Jest mock.
// It covers the full API (incl. SafeAreaInsetsContext, used by React Navigation),
// which a hand-written partial mock would have to keep in sync manually.
jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);
