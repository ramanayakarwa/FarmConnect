import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState('farmer');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(t('allFieldsRequired'));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('validEmail'));
      return false;
    }

    if (phone.length < 10) {
      setError(t('validPhone'));
      return false;
    }

    if (password.length < 6) {
      setError(t('passwordLength'));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return false;
    }

    return true;
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = async () => {
    if (!validate()) return;

    setError('');
    setLoading(true);

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      Alert.alert(
        t('registrationSuccess'),
        t('registeredAs', {
          role:
            user?.role === 'provider'
              ? t('provider')
              : t('farmer'),
        })
      );

      /*
       * DO NOT manually navigate here.
       *
       * AuthContext updates the user.
       * AppNavigator automatically switches:
       *
       * farmer   → FarmerTabs
       * provider → ProviderTabs
       */

    } catch (e) {
      console.log(
        'REGISTER SCREEN ERROR:',
        e
      );

      const message =
        e?.response?.data?.message ||
        e?.message ||
        t('registrationFailed');

      setError(message);

      Alert.alert(
        t('registrationError'),
        message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}

          <View style={styles.headerRow}>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              disabled={loading}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#2E7D32"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {t('createAccount')}
            </Text>

            <View style={{ width: 40 }} />

          </View>

          {/* LOGO */}

          <View style={styles.logoRow}>

            <Text style={styles.logo}>
              🌱
            </Text>

            <Text style={styles.subtitle}>
              {t('joinFarmConnect')}
            </Text>

          </View>

          {/* CARD */}

          <View style={styles.card}>

            {/* ROLE */}

            <Text style={styles.sectionLabel}>
              {t('registerAs')}
            </Text>

            <View style={styles.roleToggle}>

              {/* FARMER */}

              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'farmer' &&
                    styles.roleBtnActive,
                ]}
                onPress={() => {
                  setRole('farmer');
                  setError('');
                }}
                disabled={loading}
              >

                <Ionicons
                  name="leaf"
                  size={16}
                  color={
                    role === 'farmer'
                      ? '#fff'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'farmer' &&
                      styles.roleBtnTextActive,
                  ]}
                >
                  {t('farmer')}
                </Text>

              </TouchableOpacity>

              {/* PROVIDER */}

              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  role === 'provider' &&
                    styles.roleBtnActive,
                ]}
                onPress={() => {
                  setRole('provider');
                  setError('');
                }}
                disabled={loading}
              >

                <Ionicons
                  name="construct"
                  size={16}
                  color={
                    role === 'provider'
                      ? '#fff'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'provider' &&
                      styles.roleBtnTextActive,
                  ]}
                >
                  {t('provider')}
                </Text>

              </TouchableOpacity>

            </View>

            {/* ERROR */}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  ⚠ {error}
                </Text>
              </View>
            ) : null}

            {/* FULL NAME */}

            <View style={styles.inputGroup}>

              <Ionicons
                name="person-outline"
                size={20}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder={t('fullName')}
                placeholderTextColor="#999"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError('');
                }}
                editable={!loading}
              />

            </View>

            {/* EMAIL */}

            <View style={styles.inputGroup}>

              <Ionicons
                name="mail-outline"
                size={20}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder={t('email')}
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

            {/* PHONE */}

            <View style={styles.inputGroup}>

              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder={t('phoneNumber')}
                placeholderTextColor="#999"
                value={phone}
                onChangeText={(text) => {
                  setPhone(
                    text.replace(/\D/g, '')
                  );
                  setError('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />

            </View>

            {/* PASSWORD */}

            <View style={styles.inputGroup}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('password')}
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                style={{ paddingRight: 14 }}
                disabled={loading}
              >

                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color="#8D6E63"
                />

              </TouchableOpacity>

            </View>

            {/* CONFIRM PASSWORD */}

            <View style={styles.inputGroup}>

              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={t('confirmPassword')}
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirm(!showConfirm)
                }
                style={{ paddingRight: 14 }}
                disabled={loading}
              >

                <Ionicons
                  name={
                    showConfirm
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color="#8D6E63"
                />

              </TouchableOpacity>

            </View>

            {/* REGISTER BUTTON */}

            <TouchableOpacity
              style={[
                styles.registerBtn,
                loading && { opacity: 0.7 },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >

              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>
                  {t('createAccount')}
                </Text>
              )}

            </TouchableOpacity>

            {/* LOGIN */}

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() =>
                navigation.navigate('Login')
              }
              disabled={loading}
            >

              <Text style={styles.loginText}>

                {t('alreadyHaveAccount')}{' '}

                <Text style={styles.loginBold}>
                  {t('login')}
                </Text>

              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  scroll: {
    flexGrow: 1,
    padding: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 8,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  logoRow: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    fontSize: 48,
  },

  subtitle: {
    fontSize: 15,
    color: '#8D6E63',
    marginTop: 6,
    fontStyle: 'italic',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,

    elevation: 8,
  },

  sectionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 10,
  },

  roleToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,

    paddingVertical: 12,
    borderRadius: 12,

    borderWidth: 2,
    borderColor: '#2E7D32',

    backgroundColor: '#fff',
  },

  roleBtnActive: {
    backgroundColor: '#2E7D32',
  },

  roleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },

  roleBtnTextActive: {
    color: '#fff',
  },

  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },

  errorText: {
    color: '#F44336',
    fontSize: 13,
    fontWeight: '500',
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F8F8F8',

    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',

    marginBottom: 14,
  },

  inputIcon: {
    paddingLeft: 14,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1B1B1B',
  },

  registerBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,

    paddingVertical: 16,

    alignItems: 'center',

    marginBottom: 16,

    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 5,
  },

  registerBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  loginLink: {
    alignItems: 'center',
    paddingTop: 8,
  },

  loginText: {
    fontSize: 14,
    color: '#666',
  },

  loginBold: {
    color: '#2E7D32',
    fontWeight: '700',
  },

});