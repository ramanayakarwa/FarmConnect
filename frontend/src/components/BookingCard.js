import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/helpers';
import { getEquipmentLocalImage } from '../utils/equipmentImages';

export const BookingCard = ({
  booking,
  onPress,
  showActions,
  onAccept,
  onReject,
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={getEquipmentLocalImage({
          category: booking.equipment_category,
          name: booking.equipment_name,
        })}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {booking.equipment_name}
          </Text>

          <StatusBadge status={booking.status} />
        </View>

        <Text style={styles.farmer}>
          {booking.owner_name || booking.farmer_name}
        </Text>

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>
            📅 {formatDate(booking.start_date)} →{' '}
            {formatDate(booking.end_date)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.amount}>
            ₹{booking.equipment_price || '--'}
          </Text>

          <Text style={styles.payment}>
            {booking.payment_method}
          </Text>
        </View>

        {showActions && booking.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => onAccept(booking.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionText}>
                {t('accept')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => onReject(booking.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: '#F44336' },
                ]}
              >
                {t('reject')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,

    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 120,
  },

  body: {
    padding: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1B1B',
    flex: 1,
  },

  farmer: {
    fontSize: 13,
    color: '#8D6E63',
    marginBottom: 8,
  },

  dateRow: {
    marginBottom: 8,
  },

  dateLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
  },

  payment: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },

  actionText: {
    fontWeight: '700',
    color: '#2E7D32',
    fontSize: 14,
  },
});