import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../../../src/components/Auth/RegisterScreen';

// Mock hooks
jest.mock('../../../src/hooks/useAuth');
jest.mock('../../../src/theme');
jest.mock('react-native-safe-area-context');

import { useAuth } from '../../../src/hooks/useAuth';
import { useTheme } from '../../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

describe('RegisterScreen', () => {
  const mockSignUp = jest.fn();
  const mockClearError = jest.fn();
  const mockOnNavigateToLogin = jest.fn();

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
      signUp: mockSignUp,
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
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      expect(getByText('Create Account')).toBeTruthy();
      expect(getByText('Sign up to start managing your calendar')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
      expect(getByText('Already have an account?')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  describe('User Input', () => {
    it('should update email input when user types', () => {
      const { getByPlaceholderText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });
  });

  describe('Validation - Empty Fields', () => {
    it('should show error when all fields are empty', async () => {
      const { getByText, findByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);

      const errorMessage = await findByText('Please fill in all fields');
      expect(errorMessage).toBeTruthy();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Validation - Password Mismatch', () => {
    it('should show error when passwords do not match', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password456');

      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);

      const errorMessage = await findByText('Passwords do not match');
      expect(errorMessage).toBeTruthy();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Validation - Password Length', () => {
    it('should show error when password is less than 6 characters', async () => {
      const { getByPlaceholderText, getByText, findByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '12345');
      fireEvent.changeText(confirmPasswordInput, '12345');

      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);

      const errorMessage = await findByText('Password must be at least 6 characters');
      expect(errorMessage).toBeTruthy();
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('Successful Registration', () => {
    it('should call signUp with trimmed email and password when all validations pass', async () => {
      mockSignUp.mockResolvedValue(undefined);

      const { getByPlaceholderText, getByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');
      
      fireEvent.changeText(emailInput, '  test@example.com  ');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error from useAuth hook', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signUp: mockSignUp,
        loading: false,
        error: { message: 'Email already in use' },
        clearError: mockClearError,
      });

      const { getByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      expect(getByText('Email already in use')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should disable inputs and button when loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        signUp: mockSignUp,
        loading: true,
        error: null,
        clearError: mockClearError,
      });

      const { getByPlaceholderText, queryByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const confirmPasswordInput = getByPlaceholderText('Confirm your password');

      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
      expect(confirmPasswordInput.props.editable).toBe(false);
      // When loading, button shows ActivityIndicator instead of text
      expect(queryByText('Sign Up')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateToLogin when Sign In link is pressed', () => {
      const { getByText } = render(
        <RegisterScreen onNavigateToLogin={mockOnNavigateToLogin} />
      );

      const signInLink = getByText('Sign In');
      fireEvent.press(signInLink);

      expect(mockOnNavigateToLogin).toHaveBeenCalled();
    });
  });
});
