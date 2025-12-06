/**
 * Calendar App
 * Custom Google Calendar-style app with Month and Day views
 *
 * @format
 */

import React, { useState, memo } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen, RegisterScreen } from './src/components/Auth';
import { ErrorBoundary } from './src/components/shared';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthProvider, useAuthContext } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const AppContent = memo(() => {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuthContext();
  const [showRegister, setShowRegister] = useState(false);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // Show auth screens if user is not authenticated
  if (!user) {
    return showRegister ? (
      <RegisterScreen onNavigateToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onNavigateToRegister={() => setShowRegister(true)} />
    );
  }

  // User is authenticated, show navigation
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
});

AppContent.displayName = 'AppContent';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default App;
