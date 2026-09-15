import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useTranslation } from 'react-i18next';
import {
  getStatusColor,
  getStatusLabel,
} from '../utils/helpers';

export const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getTranslatedStatus = () => {
    switch (status) {
      case 'pending':
        return t('pending');

      case 'accepted':
        return t('accepted');

      case 'rejected':
        return t('rejected');

      case 'on_the_way':
        return t('onTheWay');

      case 'completed':
        return t('completed');

      case 'cancelled':
        return t('cancelled');

      default:
        return getStatusLabel(status);
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColor + '20',
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: statusColor,
          },
        ]}
      />

      <Text
        style={[
          styles.text,
          {
            color: statusColor,
          },
        ]}
      >
        {getTranslatedStatus()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});