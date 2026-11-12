/**
 * Jest config for Firestore security rules tests (npm run test:rules).
 * Runs in plain Node against the Firestore emulator, separate from the
 * React Native app tests in jest.config.js.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/rules-tests/**/*.test.ts'],
  // Each test talks to the emulator over HTTP
  testTimeout: 20000,
};
