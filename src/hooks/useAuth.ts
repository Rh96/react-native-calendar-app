import { useAuthContext } from '../contexts/AuthContext';

/**
 * Hook to access authentication context
 * Provides user, loading state, and auth methods
 */
export const useAuth = () => {
  return useAuthContext();
};

