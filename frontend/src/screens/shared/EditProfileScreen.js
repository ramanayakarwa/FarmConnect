import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      Alert.alert(
        'Error',
        'Name, email and phone cannot be empty.'
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.'
      );
      return;
    }

    // Indian phone validation
    const phoneDigits = cleanPhone.replace(/\D/g, '');

    if (phoneDigits.length !== 10) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    try {
      setSaving(true);

      console.log('UPDATING PROFILE:', {
        name: cleanName,
        email: cleanEmail,
        phone: phoneDigits,
      });

      // updateUser (from AuthContext) calls authService.updateProfile
      // internally, updates AsyncStorage, and updates app state — so we
      // only need to call this once, not authService directly (that was
      // the old bug: calling authService.updateProfile() AND updateUser(),
      // which hit the backend twice and used the wrong response shape).
      await updateUser({
        name: cleanName,
        email: cleanEmail,
        phone: phoneDigits,
      });

      Alert.alert(
        'Success',
        'Profile updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.log(
        'PROFILE UPDATE ERROR:',
        err?.response?.data || err?.message || err
      );

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Could not update profile. Please try again.';

      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1B1B1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#8D6E63" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#8D6E63" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={true}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={18} color="#8D6E63" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  editable={true}
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5DC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1B1B1B' },
  scroll: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 6 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1B1B1B' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});