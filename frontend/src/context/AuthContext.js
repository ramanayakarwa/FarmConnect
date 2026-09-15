import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  authService,
} from '../services/authService';

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // ==========================================================
  // CHECK STORED LOGIN
  // ==========================================================

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedUser =
        await authService.getStoredUser();

      if (storedUser) {
        console.log(
          'AUTH CONTEXT: STORED USER =',
          storedUser
        );

        setUser(storedUser);
      }
    } catch (error) {
      console.log(
        'AUTH CHECK ERROR:',
        error?.message || error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    email,
    password
  ) => {
    setIsLoading(true);

    try {
      const cleanEmail =
        String(email || '')
          .trim()
          .toLowerCase();

      const response =
        await authService.login({
          email: cleanEmail,
          password,
        });

      if (!response?.user) {
        throw new Error(
          'Login failed: user information was not received.'
        );
      }

      console.log(
        'AUTH CONTEXT: LOGIN USER =',
        response.user
      );

      setUser(response.user);

      return response.user;
    } catch (error) {
      console.log(
        'AUTH CONTEXT: LOGIN ERROR =',
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (
    userData
  ) => {
    setIsLoading(true);

    try {
      const response =
        await authService.register(
          userData
        );

      if (!response?.user) {
        throw new Error(
          'Registration failed: user information was not received.'
        );
      }

      console.log(
        'AUTH CONTEXT: REGISTER USER =',
        response.user
      );

      setUser(response.user);

      return response.user;
    } catch (error) {
      console.log(
        'AUTH CONTEXT: REGISTER ERROR =',
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = async (
    updates
  ) => {
    try {
      const updatedUser =
        await authService.updateProfile(
          updates
        );

      if (!updatedUser) {
        throw new Error(
          'Profile update failed.'
        );
      }

      console.log(
        'AUTH CONTEXT: UPDATED USER =',
        updatedUser
      );

      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      console.log(
        'AUTH CONTEXT: PROFILE UPDATE ERROR =',
        error?.response?.data ||
          error?.message ||
          error
      );

      throw error;
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {
    console.log(
      'LOGOUT START'
    );

    try {
      await authService.logout();
    } catch (error) {
      console.log(
        'AUTH CONTEXT: LOGOUT ERROR =',
        error?.response?.data ||
          error?.message ||
          error
      );
    } finally {
      setUser(null);

      console.log(
        'LOGOUT COMPLETE'
      );
    }
  };

  // ==========================================================
  // CONTEXT
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,

        isLoading,

        login,

        register,

        updateUser,

        logout,

        isAuthenticated:
          !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
};

export default AuthContext;