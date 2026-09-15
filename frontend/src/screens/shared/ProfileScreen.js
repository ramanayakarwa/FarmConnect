import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [saving, setSaving] = useState(false);

  // Check whether logged-in user is Provider or Farmer
  const isProvider = user?.role === 'provider';

  const handleEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');

    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');

    setIsEditing(false);
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      Alert.alert(
        t('error'),
        t('nameCannotBeEmpty')
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        t('error'),
        t('emailCannotBeEmpty')
      );
      return;
    }

    if (!cleanPhone) {
      Alert.alert(
        t('error'),
        t('phoneCannotBeEmpty')
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        t('error'),
        t('invalidEmail')
      );
      return;
    }

    try {
      setSaving(true);

      const updatedUser = await updateUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      });

      setName(updatedUser?.name || cleanName);
      setEmail(updatedUser?.email || cleanEmail);
      setPhone(updatedUser?.phone || cleanPhone);

      setIsEditing(false);

      Alert.alert(
        t('success'),
        t('profileUpdatedSuccessfully')
      );
    } catch (error) {
      console.log(
        'PROFILE UPDATE ERROR:',
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        t('error'),
        error?.response?.data?.message ||
          error?.message ||
          t('couldNotUpdateProfile')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',

          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.log(
                'LOGOUT ERROR:',
                error?.message || error
              );

              Alert.alert(
                t('error'),
                t('couldNotLogout')
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('profile')}
        </Text>

        <Text style={styles.headerSubtitle}>
          {t('manageAccount')}
        </Text>
      </View>

      {/* PROFILE ICON */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons
            name={isProvider ? 'construct' : 'person'}
            size={55}
            color="#2E7D32"
          />
        </View>

        <Text style={styles.userName}>
          {user?.name || t('user')}
        </Text>

        <Text style={styles.userRole}>
          {isProvider
            ? t('equipmentProvider')
            : t('farmer')}
        </Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.card}>

        {/* NAME */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {t('name')}
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('enterYourName')}
              autoCapitalize="words"
            />
          ) : (
            <Text style={styles.value}>
              {user?.name || '-'}
            </Text>
          )}
        </View>

        {/* EMAIL */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {t('email')}
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('enterYourEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <Text style={styles.value}>
              {user?.email || '-'}
            </Text>
          )}
        </View>

        {/* PHONE */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {t('phone')}
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('enterYourPhone')}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>
              {user?.phone || '-'}
            </Text>
          )}
        </View>

        {/* ROLE */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {t('role')}
          </Text>

          <Text style={styles.value}>
            {isProvider
              ? t('provider')
              : t('farmer')}
          </Text>
        </View>

      </View>

      {/* EDIT / SAVE / CANCEL */}
      {!isEditing ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleEdit}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            {t('editProfile')}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonRow}>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  {t('save')}
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      )}

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#D32F2F"
        />

        <Text style={styles.logoutText}>
          {t('logout')}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 5,
  },

  avatarContainer: {
    alignItems: 'center',
    marginTop: -35,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginTop: 10,
  },

  userRole: {
    fontSize: 14,
    color: '#757575',
    marginTop: 3,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 25,
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 7,
  },

  value: {
    fontSize: 16,
    color: '#212121',
  },

  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#FAFAFA',
  },

  primaryButton: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#616161',
  },

  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  logoutButton: {
    marginHorizontal: 16,
    marginTop: 25,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF9A9A',
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  logoutText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
  },
});