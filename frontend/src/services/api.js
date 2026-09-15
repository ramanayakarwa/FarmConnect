import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.106:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================
// REQUEST INTERCEPTOR
// =============================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (err) {
      console.log('API Request Error:', err.message);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// =============================
// RESPONSE INTERCEPTOR
// =============================
api.interceptors.response.use(
  (response) => {
    return response.data;
  },

  async (error) => {
    console.log('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;