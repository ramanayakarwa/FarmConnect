import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import EquipmentManagementScreen from '../screens/provider/EquipmentManagementScreen';
import BookingRequestsScreen from '../screens/provider/BookingRequestsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ProviderTabNavigator() {
  const { t } = useTranslation();

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

        // Translated tab labels
        tabBarLabel: (() => {
          if (route.name === 'Dashboard') {
            return t('dashboard');
          }

          if (route.name === 'Equipment') {
            return t('equipment');
          }

          if (route.name === 'Booking Requests') {
            return t('requests');
          }

          if (route.name === 'Profile') {
            return t('profile');
          }

          return route.name;
        })(),

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused
              ? 'stats-chart'
              : 'stats-chart-outline';
          } else if (route.name === 'Equipment') {
            iconName = focused
              ? 'construct'
              : 'construct-outline';
          } else if (route.name === 'Booking Requests') {
            iconName = focused
              ? 'clipboard'
              : 'clipboard-outline';
          } else if (route.name === 'Profile') {
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
        name="Dashboard"
        component={ProviderDashboardScreen}
      />

      <Tab.Screen
        name="Equipment"
        component={EquipmentManagementScreen}
      />

      <Tab.Screen
        name="Booking Requests"
        component={BookingRequestsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}