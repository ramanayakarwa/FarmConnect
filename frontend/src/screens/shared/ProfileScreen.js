import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext';
import NotificationInbox from '../../components/NotificationInbox';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const actionLock = useRef(false);

  const isProvider = user?.role === 'provider';
  const busy = saving || loggingOut;

  const resetFields = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
  };

  const handleEdit = () => {
    if (actionLock.current) return;

    resetFields();
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (actionLock.current) return;

    resetFields();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (actionLock.current) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      Alert.alert(
        'Missing details',
        'Enter your name, email and phone number.'
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      Alert.alert(
        'Invalid email',
        'Enter a valid email address.'
      );
      return;
    }

    actionLock.current = true;
    setSaving(true);

    try {
      await updateUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      });

      setIsEditing(false);

      Alert.alert(
        'Success',
        'Your profile has been updated.'
      );
    } catch (error) {
      Alert.alert(
        'Unable to save',
        error.response?.data?.message ||
          error.message ||
          'Please try again.'
      );
    } finally {
      actionLock.current = false;
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (actionLock.current) return;

    Alert.alert(
      'Log out',
      isEditing
        ? 'Log out and discard your unsaved profile changes?'
        : 'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            if (actionLock.current) return;

            actionLock.current = true;
            setLoggingOut(true);

            try {
              await logout();
            } catch (error) {
              Alert.alert(
                'Unable to log out',
                error.message || 'Please try again.'
              );
            } finally {
              actionLock.current = false;
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t('profile', {
                defaultValue: 'Profile',
              })}
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your account and notifications
            </Text>
          </View>

          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Ionicons
                name={isProvider ? 'construct' : 'person'}
                size={42}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.userName}>
              {user?.name || 'User'}
            </Text>

            <Text style={styles.userRole}>
              {isProvider
                ? t('equipmentProvider', {
                    defaultValue: 'Equipment Provider',
                  })
                : t('farmer', {
                    defaultValue: 'Farmer',
                  })}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Account Details
            </Text>

            <Text style={styles.label}>
              {t('name', { defaultValue: 'Name' })}
            </Text>

            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#888888"
                autoCapitalize="words"
                maxLength={100}
                editable={!busy}
              />
            ) : (
              <Text style={styles.value}>
                {user?.name || 'Not provided'}
              </Text>
            )}

            <Text style={styles.label}>
              {t('email', { defaultValue: 'Email' })}
            </Text>

            {isEditing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#888888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={100}
                editable={!busy}
              />
            ) : (
              <Text style={styles.value}>
                {user?.email || 'Not provided'}
              </Text>
            )}

            <Text style={styles.label}>
              {t('phone', {
                defaultValue: 'Phone number',
              })}
            </Text>

            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#888888"
                keyboardType="phone-pad"
                maxLength={15}
                editable={!busy}
              />
            ) : (
              <Text style={styles.value}>
                {user?.phone || 'Not provided'}
              </Text>
            )}

            <Text style={styles.label}>
              {t('role', {
                defaultValue: 'Account type',
              })}
            </Text>

            <Text style={styles.value}>
              {isProvider ? 'Equipment Provider' : 'Farmer'}
            </Text>

            {!isEditing ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  busy && styles.disabled,
                ]}
                onPress={handleEdit}
                disabled={busy}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryText}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    busy && styles.disabled,
                  ]}
                  onPress={handleCancel}
                  disabled={busy}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    busy && styles.disabled,
                  ]}
                  onPress={handleSave}
                  disabled={busy}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Shared notification inbox for both roles. */}
          <NotificationInbox />

          <TouchableOpacity
            style={[
              styles.logoutButton,
              busy && styles.disabled,
            ]}
            onPress={handleLogout}
            disabled={busy}
          >
            {loggingOut ? (
              <ActivityIndicator color="#C62828" />
            ) : (
              <>
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="#C62828"
                />

                <Text style={styles.logoutText}>
                  Log Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E8F5E9',
    marginTop: 6,
  },

  identity: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 16,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },

  userName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
    marginTop: 12,
  },

  userRole: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
    marginTop: 14,
    marginBottom: 6,
  },

  value: {
    fontSize: 16,
    lineHeight: 23,
    color: '#333333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 9,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222222',
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    marginTop: 22,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#BBBBBB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666666',
  },

  saveButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 22,
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#EF9A9A',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
  },

  disabled: {
    opacity: 0.5,
  },
});