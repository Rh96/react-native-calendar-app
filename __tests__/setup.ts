/**
 * Jest setup file
 * Configures the testing environment before all tests run
 */

// Note: @testing-library/react-native v12.4+ includes matchers by default
// No need to import extend-expect

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
