import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// `/static` embeds the icon font at build time (no runtime font loading).
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useTheme } from '../theme';
import { CalendarScreen } from '../components/Calendar';
import { ProfileScreen } from '../components/Profile';
import { Header } from '../components/shared/Header';

export type RootTabParamList = {
  Calendar: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

// Defined outside the component so React sees the same component type on
// every render (no remounting of headers/icons).
const renderHeader = () => <Header />;

const renderCalendarIcon = ({ focused, color, size }: TabIconProps) => (
  <MaterialDesignIcons
    name={focused ? 'calendar-month' : 'calendar-month-outline'}
    color={color}
    size={size}
  />
);

const renderProfileIcon = ({ focused, color, size }: TabIconProps) => (
  <MaterialDesignIcons
    name={focused ? 'account-circle' : 'account-circle-outline'}
    color={color}
    size={size}
  />
);

export const AppNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        header: renderHeader,
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
          tabBarIcon: renderCalendarIcon,
          headerShown: false, // CalendarScreen renders its own header
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};
