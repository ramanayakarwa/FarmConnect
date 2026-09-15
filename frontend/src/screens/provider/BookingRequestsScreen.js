import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import providerService from '../../services/providerService';
import bookingService from '../../services/bookingService';

export default function BookingRequestsScreen() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] =
    useState('pending');

  const [refreshing, setRefreshing] =
    useState(false);

  const loadBookings = async () => {
    try {
      const response =
        await providerService.getProviderBookings();

      console.log(
        'PROVIDER BOOKINGS RESPONSE:',
        response
      );

      setBookings(response?.data || []);
    } catch (error) {
      console.log(
        'GET PROVIDER BOOKINGS ERROR:',
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        t('error'),
        error?.response?.data?.message ||
          error?.message ||
          t('unableLoadBookingRequests')
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('pending');

      case 'accepted':
        return t('accepted');

      case 'rejected':
        return t('rejected');

      case 'completed':
        return t('completed');

      case 'cancelled':
        return t('cancelled');

      default:
        return status;
    }
  };

  const handleStatusUpdate = async (
    bookingId,
    status
  ) => {
    const isAccept = status === 'accepted';

    Alert.alert(
      isAccept
        ? t('acceptBooking')
        : t('rejectBooking'),

      isAccept
        ? t('acceptBookingConfirmation')
        : t('rejectBookingConfirmation'),

      [
        {
          text: t('cancel'),
          style: 'cancel',
        },

        {
          text: isAccept
            ? t('accept')
            : t('reject'),

          style: isAccept
            ? 'default'
            : 'destructive',

          onPress: async () => {
            try {
              await bookingService.updateBookingStatus(
                bookingId,
                status
              );

              setBookings((prev) =>
                prev.map((booking) =>
                  booking.id === bookingId
                    ? {
                        ...booking,
                        status,
                      }
                    : booking
                )
              );

              Alert.alert(
                t('success'),
                isAccept
                  ? t('bookingAcceptedSuccess')
                  : t('bookingRejectedSuccess')
              );
            } catch (error) {
              console.log(
                'UPDATE BOOKING ERROR:',
                error?.response?.data ||
                  error?.message ||
                  error
              );

              Alert.alert(
                t('error'),
                error?.response?.data?.message ||
                  error?.message ||
                  t('couldNotUpdateBooking')
              );
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.status === activeTab
  );

  const renderBooking = ({ item }) => {
    const isPending =
      item.status === 'pending';

    return (
      <View style={styles.card}>
        {item.equipment_image ? (
          <Image
            source={{
              uri: item.equipment_image,
            }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="construct-outline"
              size={35}
              color="#999"
            />
          </View>
        )}

        <View style={styles.content}>
          <Text
            style={styles.equipmentName}
          >
            {item.equipment_name ||
              t('equipment')}
          </Text>

          <Text style={styles.category}>
            {item.equipment_category ||
              t('agriculturalEquipment')}
          </Text>

          {/* FARMER */}
          <View style={styles.row}>
            <Ionicons
              name="person-outline"
              size={17}
              color="#555"
            />

            <Text style={styles.rowText}>
              {item.farmer_name ||
                t('farmer')}
            </Text>
          </View>

          {/* PHONE */}
          {item.farmer_phone ? (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                Alert.alert(
                  t('phone'),
                  item.farmer_phone
                )
              }
            >
              <Ionicons
                name="call-outline"
                size={17}
                color="#2E7D32"
              />

              <Text style={styles.phoneText}>
                {item.farmer_phone}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.row}>
              <Ionicons
                name="call-outline"
                size={17}
                color="#999"
              />

              <Text style={styles.rowText}>
                {t('phoneNotAvailable')}
              </Text>
            </View>
          )}

          {/* DATES */}
          <View style={styles.row}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color="#555"
            />

            <Text style={styles.rowText}>
              {formatDate(item.start_date)} -{' '}
              {formatDate(item.end_date)}
            </Text>
          </View>

          {/* PRICE */}
          <View style={styles.row}>
            <Ionicons
              name="cash-outline"
              size={17}
              color="#2E7D32"
            />

            <Text style={styles.price}>
              ₹{item.total_amount || 0}
            </Text>
          </View>

          {/* STATUS */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'pending'
                    ? '#FFF3E0'
                    : item.status ===
                      'accepted'
                    ? '#E8F5E9'
                    : '#FFEBEE',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'pending'
                      ? '#EF6C00'
                      : item.status ===
                        'accepted'
                      ? '#2E7D32'
                      : '#C62828',
                },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>

          {/* ACTIONS */}
          {isPending && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  handleStatusUpdate(
                    item.id,
                    'rejected'
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={19}
                  color="#C62828"
                />

                <Text style={styles.rejectText}>
                  {t('reject')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  handleStatusUpdate(
                    item.id,
                    'accepted'
                  )
                }
              >
                <Ionicons
                  name="checkmark"
                  size={19}
                  color="#fff"
                />

                <Text style={styles.acceptText}>
                  {t('accept')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('bookingRequests')}
        </Text>

        <Text style={styles.headerSubtitle}>
          {t('requestsForYourEquipment')}
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TabButton
          title={t('pending')}
          value="pending"
          activeTab={activeTab}
          onPress={setActiveTab}
          count={
            bookings.filter(
              (b) => b.status === 'pending'
            ).length
          }
        />

        <TabButton
          title={t('accepted')}
          value="accepted"
          activeTab={activeTab}
          onPress={setActiveTab}
          count={
            bookings.filter(
              (b) => b.status === 'accepted'
            ).length
          }
        />

        <TabButton
          title={t('rejected')}
          value="rejected"
          activeTab={activeTab}
          onPress={setActiveTab}
          count={
            bookings.filter(
              (b) => b.status === 'rejected'
            ).length
          }
        />
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderBooking}
        contentContainerStyle={
          filteredBookings.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="clipboard-outline"
              size={60}
              color="#aaa"
            />

            <Text style={styles.emptyTitle}>
              {t('noBookingRequests')}
            </Text>

            <Text style={styles.emptyText}>
              {t('bookingRequestsWillAppear')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function TabButton({
  title,
  value,
  activeTab,
  onPress,
  count,
}) {
  const active = activeTab === value;

  return (
    <TouchableOpacity
      style={[
        styles.tab,
        active && styles.activeTab,
      ]}
      onPress={() => onPress(value)}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.activeTabText,
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.countBadge,
          active && styles.activeCountBadge,
        ]}
      >
        <Text
          style={[
            styles.countText,
            active && styles.activeCountText,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function formatDate(date) {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleDateString(
      'en-IN'
    );
  } catch {
    return date;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 55,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#E8F5E9',
    fontSize: 13,
    marginTop: 4,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    gap: 7,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  activeTab: {
    backgroundColor: '#E8F5E9',
  },

  tabText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '700',
  },

  activeTabText: {
    color: '#2E7D32',
  },

  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  activeCountBadge: {
    backgroundColor: '#2E7D32',
  },

  countText: {
    fontSize: 10,
    color: '#777',
    fontWeight: '800',
  },

  activeCountText: {
    color: '#fff',
  },

  list: {
    padding: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    paddingLeft: 12,
  },

  equipmentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222',
  },

  category: {
    fontSize: 12,
    color: '#777',
    marginBottom: 7,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 7,
  },

  rowText: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },

  phoneText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '700',
    flex: 1,
  },

  price: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E7D32',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  rejectText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '800',
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  acceptText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyContainer: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 15,
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});