import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const EquipmentCard = ({ equipment, onPress }) => {
  const { t } = useTranslation();

  if (!equipment) return null;

  const getLocalImage = () => {
    switch (equipment.category) {
      case 'Tractor':
        return require('../../assets/tractor.jpeg');

      case 'Rotavator':
        return require('../../assets/rotavator.jpeg');

      case 'Seed Drill':
        return require('../../assets/seed_drill.jpeg');

      case 'Boom Sprayer':
        return require('../../assets/boom_sprayer.jpeg');

      default:
        return require('../../assets/tractor.jpeg');
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'Tractor':
        return t('tractor');

      case 'Rotavator':
        return t('rotavator');

      case 'Seed Drill':
        return t('seedDrill');

      case 'Boom Sprayer':
        return t('boomSprayer');

      case 'All':
        return t('all');

      default:
        return category;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <Image
        source={getLocalImage()}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Availability Badge */}
      <View style={styles.availBadge}>
        <View
          style={[
            styles.availDot,
            {
              backgroundColor: equipment.availability
                ? '#4CAF50'
                : '#F44336',
            },
          ]}
        />

        <Text
          style={[
            styles.availText,
            {
              color: equipment.availability
                ? '#4CAF50'
                : '#F44336',
            },
          ]}
        >
          {equipment.availability
            ? t('available')
            : t('booked')}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Name + Rating */}
        <View style={styles.row}>
          <Text style={styles.name}>
            {equipment.name}
          </Text>

          <View style={styles.ratingBadge}>
            <Ionicons
              name="star"
              size={12}
              color="#FFC107"
            />

            <Text style={styles.ratingText}>
              {equipment.rating}
            </Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.categoryRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryLabel(equipment.category)}
            </Text>
          </View>
        </View>

        {/* Location + Distance */}
        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#8D6E63"
          />

          <Text style={styles.location}>
            {equipment.location}
          </Text>

          <Text style={styles.distance}>
            {equipment.distance}
          </Text>
        </View>

        {/* Price + Details */}
        <View style={styles.footer}>
          <Text style={styles.price}>
            ₹{equipment.price}
            <Text style={styles.perDay}>
              /{t('day')}
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {t('viewDetails')}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color="#fff"
              style={styles.btnIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,

    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 160,
  },

  availBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  availText: {
    fontSize: 11,
    fontWeight: '700',
  },

  body: {
    padding: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B1B1B',
    flex: 1,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 3,
  },

  categoryRow: {
    marginBottom: 8,
  },

  categoryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  categoryText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  location: {
    fontSize: 13,
    color: '#8D6E63',
    marginLeft: 4,
    flex: 1,
  },

  distance: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },

  perDay: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666',
  },

  btn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  btnIcon: {
    marginLeft: 6,
  },
});