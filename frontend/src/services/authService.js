import api from './api';

import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {

  // ==========================================================
  // REGISTER
  // ==========================================================

  register: async (userData) => {
    const response =
      await api.post(
        '/auth/register',
        userData
      );

    if (
      response?.token &&
      response?.user
    ) {
      await AsyncStorage.setItem(
        'token',
        response.token
      );

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(response.user)
      );
    }

    return response;
  },

  // ==========================================================
  // LOGIN
  // ==========================================================

  login: async (credentials) => {
    const response =
      await api.post(
        '/auth/login',
        credentials
      );

    if (
      response?.token &&
      response?.user
    ) {
      await AsyncStorage.setItem(
        'token',
        response.token
      );

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(response.user)
      );
    }

    return response;
  },

  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  updateProfile: async (
    updates
  ) => {
    const response =
      await api.put(
        '/auth/profile',
        {
          name: String(
            updates?.name || ''
          ).trim(),

          email: String(
            updates?.email || ''
          )
            .trim()
            .toLowerCase(),

          phone: String(
            updates?.phone || ''
          ).trim(),
        }
      );

    if (response?.user) {
      await AsyncStorage.setItem(
        'user',
        JSON.stringify(
          response.user
        )
      );
    }

    return response?.user;
  },

  // ==========================================================
  // LOGOUT
  // ==========================================================

  logout: async () => {
    await AsyncStorage.removeItem(
      'token'
    );

    await AsyncStorage.removeItem(
      'user'
    );
  },

  // ==========================================================
  // STORED USER
  // ==========================================================

  getStoredUser: async () => {
    const user =
      await AsyncStorage.getItem(
        'user'
      );

    return user
      ? JSON.parse(user)
      : null;
  },
};

export { authService };

export default authService;