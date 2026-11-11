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
import { bookingService } from '../../services/bookingService';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

// Match the backend's calendar date for bookings in India.
const todayString = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
};

// UTC is used only to validate calendar dates and count days.
// The original YYYY-MM-DD strings are sent to the backend.
const parseDate = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return parsed;
};

const money = (value) =>
  Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function BookingScreen({ route, navigation }) {
  const equipment = route?.params?.equipment;

  const [startDate, setStartDate] = useState(todayString);
  const [endDate, setEndDate] = useState(todayString);
  const [landSize, setLandSize] = useState('1');
  const [farmLocation, setFarmLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const submissionLock = useRef(false);

  const pricingType = equipment?.pricing_type;
  const perAcre = pricingType === 'per_acre';
  const rate = Number(equipment?.price);

  const validRate =
    Number.isFinite(rate) &&
    rate > 0 &&
    ['per_acre', 'per_day'].includes(pricingType);

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const validDates =
    start !== null &&
    end !== null &&
    end.getTime() >= start.getTime();

  const startInPast =
    start !== null && startDate < todayString();

  const days = validDates
    ? (end.getTime() - start.getTime()) / 86400000 + 1
    : 0;

  const acres = Number(landSize);

  const validAcres =
    /^\d+(\.\d{1,2})?$/.test(landSize.trim()) &&
    Number.isFinite(acres) &&
    acres > 0 &&
    acres <= 999999.99;

  const quantity = perAcre ? acres : days;

  const estimatedTotal =
    validRate && validDates && !startInPast && validAcres
      ? Number((rate * quantity).toFixed(2))
      : null;

  const validTotal =
    estimatedTotal !== null &&
    Number.isFinite(estimatedTotal) &&
    estimatedTotal > 0 &&
    estimatedTotal < 1e10;

  const handleBooking = async () => {
    if (submissionLock.current) return;

    if (!equipment?.id) {
      Alert.alert(
        'Equipment missing',
        'Please select equipment again.'
      );
      return;
    }

    if (equipment.availability !== true) {
      Alert.alert(
        'Unavailable',
        'This equipment is not available for booking.'
      );
      return;
    }

    if (!validDates) {
      Alert.alert(
        'Invalid dates',
        'Enter real dates in YYYY-MM-DD format. The end date must be on or after the start date.'
      );
      return;
    }

    // Recheck at submission in case the form stayed open overnight.
    if (startDate < todayString()) {
      Alert.alert(
        'Invalid start date',
        'The start date cannot be in the past.'
      );
      return;
    }

    if (!validAcres) {
      Alert.alert(
        'Invalid acreage',
        'Enter a positive land size with up to two decimal places.'
      );
      return;
    }

    if (!farmLocation.trim()) {
      Alert.alert(
        'Farm location required',
        'Enter your farm address, village and a nearby landmark.'
      );
      return;
    }

    if (!validRate || !validTotal) {
      Alert.alert(
        'Invalid amount',
        'Check the equipment rate, acreage and booking dates.'
      );
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    let response;

    try {
      response = await bookingService.createBooking({
        equipment_id: equipment.id,
        start_date: startDate,
        end_date: endDate,
        land_size: acres,
        farm_location: farmLocation.trim(),
        payment_timing: 'pay_later',
        payment_method: paymentMethod,
      });
    } catch (error) {
      submissionLock.current = false;
      setSubmitting(false);

      Alert.alert(
        'Booking could not be confirmed',
        error.response?.data?.message ||
          'The response could not be received. Check My Bookings before submitting again to avoid a duplicate request.'
      );

      return;
    }

    const booking = response?.data;

    if (!booking?.id) {
      Alert.alert(
        'Check My Bookings',
        'The server response was incomplete. Check My Bookings before creating another request.',
        [
          {
            text: 'My Bookings',
            onPress: () =>
              navigation.navigate('FarmerTabs', {
                screen: 'My Bookings',
              }),
          },
        ],
        { cancelable: false }
      );

      return;
    }

    navigation.replace('BookingConfirmation', {
      equipment,
      booking,
    });
  };

  if (!equipment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.title}>
            No equipment selected
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={submitting}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#222222"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Request Booking
          </Text>

          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              {equipment.name}
            </Text>

            <Text style={styles.bodyText}>
              {equipment.category}
            </Text>

            <Text style={styles.rate}>
              {validRate
                ? `₹${money(rate)} / ${perAcre ? 'acre' : 'day'}`
                : 'Price not configured'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Booking Details
            </Text>

            <Text style={styles.label}>
              Start date (YYYY-MM-DD)
            </Text>

            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888888"
              maxLength={10}
              autoCorrect={false}
              autoCapitalize="none"
              editable={!submitting}
            />

            <Text style={styles.label}>
              End date (YYYY-MM-DD)
            </Text>

            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888888"
              maxLength={10}
              autoCorrect={false}
              autoCapitalize="none"
              editable={!submitting}
            />

            {!validDates && (
              <Text style={styles.validation}>
                Enter valid dates. The end date cannot be
                before the start date.
              </Text>
            )}

            {startInPast && (
              <Text style={styles.validation}>
                The start date cannot be in the past.
              </Text>
            )}

            <Text style={styles.label}>
              Land size in acres
            </Text>

            <TextInput
              style={styles.input}
              value={landSize}
              onChangeText={setLandSize}
              placeholder="Example: 3 or 2.5"
              placeholderTextColor="#888888"
              keyboardType="decimal-pad"
              maxLength={9}
              editable={!submitting}
            />

            {!validAcres && (
              <Text style={styles.validation}>
                Enter a positive acreage with up to two
                decimal places.
              </Text>
            )}

            <Text style={styles.label}>
              Farm location
            </Text>

            <TextInput
              style={[styles.input, styles.locationInput]}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Farm address, village and nearby landmark"
              placeholderTextColor="#888888"
              multiline
              textAlignVertical="top"
              maxLength={1000}
              editable={!submitting}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Payment Timing
            </Text>

            <View style={styles.timingBox}>
              <Ionicons
                name="time-outline"
                size={22}
                color="#2E7D32"
              />

              <Text style={styles.timingText}>
                Pay Later — after work completion
              </Text>
            </View>

            <Text style={styles.bodyText}>
              Pay Now is currently unavailable. No payment
              is collected when you submit this request.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Payment Method
            </Text>

            <View style={styles.methodList}>
              {PAYMENT_METHODS.map((method) => {
                const selected =
                  paymentMethod === method.value;

                return (
                  <TouchableOpacity
                    key={method.value}
                    onPress={() =>
                      setPaymentMethod(method.value)
                    }
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.methodButton,
                      selected && styles.methodButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodText,
                        selected && styles.methodTextSelected,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.bodyText}>
              Arrange payment directly with the provider.
              The provider confirms receipt in the app
              after completing the work.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Price Details
            </Text>

            <View style={styles.billRow}>
              <Text style={styles.bodyText}>Pricing unit</Text>

              <Text style={styles.billValue}>
                {validRate
                  ? perAcre
                    ? 'Per Acre'
                    : 'Per Day'
                  : 'Not configured'}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.bodyText}>Rate</Text>

              <Text style={styles.billValue}>
                {validRate ? `₹${money(rate)}` : '—'}
              </Text>
            </View>

            <View style={styles.billRow}>
              <Text style={styles.bodyText}>
                {perAcre ? 'Acres' : 'Booking days'}
              </Text>

              <Text style={styles.billValue}>
                {perAcre
                  ? validAcres
                    ? acres
                    : '—'
                  : validDates
                    ? days
                    : '—'}
              </Text>
            </View>

            {!perAcre && validRate && (
              <Text style={styles.hint}>
                Both start and end dates are included.
                Acreage does not change a per-day rate.
              </Text>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.title}>
                Estimated Total
              </Text>

              <Text style={styles.total}>
                {validTotal
                  ? `₹${money(estimatedTotal)}`
                  : '—'}
              </Text>
            </View>

            <Text style={styles.hint}>
              The server calculates the final booking
              amount using the current equipment rate.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              submitting && styles.disabled,
            ]}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {validTotal
                  ? `Request Booking · ₹${money(estimatedTotal)}`
                  : 'Request Booking'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your request becomes accepted only after
            the provider approves it.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 42,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
  },
  rate: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    color: '#222222',
  },
  locationInput: {
    minHeight: 90,
  },
  validation: {
    color: '#C62828',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  timingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginBottom: 12,
  },
  timingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
  methodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  methodButton: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  methodButtonSelected: {
    backgroundColor: '#2E7D32',
  },
  methodText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  methodTextSelected: {
    color: '#FFFFFF',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  billValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  hint: {
    fontSize: 12,
    lineHeight: 19,
    color: '#777777',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
    marginTop: 12,
  },
  total: {
    fontSize: 23,
    fontWeight: '800',
    color: '#2E7D32',
  },
  button: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 19,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
  },
  missing: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});