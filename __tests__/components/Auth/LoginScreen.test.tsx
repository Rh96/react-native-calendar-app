import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../../src/components/Auth/LoginScreen';

// Mock hooks
jest.mock('../../../src/hooks/useAuth');
jest.mock('../../../src/theme');
jest.mock('react-native-safe-area-context');

import { useAuth } from '../../../src/hooks/useAuth';
import { useTheme } from '../../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();
  const mockClearError = jest.fn();
  const mockOnNavigateToRegister = jest.fn();

  const mockTheme = {
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      textTertiary: '#999999',
      surface: '#F5F5F5',
      border: '#E0E0E0',
      primary: '#007AFF',
      primaryText: '#FFFFFF',
      error: '#FF3B30',
    },
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
      clearError: mockClearError,
    });

    (useTheme as jest.Mock).mockReturnValue(mockTheme);
    
    (useSafeAreaInsets as jest.Mock).mockReturnValue({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements correctly', () => {
      const { getByText, getByPlaceholderText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      expect(getByText('Welcome To Calendar App')).toBeTruthy();
      expect(getByText('Sign in to access your calendar')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByText("Don't have an account?")).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
    });
  });

  describe('User Input', () => {
    it('should update email input when user types', () => {
      const { getByPlaceholderText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input when user types', () => {
      const { getByPlaceholderText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });
  });

  describe('Validation', () => {
    it('should show error when trying to login with empty fields', async () => {
      const { getByText, findByText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      const errorMessage = await findByText('Please enter both email and password');
      expect(errorMessage).toBeTruthy();
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    it('should call signIn with trimmed email and password', async () => {
      mockSignIn.mockResolvedValue(undefined);

      const { getByPlaceholderText, getByText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      
      fireEvent.changeText(emailInput, '  test@example.com  ');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error from useAuth hook', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        loading: false,
        error: { message: 'Invalid credentials' },
        clearError: mockClearError,
      });

      const { getByText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should disable inputs and button when loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        loading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByPlaceholderText, queryByText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');

      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
      // When loading, button shows ActivityIndicator instead of text
      expect(queryByText('Sign In')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateToRegister when Sign Up link is pressed', () => {
      const { getByText } = render(
        <LoginScreen onNavigateToRegister={mockOnNavigateToRegister} />
      );

      const signUpLink = getByText('Sign Up');
      fireEvent.press(signUpLink);

      expect(mockOnNavigateToRegister).toHaveBeenCalled();
    });
  });
});
