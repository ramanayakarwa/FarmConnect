import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const LOCAL_IMAGES = {
  Tractor: require('../../assets/tractor.jpeg'),
  Rotavator: require('../../assets/rotavator.jpeg'),
  'Seed Drill': require('../../assets/seed_drill.jpeg'),
  'Boom Sprayer': require('../../assets/boom_sprayer.jpeg'),
};

export const EquipmentCard = ({
  equipment,
  onPress,
}) => {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    typeof equipment?.image === 'string'
      ? equipment.image.trim()
      : '';

  useEffect(() => {
    setImageFailed(false);
  }, [equipment?.id, imageUrl]);

  if (!equipment) return null;

  const available = equipment.availability === true;

  const pricingType = equipment.pricing_type;

  const validPricingType =
    pricingType === 'per_acre' ||
    pricingType === 'per_day';

  const price = Number(equipment.price);

  const validPrice =
    Number.isFinite(price) && price > 0;

  const canOpen =
    available && validPricingType && validPrice;

  const categoryLabels = {
    Tractor: t('tractor', {
      defaultValue: 'Tractor',
    }),
    Rotavator: t('rotavator', {
      defaultValue: 'Rotavator',
    }),
    'Seed Drill': t('seedDrill', {
      defaultValue: 'Seed Drill',
    }),
    'Boom Sprayer': t('boomSprayer', {
      defaultValue: 'Boom Sprayer',
    }),
  };

  const categoryLabel =
    categoryLabels[equipment.category] ||
    equipment.category ||
    'Equipment';

  const unitLabel =
    pricingType === 'per_acre'
      ? 'acre'
      : pricingType === 'per_day'
        ? 'day'
        : '';

  const formattedPrice = validPrice
    ? price.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : '';

  // Prefer the equipment's own image when a full URL
  // is available. Fall back to its category image.
  const remoteImage =
    /^https?:\/\//i.test(imageUrl) && !imageFailed;

  const imageSource = remoteImage
    ? { uri: imageUrl }
    : LOCAL_IMAGES[equipment.category];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !available && styles.unavailableCard,
      ]}
      onPress={onPress}
      disabled={!canOpen}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: !canOpen }}
      accessibilityLabel={
        `${equipment.name}. ` +
        (validPrice && validPricingType
          ? `₹${formattedPrice} per ${unitLabel}. `
          : 'Price unavailable. ') +
        (available ? 'Available.' : 'Not available.')
      }
    >
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="construct-outline"
              size={48}
              color="#2E7D32"
            />

            <Text style={styles.placeholderText}>
              {categoryLabel}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.availabilityBadge,
            available
              ? styles.availableBadge
              : styles.unavailableBadge,
          ]}
        >
          <Ionicons
            name={
              available
                ? 'checkmark-circle'
                : 'close-circle'
            }
            size={15}
            color={available ? '#2E7D32' : '#C62828'}
          />

          <Text
            style={[
              styles.availabilityText,
              {
                color: available
                  ? '#2E7D32'
                  : '#C62828',
              },
            ]}
          >
            {available ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.category}>
          {categoryLabel}
        </Text>

        <Text style={styles.name}>
          {equipment.name}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color="#777777"
          />

          <Text style={styles.infoText}>
            {equipment.location || 'Location not provided'}
          </Text>
        </View>

        {!!equipment.owner_name && (
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color="#777777"
            />

            <Text style={styles.infoText}>
              {equipment.owner_name}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            {validPrice && validPricingType ? (
              <>
                <Text style={styles.price}>
                  ₹{formattedPrice}
                  <Text style={styles.priceUnit}>
                    {' '}/ {unitLabel}
                  </Text>
                </Text>

                <Text style={styles.pricingHint}>
                  {pricingType === 'per_acre'
                    ? 'Charged by acreage'
                    : 'Charged by booking days'}
                </Text>
              </>
            ) : (
              <Text style={styles.invalidPrice}>
                Price not configured
              </Text>
            )}
          </View>

          <View
            style={[
              styles.detailsButton,
              !canOpen && styles.disabledButton,
            ]}
          >
            <Text style={styles.detailsText}>
              {!available
                ? 'Unavailable'
                : canOpen
                  ? 'View Details'
                  : 'Unavailable'}
            </Text>

            {canOpen && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#FFFFFF"
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  unavailableCard: {
    opacity: 0.65,
  },

  imageContainer: {
    height: 175,
    backgroundColor: '#E8F5E9',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  placeholderText: {
    marginTop: 10,
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },

  availableBadge: {
    backgroundColor: '#E8F5E9',
  },

  unavailableBadge: {
    backgroundColor: '#FFEBEE',
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: '700',
  },

  body: {
    padding: 16,
  },

  category: {
    color: '#8D6E63',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },

  name: {
    color: '#1B1B1B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  infoText: {
    flex: 1,
    color: '#666666',
    fontSize: 13,
    lineHeight: 19,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    marginTop: 8,
  },

  priceBlock: {
    flexShrink: 1,
  },

  price: {
    fontSize: 21,
    fontWeight: '800',
    color: '#2E7D32',
  },

  priceUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },

  pricingHint: {
    marginTop: 4,
    fontSize: 11,
    color: '#777777',
  },

  invalidPrice: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },

  disabledButton: {
    backgroundColor: '#888888',
  },

  detailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});