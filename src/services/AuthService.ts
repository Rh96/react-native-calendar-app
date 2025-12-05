import auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Authentication Service
 * Handles all Firebase Authentication operations
 */
export class AuthService {
  /**
   * Register a new user with email and password
   */
  async signUp(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    return auth().createUserWithEmailAndPassword(email, password);
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
    return auth().signInWithEmailAndPassword(email, password);
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    return auth().signOut();
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Subscribe to authentication state changes
   * Returns an unsubscribe function
   */
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ): () => void {
    return auth().onAuthStateChanged(callback);
  }
}

