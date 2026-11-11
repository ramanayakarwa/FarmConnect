import React from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const STATUS_LABELS = {
  pending: 'Waiting for provider approval',
  accepted: 'Accepted',
  on_the_way: 'On the Way',
  arrived: 'Arrived',
  work_started: 'Work Started',
  completed: 'Work Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
};

const formatDate = (value) => {
  if (!value) return 'Not available';

  // PostgreSQL DATE responses may include a time portion.
  const datePart = String(value).slice(0, 10);
  const parts = datePart.split('-');

  if (parts.length !== 3) return datePart;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>
      {label}
    </Text>

    <Text style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

export default function BookingConfirmationScreen({
  route,
  navigation,
}) {
  const booking = route?.params?.booking;
  const equipment = route?.params?.equipment;

  const openTab = (screen) => {
    // Remove the completed booking form from navigation.
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'FarmerTabs',
          params: { screen },
        },
      ],
    });
  };

  if (!booking?.id) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missingContainer}>
          <Text style={styles.heading}>
            Booking details unavailable
          </Text>

          <Text style={styles.subtitle}>
            Check My Bookings before submitting
            another request.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => openTab('My Bookings')}
          >
            <Text style={styles.primaryText}>
              Open My Bookings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const amount = Number(booking.total_amount);

  const validAmount =
    booking.total_amount != null &&
    Number.isFinite(amount) &&
    amount > 0;

  const formattedAmount = validAmount
    ? `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : 'Amount needs review';

  const equipmentName =
    booking.equipment_name ||
    equipment?.name ||
    'Equipment';

  const providerName =
    booking.owner_name ||
    equipment?.owner_name ||
    'Not available';

  const providerPhone =
    booking.owner_phone ||
    equipment?.owner_phone ||
    'Not provided';

  const paymentMethod =
    PAYMENT_METHOD_LABELS[booking.payment_method] ||
    booking.payment_method ||
    'Not specified';

  const paymentTiming =
    booking.payment_timing === 'pay_later'
      ? 'Pay Later'
      : booking.payment_timing === 'pay_now'
        ? 'Advance payment requested'
        : 'Not specified';

  const paymentStatus =
    booking.payment_status === 'paid'
      ? 'Received'
      : booking.payment_status === 'pending'
        ? 'Pending'
        : booking.payment_status || 'Not confirmed';

  const pricingUnit =
    booking.pricing_type === 'per_acre'
      ? 'Per Acre'
      : booking.pricing_type === 'per_day'
        ? 'Per Day'
        : 'Not specified';

  const statusLabel =
    STATUS_LABELS[booking.status] ||
    booking.status ||
    'Not available';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIcon}>
          <Ionicons
            name="checkmark-circle"
            size={76}
            color="#2E7D32"
          />
        </View>

        <Text style={styles.heading}>
          Booking Request Saved
        </Text>

        <Text style={styles.subtitle}>
          Your request has been recorded. Track
          provider approval and service progress in
          My Bookings.
        </Text>

        <View style={styles.bookingBadge}>
          <Text style={styles.bookingBadgeText}>
            Booking #{booking.id}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Booking Details
          </Text>

          <DetailRow
            label="Equipment"
            value={equipmentName}
          />

          <DetailRow
            label="Start date"
            value={formatDate(booking.start_date)}
          />

          <DetailRow
            label="End date"
            value={formatDate(booking.end_date)}
          />

          <DetailRow
            label="Land size"
            value={
              booking.land_size != null
                ? `${booking.land_size} acres`
                : 'Not specified'
            }
          />

          <DetailRow
            label="Farm location"
            value={
              booking.farm_location ||
              'Not provided'
            }
          />

          <DetailRow
            label="Pricing"
            value={pricingUnit}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Booking Amount
            </Text>

            <Text style={styles.totalAmount}>
              {formattedAmount}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Current Status
          </Text>

          <View style={styles.statusBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#2E7D32"
            />

            <Text style={styles.statusText}>
              {statusLabel}
            </Text>
          </View>

          {booking.status === 'pending' && (
            <Text style={styles.note}>
              Saving a request does not mean the
              provider has accepted it yet.
            </Text>
          )}

          <Text style={styles.note}>
            This is the status returned when the
            request was saved. Open My Bookings for
            the latest updates.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Payment Details
          </Text>

          <DetailRow
            label="Payment timing"
            value={paymentTiming}
          />

          <DetailRow
            label="Payment method"
            value={paymentMethod}
          />

          <DetailRow
            label="Payment status"
            value={paymentStatus}
          />

          {booking.payment_status !== 'paid' && (
            <Text style={styles.note}>
              This screen does not confirm a payment.
              Arrange payment with the provider after
              work completion. The provider records
              receipt in the app.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Provider
          </Text>

          <DetailRow
            label="Name"
            value={providerName}
          />

          <DetailRow
            label="Phone"
            value={providerPhone}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => openTab('My Bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.primaryText}>
            Track in My Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => openTab('Home')}
        >
          <Text style={styles.secondaryText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  successIcon: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },

  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 18,
  },

  bookingBadge: {
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 22,
  },

  bookingBadgeText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 15,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },

  detailLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#777777',
  },

  detailValue: {
    flex: 1.4,
    fontSize: 14,
    lineHeight: 21,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'right',
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 14,
    marginTop: 4,
  },

  totalLabel: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '700',
    marginBottom: 6,
  },

  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
  },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  note: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
    marginTop: 6,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 10,
  },

  secondaryText: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '700',
  },

  missingContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});