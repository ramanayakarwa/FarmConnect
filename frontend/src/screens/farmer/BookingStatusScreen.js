import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { bookingService } from '../../services/bookingService';
import { BookingCard } from '../../components/BookingCard';

export default function BookingStatusScreen({ navigation }) {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedBooking, setExpandedBooking] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await bookingService.getBookings();

      setBookings(response.data || []);
    } catch (error) {
      console.log('Booking Error:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch every time this screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const getFilteredBookings = () => {
    if (selectedFilter === 'All') return bookings;

    return bookings.filter(
      (b) => b.status === selectedFilter.toLowerCase()
    );
  };

  const filtered = getFilteredBookings();

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending':
        return 1;

      case 'accepted':
        return 2;

      case 'on_the_way':
        return 3;

      case 'completed':
        return 4;

      default:
        return 1;
    }
  };

  const getTimelineLabel = (status) => {
    switch (status) {
      case 'Pending Approval':
        return t('pendingApproval');

      case 'Accepted':
        return t('accepted');

      case 'On The Way':
        return t('onTheWay');

      case 'Completed':
        return t('completed');

      default:
        return status;
    }
  };

  const renderTimeline = (status) => {
    const currentStep = getStatusStep(status);

    const steps = [
      {
        label: 'Pending Approval',
        icon: 'hourglass-outline',
      },
      {
        label: 'Accepted',
        icon: 'checkmark-circle-outline',
      },
      {
        label: 'On The Way',
        icon: 'bicycle-outline',
      },
      {
        label: 'Completed',
        icon: 'gift-outline',
      },
    ];

    return (
      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const stepNum = index + 1;

          const isActive = stepNum <= currentStep;

          const isLast =
            index === steps.length - 1;

          return (
            <View
              key={step.label}
              style={styles.timelineRow}
            >
              <View style={styles.stepIndicatorBlock}>
                <View
                  style={[
                    styles.stepDot,
                    isActive
                      ? styles.stepDotActive
                      : styles.stepDotInactive,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={isActive ? '#fff' : '#666'}
                  />
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      stepNum < currentStep
                        ? styles.stepLineActive
                        : styles.stepLineInactive,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepTextBlock}>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive
                      ? styles.stepLabelActive
                      : styles.stepLabelInactive,
                  ]}
                >
                  {getTimelineLabel(step.label)}
                </Text>

                {stepNum === currentStep && (
                  <Text style={styles.activeStepIndicator}>
                    {t('currentStatus')}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const getFilterLabel = (tab) => {
    switch (tab) {
      case 'All':
        return t('all');

      case 'Pending':
        return t('pending');

      case 'Accepted':
        return t('accepted');

      case 'Completed':
        return t('completed');

      default:
        return tab;
    }
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />

        <Text style={styles.headerTitle}>
          {t('myBookings')}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {['All', 'Pending', 'Accepted', 'Completed'].map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  selectedFilter === tab &&
                    styles.filterTabActive,
                ]}
                onPress={() =>
                  setSelectedFilter(tab)
                }
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === tab &&
                      styles.filterTabTextActive,
                  ]}
                >
                  {getFilterLabel(tab)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>
    </View>
  );

  if (loading && bookings.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {renderHeader()}

        <View style={styles.empty}>
          <ActivityIndicator
            size="large"
            color="#2E7D32"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) =>
          item.id.toString()
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color="#8D6E63"
            />

            <Text style={styles.emptyText}>
              {t('noBookingsForFilter')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.bookingItem}>
            <BookingCard
              booking={item}
              onPress={() =>
                setExpandedBooking(
                  expandedBooking === item.id
                    ? null
                    : item.id
                )
              }
            />

            {expandedBooking === item.id && (
              <View style={styles.expandedContent}>
                <Text style={styles.expandedTitle}>
                  {t('bookingJourney')}
                </Text>

                {renderTimeline(item.status)}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
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

  filtersWrapper: {
    paddingVertical: 10,

    backgroundColor: '#fff',

    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  filters: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,

    borderRadius: 20,

    backgroundColor: '#F5F5DC',

    borderWidth: 1,
    borderColor: '#2E7D32',
  },

  filterTabActive: {
    backgroundColor: '#2E7D32',
  },

  filterTabText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 13,
  },

  filterTabTextActive: {
    color: '#fff',
  },

  list: {
    paddingBottom: 60,
  },

  bookingItem: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  expandedContent: {
    backgroundColor: '#fff',

    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,

    padding: 16,

    marginTop: -14,
    marginBottom: 14,

    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E0E0E0',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 4,

    elevation: 2,
  },

  expandedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8D6E63',
    marginBottom: 14,
  },

  timeline: {
    paddingLeft: 10,
  },

  timelineRow: {
    flexDirection: 'row',
    minHeight: 60,
  },

  stepIndicatorBlock: {
    alignItems: 'center',
    marginRight: 14,
  },

  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 10,
  },

  stepDotActive: {
    backgroundColor: '#2E7D32',
  },

  stepDotInactive: {
    backgroundColor: '#E0E0E0',

    borderWidth: 1,
    borderColor: '#BDBDBD',
  },

  stepLine: {
    width: 3,
    flex: 1,

    marginVertical: -2,

    zIndex: 1,
  },

  stepLineActive: {
    backgroundColor: '#2E7D32',
  },

  stepLineInactive: {
    backgroundColor: '#E0E0E0',
  },

  stepTextBlock: {
    flex: 1,

    justifyContent: 'center',

    paddingBottom: 16,
  },

  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  stepLabelActive: {
    color: '#2E7D32',
  },

  stepLabelInactive: {
    color: '#777',
  },

  activeStepIndicator: {
    fontSize: 10,
    fontWeight: '800',

    color: '#E65100',

    marginTop: 2,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingTop: 60,

    gap: 10,
  },

  emptyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 