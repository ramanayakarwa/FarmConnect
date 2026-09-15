import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/helpers';

export default function BookingConfirmationScreen({
  route,
  navigation,
}) {
  const { t } = useTranslation();

  const { booking, equipment } = route.params;

  // BookingScreen.js sends booking data using snake_case
  // while some responses may use camelCase.
  // Keep all fallbacks so the screen remains safe.
  const ownerName =
    booking?.owner_name ||
    booking?.ownerName ||
    equipment?.owner_name ||
    equipment?.ownerName;

  const ownerPhone =
    booking?.owner_phone ||
    booking?.ownerPhone ||
    equipment?.owner_phone ||
    equipment?.ownerPhone;

  const bookingId =
    booking?.id ||
    booking?.booking_id ||
    booking?.bookingId;

  const equipmentName =
    equipment?.name ||
    booking?.equipmentName ||
    booking?.equipment_name;

  const startDate =
    booking?.start_date ||
    booking?.startDate;

  const endDate =
    booking?.end_date ||
    booking?.endDate;

  const landSize =
    booking?.land_size ||
    booking?.landSize;

  const paymentMethod =
    booking?.payment_method ||
    booking?.paymentMethod;

  const handleContactProvider = () => {
    Alert.alert(
      t('contactProvider'),
      `${t('provider')}: ${
        ownerName || t('notAvailable')
      }\n${t('phone')}: ${
        ownerPhone || t('notAvailable')
      }`,
      [
        {
          text: t('close'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleTrackBooking = () => {
    navigation.navigate('FarmerTabs', {
      screen: 'My Bookings',
    });
  };

  const handleBackHome = () => {
    navigation.navigate('FarmerTabs', {
      screen: 'Home',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon Block */}
        <View style={styles.successBlock}>
          <View style={styles.checkmarkCircle}>
            <Ionicons
              name="checkmark"
              size={56}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>
            {t('bookingSuccessful')}
          </Text>

          <Text style={styles.subtitle}>
            {t('bookingRequestSent')}
          </Text>
        </View>

        {/* Booking Info Card */}
        <View style={styles.card}>
          {/* Booking ID */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('bookingId')}
            </Text>

            <Text style={styles.bookingId}>
              {bookingId || t('pending')}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Equipment */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('equipment')}
            </Text>

            <Text style={styles.value}>
              {equipmentName || '—'}
            </Text>
          </View>

          {/* Start Date */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('startDate')}
            </Text>

            <Text style={styles.value}>
              {startDate
                ? formatDate(startDate)
                : '—'}
            </Text>
          </View>

          {/* End Date */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('endDate')}
            </Text>

            <Text style={styles.value}>
              {endDate
                ? formatDate(endDate)
                : '—'}
            </Text>
          </View>

          {/* Land Size */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('landSize')}
            </Text>

            <Text style={styles.value}>
              {landSize
                ? `${landSize} ${t('acres')}`
                : '—'}
            </Text>
          </View>

          {/* Payment Method */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('paymentMethod')}
            </Text>

            <Text style={styles.value}>
              {paymentMethod || '—'}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('status')}
            </Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {t('pendingApproval')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnGroup}>
          {/* Track Booking */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleTrackBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              {t('trackBookingStatus')}
            </Text>

            <Ionicons
              name="time-outline"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Contact Provider */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleContactProvider}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={18}
              color="#2E7D32"
            />

            <Text style={styles.secondaryBtnText}>
              {t('contactEquipmentProvider')}
            </Text>
          </TouchableOpacity>

          {/* Back Home */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={handleBackHome}
            activeOpacity={0.8}
          >
            <Text style={styles.linkText}>
              {t('backToHome')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  scroll: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  successBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },

  checkmarkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,

    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,

    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },

  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },

  bookingId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2E7D32',
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B1B1B',
    textAlign: 'right',
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
  },

  btnGroup: {
    width: '100%',
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },

  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },

  secondaryBtnText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '700',
  },

  linkBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },

  linkText: {
    color: '#8D6E63',
    fontWeight: '700',
    fontSize: 15,
  },
});