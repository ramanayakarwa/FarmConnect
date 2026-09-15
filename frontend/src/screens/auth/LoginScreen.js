import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginScreen({ navigation }) {
  const { login, logout } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState('farmer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async () => {
    const cleanEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (!cleanEmail || !password) {
      setError(t('emailPasswordRequired'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(
        cleanEmail,
        password
      );

      console.log(
        'LOGIN USER:',
        loggedInUser
      );

      console.log(
        'LOGIN ROLE:',
        loggedInUser?.role
      );

      // Check selected role against actual account role
      if (loggedInUser?.role !== role) {
        const actualRole =
          loggedInUser?.role || 'unknown';

        Alert.alert(
          t('wrongLoginType'),
          t('wrongLoginMessage', {
            role: actualRole,
          })
        );

        await logout();

        return;
      }

      Alert.alert(
        t('loginSuccessful'),
        t('welcomeUser', {
          name: loggedInUser?.name || '',
        })
      );

      // DO NOT NAVIGATE HERE.
      // AppNavigator automatically handles:
      // farmer   → FarmerTabs
      // provider → ProviderTabs

    } catch (e) {
      console.log(
        'LOGIN SCREEN ERROR:',
        e
      );

      const message =
        e?.response?.data?.message ||
        e?.message ||
        t('invalidCredentials');

      setError(message);

      Alert.alert(
        t('loginFailed'),
        message
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView style={styles.safe}>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboard}
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <Text style={styles.logo}>
              🚜
            </Text>

            <Text style={styles.appName}>
              FarmConnect
            </Text>

            <Text style={styles.tagline}>
              {t('tagline')}
            </Text>

          </View>

          {/* LOGIN CARD */}

          <View style={styles.card}>

            <Text style={styles.title}>
              {t('welcomeBack')}
            </Text>

            <Text style={styles.subtitle}>
              {t('loginSubtitle')}
            </Text>

            {/* ROLE */}

            <Text style={styles.sectionLabel}>
              {t('loginAs')}
            </Text>

            <View style={styles.roleToggle}>

              {/* FARMER */}

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'farmer' &&
                    styles.roleButtonActive,
                ]}
                onPress={() => {
                  setRole('farmer');
                  setError('');
                }}
                disabled={loading}
              >

                <Ionicons
                  name="leaf"
                  size={19}
                  color={
                    role === 'farmer'
                      ? '#FFFFFF'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'farmer' &&
                      styles.roleButtonTextActive,
                  ]}
                >
                  {t('farmer')}
                </Text>

              </TouchableOpacity>

              {/* PROVIDER */}

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'provider' &&
                    styles.roleButtonActive,
                ]}
                onPress={() => {
                  setRole('provider');
                  setError('');
                }}
                disabled={loading}
              >

                <Ionicons
                  name="construct"
                  size={19}
                  color={
                    role === 'provider'
                      ? '#FFFFFF'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'provider' &&
                      styles.roleButtonTextActive,
                  ]}
                >
                  {t('provider')}
                </Text>

              </TouchableOpacity>

            </View>

            {/* EMAIL */}

            <Text style={styles.label}>
              {t('email')}
            </Text>

            <View style={styles.inputContainer}>

              <Ionicons
                name="mail-outline"
                size={20}
                color="#777"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

            </View>

            {/* PASSWORD */}

            <Text style={styles.label}>
              {t('password')}
            </Text>

            <View style={styles.inputContainer}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#777"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder={t('passwordPlaceholder')}
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                disabled={loading}
              >

                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={22}
                  color="#777"
                />

              </TouchableOpacity>

            </View>

            {/* ERROR */}

            {error ? (
              <View style={styles.errorBox}>

                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#D32F2F"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>

              </View>
            ) : null}

            {/* LOGIN BUTTON */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>
                    {t('login')}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}

            </TouchableOpacity>

            {/* REGISTER */}

            <View style={styles.registerRow}>

              <Text style={styles.registerText}>
                {t('dontHaveAccount')}
              </Text>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
              >

                <Text style={styles.registerLink}>
                  {t('register')}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            {t('footer')}
          </Text>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    fontSize: 55,
    marginBottom: 5,
  },

  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2E7D32',
  },

  tagline: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,
    shadowRadius: 8,

    elevation: 4,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 25,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },

  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 22,
  },

  roleButton: {
    flex: 1,
    height: 46,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  roleButtonActive: {
    backgroundColor: '#2E7D32',
  },

  roleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },

  roleButtonTextActive: {
    color: '#FFFFFF',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 7,
  },

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 17,
    backgroundColor: '#FAFAFA',
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#222',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 9,
    padding: 11,
    marginBottom: 15,
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 13,
    lineHeight: 18,
  },

  loginButton: {
    height: 52,
    backgroundColor: '#2E7D32',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 3,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    gap: 5,
  },

  registerText: {
    color: '#777',
    fontSize: 14,
  },

  registerLink: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 25,
  },

});