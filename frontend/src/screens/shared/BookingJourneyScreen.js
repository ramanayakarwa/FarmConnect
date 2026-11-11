import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';

const STAGES = [
  'pending',
  'accepted',
  'on_the_way',
  'arrived',
  'work_started',
  'completed',
];

const LABELS = {
  pending: 'Requested',
  accepted: 'Accepted',
  on_the_way: 'On the Way',
  arrived: 'Arrived',
  work_started: 'Work Started',
  completed: 'Work Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const PAYMENT_METHODS = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
};

const NEXT_ACTIONS = {
  accepted: {
    status: 'on_the_way',
    label: 'Mark On the Way',
  },
  on_the_way: {
    status: 'arrived',
    label: 'Mark Arrived',
  },
  arrived: {
    status: 'work_started',
    label: 'Start Work',
  },
  work_started: {
    status: 'completed',
    label: 'Complete Work',
  },
};

const amountLabel = (value) => {
  if (
    value == null ||
    !Number.isFinite(Number(value)) ||
    Number(value) <= 0
  ) {
    return 'Amount needs review';
  }

  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const dateLabel = (value) => {
  if (!value) return '—';

  const parts = String(value).slice(0, 10).split('-');

  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : String(value);
};

// Defined outside the screen so polling does not
// remount inputs or reset a farmer's draft feedback.
function BookingItem({
  booking,
  provider,
  busy,
  onAction,
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const closed = ['rejected', 'cancelled'].includes(
    booking.status
  );

  const completed = booking.status === 'completed';
  const paid = booking.payment_status === 'paid';
  const hasFeedback = booking.feedback_rating != null;

  const stageIndex = STAGES.indexOf(booking.status);
  const nextAction = NEXT_ACTIONS[booking.status];

  const contactName = provider
    ? booking.farmer_name
    : booking.owner_name;

  const contactPhone = provider
    ? booking.farmer_phone
    : booking.owner_phone;

  const confirmStatus = (status, label) => {
    Alert.alert(
      label,
      `Update booking #${booking.id} to "${
        LABELS[status] || status
      }"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () =>
            onAction(booking.id, { status }),
        },
      ]
    );
  };

  const confirmPayment = () => {
    if (!(Number(booking.total_amount) > 0)) {
      Alert.alert(
        'Amount needs review',
        'Correct the booking amount before confirming payment.'
      );
      return;
    }

    Alert.alert(
      'Confirm payment received',
      `Have you actually received ${amountLabel(
        booking.total_amount
      )} for this booking?\n\nThis records receipt only. It does not charge the farmer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, payment received',
          onPress: () =>
            onAction(booking.id, {
              payment_status: 'paid',
            }),
        },
      ]
    );
  };

  const submitFeedback = () => {
    if (rating < 1 || rating > 5) {
      Alert.alert(
        'Choose a rating',
        'Select between 1 and 5 stars.'
      );
      return;
    }

    onAction(booking.id, {
      feedback_rating: rating,
      feedback_text: feedback.trim(),
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.bookingId}>
        Booking #{booking.id}
      </Text>

      <Text style={styles.equipmentName}>
        {booking.equipment_name || 'Equipment'}
      </Text>

      <Text style={styles.info}>
        {provider ? 'Farmer' : 'Provider'}:{' '}
        {contactName || 'Not provided'}
      </Text>

      <Text style={styles.info}>
        Phone: {contactPhone || 'Not provided'}
      </Text>

      <Text style={styles.info}>
        Dates: {dateLabel(booking.start_date)} →{' '}
        {dateLabel(booking.end_date)}
      </Text>

      <Text style={styles.info}>
        Farm: {booking.farm_location || 'Not provided'}
      </Text>

      <Text style={styles.info}>
        Land: {booking.land_size ?? '—'} acres
      </Text>

      <Text style={styles.info}>
        Pricing:{' '}
        {booking.pricing_type === 'per_acre'
          ? 'Per Acre'
          : booking.pricing_type === 'per_day'
            ? 'Per Day'
            : 'Not specified'}
      </Text>

      <Text style={styles.amount}>
        {amountLabel(booking.total_amount)}
      </Text>

      <View
        style={[
          styles.statusBox,
          closed && styles.closedBox,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            closed && styles.closedText,
          ]}
        >
          {LABELS[booking.status] || booking.status}
        </Text>
      </View>

      <Text style={styles.info}>
        Payment timing:{' '}
        {booking.payment_timing === 'pay_later'
          ? 'Pay Later'
          : booking.payment_timing === 'pay_now'
            ? 'Advance requested'
            : 'Not specified'}
      </Text>

      <Text style={styles.info}>
        Payment method:{' '}
        {PAYMENT_METHODS[booking.payment_method] ||
          booking.payment_method ||
          'Not specified'}
      </Text>

      <Text style={styles.info}>
        Payment status:{' '}
        {paid
          ? 'Received'
          : booking.payment_status === 'pending'
            ? 'Pending'
            : booking.payment_status || 'Not confirmed'}
      </Text>

      {!closed && (
        <View style={styles.timeline}>
          <Text style={styles.sectionTitle}>
            Booking Progress
          </Text>

          {STAGES.map((stage, index) => (
            <Text
              key={stage}
              style={[
                styles.timelineText,
                index <= stageIndex &&
                  styles.finishedStep,
              ]}
            >
              {index <= stageIndex ? '✓' : '○'}{' '}
              {LABELS[stage]}
            </Text>
          ))}

          <Text
            style={[
              styles.timelineText,
              paid && styles.finishedStep,
            ]}
          >
            {paid ? '✓' : '○'} Payment Received
          </Text>

          <Text
            style={[
              styles.timelineText,
              hasFeedback && styles.finishedStep,
            ]}
          >
            {hasFeedback ? '✓' : '○'} Feedback
          </Text>
        </View>
      )}

      {provider && booking.status === 'pending' && (
        <View>
          <TouchableOpacity
            style={[styles.button, busy && styles.disabled]}
            disabled={busy}
            onPress={() =>
              confirmStatus('accepted', 'Accept request')
            }
          >
            <Text style={styles.buttonText}>
              Accept Request
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.outlineButton,
              busy && styles.disabled,
            ]}
            disabled={busy}
            onPress={() =>
              confirmStatus('rejected', 'Reject request')
            }
          >
            <Text style={styles.outlineText}>
              Reject Request
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {provider && nextAction && (
        <TouchableOpacity
          style={[styles.button, busy && styles.disabled]}
          disabled={busy}
          onPress={() =>
            confirmStatus(
              nextAction.status,
              nextAction.label
            )
          }
        >
          <Text style={styles.buttonText}>
            {nextAction.label}
          </Text>
        </TouchableOpacity>
      )}

      {!provider && booking.status === 'pending' && (
        <TouchableOpacity
          style={[
            styles.outlineButton,
            busy && styles.disabled,
          ]}
          disabled={busy}
          onPress={() =>
            confirmStatus('cancelled', 'Cancel request')
          }
        >
          <Text style={styles.outlineText}>
            Cancel Request
          </Text>
        </TouchableOpacity>
      )}

      {provider && completed && !paid && (
        <TouchableOpacity
          style={[styles.button, busy && styles.disabled]}
          disabled={busy}
          onPress={confirmPayment}
        >
          <Text style={styles.buttonText}>
            Confirm Payment Received
          </Text>
        </TouchableOpacity>
      )}

      {!provider && completed && !paid && (
        <Text style={styles.note}>
          Work is completed. Arrange payment with the
          provider using your selected method. The
          provider will confirm receipt here.
        </Text>
      )}

      {hasFeedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.sectionTitle}>
            Farmer Feedback
          </Text>

          <Text style={styles.info}>
            Rating: {booking.feedback_rating}/5
          </Text>

          {!!booking.feedback_text && (
            <Text style={styles.info}>
              {booking.feedback_text}
            </Text>
          )}
        </View>
      )}

      {!provider && completed && paid && !hasFeedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.sectionTitle}>
            Rate Your Experience
          </Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setRating(value)}
                disabled={busy}
                accessibilityLabel={`Rate ${value} stars`}
                accessibilityState={{
                  selected: rating === value,
                }}
                style={styles.starButton}
              >
                <Text style={styles.star}>
                  {rating >= value ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Feedback (optional)"
            placeholderTextColor="#888888"
            value={feedback}
            onChangeText={setFeedback}
            maxLength={2000}
            multiline
            textAlignVertical="top"
            editable={!busy}
          />

          <TouchableOpacity
            style={[
              styles.button,
              busy && styles.disabled,
            ]}
            disabled={busy}
            onPress={submitFeedback}
          >
            <Text style={styles.buttonText}>
              Submit Feedback
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BookingJourneyScreen() {
  const { user } = useAuth();
  const provider = user?.role === 'provider';

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const focused = useRef(false);
  const requestVersion = useRef(0);
  const actionLock = useRef(false);

  const loadBookings = useCallback(async (visible = true) => {
    const version = ++requestVersion.current;

    if (visible && focused.current) {
      setLoading(true);
    }

    try {
      const response = await bookingService.getBookings();

      if (
        !focused.current ||
        version !== requestVersion.current
      ) {
        return;
      }

      if (!Array.isArray(response?.data)) {
        throw new Error('Invalid booking list received.');
      }

      setBookings(response.data);
      setError('');
    } catch (err) {
      if (
        focused.current &&
        version === requestVersion.current
      ) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load bookings.'
        );
      }
    } finally {
      if (
        focused.current &&
        version === requestVersion.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      loadBookings();

      const timer = setInterval(() => {
        if (!actionLock.current) {
          loadBookings(false);
        }
      }, 15000);

      return () => {
        focused.current = false;
        requestVersion.current += 1;
        clearInterval(timer);
      };
    }, [loadBookings])
  );

  const handleAction = async (id, body) => {
    if (actionLock.current || !focused.current) return;

    actionLock.current = true;
    setBusy(true);

    // Ignore older list responses while updating.
    requestVersion.current += 1;

    try {
      const response =
        await bookingService.updateBooking(id, body);

      if (!response?.data?.id) {
        throw new Error(
          'The update response was incomplete. Refresh to check the latest status.'
        );
      }

      if (focused.current) {
        // Merge into the existing row to retain joined
        // equipment and contact fields.
        setBookings((current) =>
          current.map((booking) =>
            booking.id === id
              ? { ...booking, ...response.data }
              : booking
          )
        );

        await loadBookings(false);
      }
    } catch (err) {
      if (focused.current) {
        Alert.alert(
          'Unable to confirm update',
          err.response?.data?.message ||
            err.message ||
            'Refresh to check the latest status.'
        );

        await loadBookings(false);
      }
    } finally {
      actionLock.current = false;

      if (focused.current) {
        setBusy(false);
        setLoading(false);
      }
    }
  };

  const visibleBookings = bookings.filter((booking) => {
    if (filter === 'All') return true;

    if (filter === 'Completed') {
      return booking.status === 'completed';
    }

    if (filter === 'Closed') {
      return ['rejected', 'cancelled'].includes(
        booking.status
      );
    }

    return [
      'pending',
      'accepted',
      'on_the_way',
      'arrived',
      'work_started',
    ].includes(booking.status);
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          {provider ? 'Booking Requests' : 'My Bookings'}
        </Text>

        <Text style={styles.subtitle}>
          Track service progress, payment and feedback.
        </Text>
      </View>

      <View style={styles.filters}>
        {['All', 'Active', 'Completed', 'Closed'].map(
          (item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item &&
                  styles.selectedFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.selectedFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            disabled={busy}
            onPress={() => loadBookings()}
          >
            <Text style={styles.retryText}>
              Refresh Bookings
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {busy && (
        <View style={styles.updating}>
          <ActivityIndicator color="#2E7D32" />
          <Text>Updating booking…</Text>
        </View>
      )}

      <FlatList
        data={visibleBookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BookingItem
            booking={item}
            provider={provider}
            busy={busy}
            onAction={handleAction}
          />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={loading}
        onRefresh={() => {
          if (!actionLock.current) loadBookings();
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading
              ? 'Loading bookings…'
              : error
                ? 'Refresh to load your bookings.'
                : 'No bookings in this section.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  header: {
    padding: 16,
  },
  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: '#2E7D32',
  },
  subtitle: {
    color: '#666666',
    fontSize: 13,
    marginTop: 6,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 4,
  },
  selectedFilter: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  bookingId: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 5,
  },
  equipmentName: {
    color: '#222222',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 4,
  },
  amount: {
    fontSize: 23,
    fontWeight: '800',
    color: '#2E7D32',
    marginVertical: 10,
  },
  statusBox: {
    backgroundColor: '#E8F5E9',
    padding: 11,
    borderRadius: 9,
    marginBottom: 12,
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  closedBox: {
    backgroundColor: '#FFEBEE',
  },
  closedText: {
    color: '#C62828',
  },
  timeline: {
    paddingTop: 14,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 8,
  },
  timelineText: {
    color: '#888888',
    fontSize: 14,
    lineHeight: 27,
  },
  finishedStep: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#C62828',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  outlineText: {
    color: '#C62828',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  note: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },
  feedbackBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  starButton: {
    padding: 7,
  },
  star: {
    fontSize: 31,
    color: '#E6A000',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    minHeight: 85,
    padding: 12,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#B71C1C',
  },
  retryText: {
    color: '#B71C1C',
    fontWeight: '700',
    paddingTop: 10,
  },
  updating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    paddingVertical: 35,
  },
});