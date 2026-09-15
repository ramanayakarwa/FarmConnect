import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { bookingService } from '../../services/bookingService';
import { calculateDays, calculateTotal } from '../../utils/helpers';
import { getEquipmentLocalImage } from '../../utils/equipmentImages';

export default function BookingScreen({ route, navigation }) {
  const { t } = useTranslation();

  const equipment = route?.params?.equipment;

  if (!equipment) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>{t('noEquipmentReceived')}</Text>
      </View>
    );
  }

  // For dates, we'll pre-fill with logical defaults
  // (today and tomorrow) to keep MVP fully functional.
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDateString = (date) =>
    date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(
    formatDateString(today)
  );
  const [endDate, setEndDate] = useState(
    formatDateString(tomorrow)
  );
  const [landSize, setLandSize] = useState('1');
  const [location, setLocation] = useState(
    equipment.location || ''
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const days = calculateDays(startDate, endDate);
  const totalAmount = calculateTotal(
    equipment.price,
    startDate,
    endDate
  );

  const handleBooking = async () => {
    if (!startDate || !endDate || !landSize || !location) {
      Alert.alert(
        t('error'),
        t('pleaseFillAllDetails')
      );
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert(
        t('error'),
        t('endDateAfterStart')
      );
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        equipment_id: equipment.id,
        start_date: startDate,
        end_date: endDate,
        land_size: parseFloat(landSize),
        payment_method:
          paymentMethod === 'Pay Later'
            ? 'bank_transfer'
            : paymentMethod.toLowerCase(),
      };

      const response =
        await bookingService.createBooking(bookingData);

      // Use whatever the server actually saved.
      // Falls back to bookingData if the service doesn't
      // return a usable payload.
      const confirmedBooking =
        response?.data ?? response ?? bookingData;

      Alert.alert(
        t('success'),
        t('bookingCreated'),
        [
          {
            text: t('ok'),
            onPress: () => {
              navigation.navigate(
                'BookingConfirmation',
                {
                  equipment,
                  booking: confirmedBooking,
                }
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('bookingFailed'),
        error.message || t('unableToCreateBooking')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' ? 'padding' : 'height'
        }
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1B1B1B"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t('confirmBooking')}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Equipment Info Summary */}
          <View style={styles.summaryCard}>
            <Image
              source={getEquipmentLocalImage(equipment)}
              style={styles.summaryImage}
            />

            <View style={styles.summaryDetails}>
              <Text style={styles.equipName}>
                {equipment.name}
              </Text>

              <Text style={styles.equipCategory}>
                {equipment.category}
              </Text>

              <Text style={styles.equipPrice}>
                ₹{equipment.price}/{t('day')}
              </Text>
            </View>
          </View>

          {/* Booking Inputs */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('bookingDetails')}
            </Text>

            {/* Start Date */}
            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  {t('startDate')}
                </Text>

                <View style={styles.inputBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#8D6E63"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* End Date */}
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  {t('endDate')}
                </Text>

                <View style={styles.inputBox}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#8D6E63"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            {/* Land Size */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('landSizeAcres')}
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color="#8D6E63"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={landSize}
                  onChangeText={setLandSize}
                  placeholder={t('enterLandSize')}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('farmLocation')}
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#8D6E63"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('farmLocationPlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('selectPaymentMethod')}
            </Text>

            <View style={styles.payMethods}>
              {/* UPI */}
              <TouchableOpacity
                style={[
                  styles.payBtn,
                  paymentMethod === 'UPI' &&
                    styles.payBtnActive,
                ]}
                onPress={() =>
                  setPaymentMethod('UPI')
                }
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color={
                    paymentMethod === 'UPI'
                      ? '#fff'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.payText,
                    paymentMethod === 'UPI' &&
                      styles.payTextActive,
                  ]}
                >
                  UPI
                </Text>
              </TouchableOpacity>

              {/* Cash */}
              <TouchableOpacity
                style={[
                  styles.payBtn,
                  paymentMethod === 'Cash' &&
                    styles.payBtnActive,
                ]}
                onPress={() =>
                  setPaymentMethod('Cash')
                }
              >
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={
                    paymentMethod === 'Cash'
                      ? '#fff'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.payText,
                    paymentMethod === 'Cash' &&
                      styles.payTextActive,
                  ]}
                >
                  {t('cash')}
                </Text>
              </TouchableOpacity>

              {/* Pay Later */}
              <TouchableOpacity
                style={[
                  styles.payBtn,
                  paymentMethod === 'Pay Later' &&
                    styles.payBtnActive,
                ]}
                onPress={() =>
                  setPaymentMethod('Pay Later')
                }
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={
                    paymentMethod === 'Pay Later'
                      ? '#fff'
                      : '#2E7D32'
                  }
                />

                <Text
                  style={[
                    styles.payText,
                    paymentMethod === 'Pay Later' &&
                      styles.payTextActive,
                  ]}
                >
                  {t('payLater')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Cost Display */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('priceDetails')}
            </Text>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                {t('rentPerDay')}
              </Text>

              <Text style={styles.billVal}>
                ₹{equipment.price}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>
                {t('duration')}
              </Text>

              <Text style={styles.billVal}>
                {days}{' '}
                {days === 1
                  ? t('day')
                  : t('days')}
              </Text>
            </View>

            <View
              style={[
                styles.billRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#E0E0E0',
                  paddingTop: 12,
                  marginTop: 12,
                },
              ]}
            >
              <Text style={styles.totalLabel}>
                {t('totalAmount')}
              </Text>

              <Text style={styles.totalValue}>
                ₹{totalAmount}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleBooking}
            disabled={loading}
          >
            <Text style={styles.confirmBtnText}>
              {loading
                ? t('processing')
                : `${t('payAndConfirm')}: ₹${totalAmount}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

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

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  scroll: {
    padding: 16,
    paddingBottom: 100,
  },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },

  summaryDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },

  equipName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1B1B',
  },

  equipCategory: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '600',
    marginTop: 2,
  },

  equipPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 14,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  halfInput: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },

  inputIcon: {
    marginRight: 6,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1B1B1B',
  },

  field: {
    marginBottom: 12,
  },

  payMethods: {
    flexDirection: 'row',
    gap: 10,
  },

  payBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },

  payBtnActive: {
    backgroundColor: '#2E7D32',
  },

  payText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },

  payTextActive: {
    color: '#fff',
  },

  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  billLabel: {
    fontSize: 14,
    color: '#666',
  },

  billVal: {
    fontSize: 14,
    color: '#1B1B1B',
    fontWeight: '600',
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2E7D32',
  },

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
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
  },

  confirmBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});