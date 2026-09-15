import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  Ionicons,
} from '@expo/vector-icons';

import HomeScreen from '../screens/farmer/HomeScreen';

import BookingStatusScreen from '../screens/farmer/BookingStatusScreen';

import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function FarmerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#2E7D32',

        tabBarInactiveTintColor: '#8D6E63',

        tabBarStyle: {
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused
              ? 'home'
              : 'home-outline';
          } else if (
            route.name === 'My Bookings'
          ) {
            iconName = focused
              ? 'calendar'
              : 'calendar-outline';
          } else if (
            route.name === 'Profile'
          ) {
            iconName = focused
              ? 'person'
              : 'person-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="My Bookings"
        component={BookingStatusScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}