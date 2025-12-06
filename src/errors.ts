/**
 * Custom Error Classes
 * Provides typed error classes for different error scenarios
 */

/**
 * Storage Error
 * Thrown when secure storage operations fail
 */
export class StorageError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'StorageError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }
  }

  /**
   * Create a StorageError for save failures
   */
  static saveFailed(error: unknown): StorageError {
    const message = error instanceof Error ? error.message : 'Failed to save to secure storage';
    return new StorageError(`Storage save failed: ${message}`, error);
  }

  /**
   * Create a StorageError for retrieval failures
   */
  static retrieveFailed(error: unknown): StorageError {
    const message = error instanceof Error ? error.message : 'Failed to retrieve from secure storage';
    return new StorageError(`Storage retrieval failed: ${message}`, error);
  }
}

/**
 * Biometric Error
 * Thrown when biometric operations fail
 */
export class BiometricError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'BiometricError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BiometricError);
    }
  }
}

