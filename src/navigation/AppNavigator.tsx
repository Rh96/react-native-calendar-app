import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';
import { CalendarScreen } from '../components/Calendar';
import { ProfileScreen } from '../components/Profile';
import { Header } from '../components/shared/Header';

export type RootTabParamList = {
  Calendar: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        header: ({ route, navigation }) => {
          const showBackButton = route.name === 'Profile';
          return (
            <Header
              showBackButton={showBackButton}
              onBackPress={() => navigation.navigate('Calendar')}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          headerShown: false, // We'll handle header in CalendarScreen
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

