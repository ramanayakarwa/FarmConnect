import React from 'react';

import './src/i18n';

import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </AuthProvider>
  );
}