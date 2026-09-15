import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

import LanguageScreen from '../screens/auth/LanguageScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import EquipmentDetailScreen from '../screens/farmer/EquipmentDetailScreen';
import BookingScreen from '../screens/farmer/BookingScreen';
import BookingConfirmationScreen from '../screens/farmer/BookingConfirmationScreen';

import AddEquipmentScreen from '../screens/provider/AddEquipmentScreen';

import FarmerTabNavigator from './FarmerTabNavigator';
import ProviderTabNavigator from './ProviderTabNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoading, user, isAuthenticated } = useAuth();

  const [languageSelected, setLanguageSelected] = useState(false);

  // Reset language selection whenever AppNavigator starts
  useEffect(() => {
    setLanguageSelected(false);
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >

        {/* ALWAYS SHOW LANGUAGE FIRST */}
        {!languageSelected ? (

          <Stack.Screen name="Language">
            {(props) => (
              <LanguageScreen
                {...props}
                onLanguageSelected={() => {
                  setLanguageSelected(true);
                }}
              />
            )}
          </Stack.Screen>

        ) : !isAuthenticated ? (

          /* LOGIN / REGISTER */

          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>

        ) : user?.role === 'farmer' ? (

          /* FARMER */

          <>
            <Stack.Screen
              name="FarmerTabs"
              component={FarmerTabNavigator}
            />

            <Stack.Screen
              name="EquipmentDetail"
              component={EquipmentDetailScreen}
            />

            <Stack.Screen
              name="Booking"
              component={BookingScreen}
            />

            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
            />
          </>

        ) : (

          /* PROVIDER */

          <>
            <Stack.Screen
              name="ProviderTabs"
              component={ProviderTabNavigator}
            />

            <Stack.Screen
              name="AddEquipment"
              component={AddEquipmentScreen}
            />
          </>

        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}