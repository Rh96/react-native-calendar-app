import { AuthService } from '../../src/services/AuthService';

// Mock the Firebase auth module
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  };
  return jest.fn(() => mockAuth);
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthInstance: any;

  beforeEach(() => {
    const auth = require('@react-native-firebase/auth');
    mockAuthInstance = auth();
    authService = new AuthService();
    
    // Reset mocks
    mockAuthInstance.createUserWithEmailAndPassword.mockReset();
    mockAuthInstance.signInWithEmailAndPassword.mockReset();
    mockAuthInstance.signOut.mockReset();
    mockAuthInstance.onAuthStateChanged.mockReset();
    mockAuthInstance.currentUser = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should call createUserWithEmailAndPassword with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUserCredential = {
        user: { uid: 'test-uid', email },
      };

      mockAuthInstance.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const result = await authService.signUp(email, password);

      expect(mockAuthInstance.createUserWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUserCredential);
    });

    it('should throw error when createUserWithEmailAndPassword fails', async () => {
      const error = new Error('Email already in use');
      mockAuthInstance.createUserWithEmailAndPassword.mockRejectedValue(error);

      await expect(authService.signUp('test@example.com', 'password123')).rejects.toThrow('Email already in use');
    });
  });

  describe('signIn', () => {
    it('should call signInWithEmailAndPassword with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUserCredential = {
        user: { uid: 'test-uid', email },
      };

      mockAuthInstance.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const result = await authService.signIn(email, password);

      expect(mockAuthInstance.signInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUserCredential);
    });

    it('should throw error when signInWithEmailAndPassword fails', async () => {
      const error = new Error('Invalid credentials');
      mockAuthInstance.signInWithEmailAndPassword.mockRejectedValue(error);

      await expect(authService.signIn('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should call signOut on Firebase auth', async () => {
      mockAuthInstance.signOut.mockResolvedValue(undefined);

      await authService.signOut();

      expect(mockAuthInstance.signOut).toHaveBeenCalled();
    });

    it('should throw error when signOut fails', async () => {
      const error = new Error('Sign out failed');
      mockAuthInstance.signOut.mockRejectedValue(error);

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      mockAuthInstance.currentUser = mockUser;

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is signed in', () => {
      mockAuthInstance.currentUser = null;

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('should call onAuthStateChanged and return unsubscribe function', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockAuthInstance.onAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(mockAuthInstance.onAuthStateChanged).toHaveBeenCalledWith(mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should trigger callback when auth state changes', () => {
      const mockCallback = jest.fn();
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      
      mockAuthInstance.onAuthStateChanged.mockImplementation((callback: Function) => {
        callback(mockUser);
        return jest.fn();
      });

      authService.onAuthStateChanged(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockUser);
    });
  });
});
