/**
 * Mock for @react-native-firebase/auth
 * Prevents actual Firebase calls during testing
 */

const mockUserCredential = {
  user: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: null,
    photoURL: null,
    emailVerified: false,
  },
  additionalUserInfo: null,
};

let mockCurrentUser: any = null;
let mockAuthStateCallback: ((user: any) => void) | null = null;
let mockSignInError: Error | null = null;

const mockAuth = () => ({
  createUserWithEmailAndPassword: jest.fn((email: string, _password: string) => {
    mockCurrentUser = { ...mockUserCredential.user, email };
    if (mockAuthStateCallback) {
      mockAuthStateCallback(mockCurrentUser);
    }
    return Promise.resolve({ ...mockUserCredential, user: mockCurrentUser });
  }),
  
  signInWithEmailAndPassword: jest.fn((email: string, _password: string) => {
    if (mockSignInError) {
      return Promise.reject(mockSignInError);
    }
    mockCurrentUser = { ...mockUserCredential.user, email };
    if (mockAuthStateCallback) {
      mockAuthStateCallback(mockCurrentUser);
    }
    return Promise.resolve({ ...mockUserCredential, user: mockCurrentUser });
  }),
  
  signOut: jest.fn(() => {
    mockCurrentUser = null;
    if (mockAuthStateCallback) {
      mockAuthStateCallback(null);
    }
    return Promise.resolve();
  }),
  
  get currentUser() {
    return mockCurrentUser;
  },
  
  onAuthStateChanged: jest.fn((callback: (user: any) => void) => {
    mockAuthStateCallback = callback;
    // Immediately call with current state
    callback(mockCurrentUser);
    // Return unsubscribe function
    return jest.fn(() => {
      mockAuthStateCallback = null;
    });
  }),
});

// Helper functions for tests to control auth state
export const setMockCurrentUser = (user: any) => {
  mockCurrentUser = user;
};

export const clearMockCurrentUser = () => {
  mockCurrentUser = null;
};

/** Make the next sign-in attempts reject with `error` (pass null to reset). */
export const setMockSignInError = (error: Error | null) => {
  mockSignInError = error;
};

export const triggerAuthStateChange = (user: any) => {
  mockCurrentUser = user;
  if (mockAuthStateCallback) {
    mockAuthStateCallback(user);
  }
};

export default mockAuth;
