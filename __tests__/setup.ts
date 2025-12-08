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

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
