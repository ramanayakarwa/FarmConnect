import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import equipmentService from '../../services/equipmentService';

const LOCAL_IMAGES = {
  Tractor: require('../../../assets/tractor.jpeg'),
  Rotavator: require('../../../assets/rotavator.jpeg'),
  'Seed Drill': require('../../../assets/seed_drill.jpeg'),
  'Boom Sprayer': require('../../../assets/boom_sprayer.jpeg'),
};
export default function EquipmentDetailScreen({
  route,
  navigation,
}) {
  const initialEquipment = route?.params?.equipment;
  const equipmentId = initialEquipment?.id;

  const [equipment, setEquipment] =
    useState(initialEquipment || null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const requestVersion = useRef(0);
  const bookingLock = useRef(false);

  const imageUrl =
    typeof equipment?.image === 'string'
      ? equipment.image.trim()
      : '';

  useEffect(() => {
    setImageFailed(false);
  }, [equipment?.id, imageUrl]);

  const loadEquipment = useCallback(async () => {
    const version = ++requestVersion.current;

    setLoading(true);
    setError('');

    try {
      if (!equipmentId) {
        throw new Error('Equipment details are missing.');
      }

      const response =
        await equipmentService.getEquipmentById(
          equipmentId
        );

      if (version !== requestVersion.current) return;

      if (!response?.data?.id) {
        throw new Error('Equipment could not be loaded.');
      }

      setEquipment(response.data);
    } catch (err) {
      if (version !== requestVersion.current) return;

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to load equipment.'
      );
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [equipmentId]);

  useFocusEffect(
    useCallback(() => {
      bookingLock.current = false;
      setChecking(false);
      loadEquipment();

      return () => {
        requestVersion.current += 1;
      };
    }, [loadEquipment])
  );

  const handleBooking = async () => {
    if (
      bookingLock.current ||
      loading ||
      error ||
      !equipmentId
    ) {
      return;
    }

    bookingLock.current = true;
    setChecking(true);

    const version = ++requestVersion.current;

    try {
      const response =
        await equipmentService.getEquipmentById(
          equipmentId
        );

      if (version !== requestVersion.current) return;

      const latest = response?.data;

      if (!latest?.id) {
        throw new Error('Equipment could not be loaded.');
      }

      setEquipment(latest);

      if (latest.availability !== true) {
        Alert.alert(
          'Not available',
          'The provider has made this equipment unavailable.'
        );
        return;
      }

      const rate = Number(latest.price);

      if (
        !Number.isFinite(rate) ||
        rate <= 0 ||
        !['per_acre', 'per_day'].includes(
          latest.pricing_type
        )
      ) {
        Alert.alert(
          'Price unavailable',
          'The provider needs to configure a valid rental rate.'
        );
        return;
      }

      // Pass the freshly fetched rate and availability.
      navigation.navigate('Booking', {
        equipment: latest,
      });
    } catch (err) {
      if (version !== requestVersion.current) return;

      Alert.alert(
        'Unable to continue',
        err.response?.data?.message ||
          err.message ||
          'Please try again.'
      );
    } finally {
      if (version === requestVersion.current) {
        bookingLock.current = false;
        setChecking(false);
      }
    }
  };

  const handleCall = async () => {
    const phone = String(
      equipment?.owner_phone || ''
    ).trim();

    if (!phone) {
      Alert.alert(
        'Contact unavailable',
        'The provider has not supplied a phone number.'
      );
      return;
    }

    const dialNumber = phone.replace(/[^\d+]/g, '');

    if (!/\d/.test(dialNumber)) {
      Alert.alert(
        'Invalid number',
        'The provider’s phone number is not valid.'
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      Alert.alert(
        'Contact provider',
        `Please call ${phone}.`
      );
    }
  };

  const available = equipment?.availability === true;
  const rate = Number(equipment?.price);

  const validPricing =
    Number.isFinite(rate) &&
    rate > 0 &&
    ['per_acre', 'per_day'].includes(
      equipment?.pricing_type
    );

  const perAcre =
    equipment?.pricing_type === 'per_acre';

  const canBook =
    available &&
    validPricing &&
    !loading &&
    !checking &&
    !error;

  const imageSource =
    /^https?:\/\//i.test(imageUrl) && !imageFailed
      ? { uri: imageUrl }
      : LOCAL_IMAGES[equipment?.category];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#222222"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Equipment Details
        </Text>

        <TouchableOpacity
          onPress={loadEquipment}
          disabled={loading || checking}
          style={styles.iconButton}
          accessibilityLabel="Refresh equipment"
        >
          <Ionicons
            name="refresh-outline"
            size={23}
            color="#2E7D32"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#2E7D32" />
            <Text>Checking current details…</Text>
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Text style={styles.errorText}>
              Refresh to verify availability before booking.
            </Text>
          </View>
        )}

        {equipment && (
          <>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons
                  name="construct-outline"
                  size={60}
                  color="#2E7D32"
                />
                <Text style={styles.placeholderText}>
                  {equipment.category || 'Equipment'}
                </Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.category}>
                {equipment.category}
              </Text>

              <Text style={styles.name}>
                {equipment.name}
              </Text>

              <Text
                style={[
                  styles.availability,
                  {
                    color: available
                      ? '#2E7D32'
                      : '#C62828',
                  },
                ]}
              >
                {loading
                  ? 'Checking availability…'
                  : error
                    ? 'Availability not verified'
                    : available
                      ? 'Available'
                      : 'Not Available'}
              </Text>

              <Text style={styles.price}>
                {validPricing
                  ? `₹${rate.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })} / ${perAcre ? 'acre' : 'day'}`
                  : 'Price not configured'}
              </Text>

              {validPricing && (
                <Text style={styles.bodyText}>
                  {perAcre
                    ? 'Your total is the rental rate multiplied by the number of acres.'
                    : 'Your total is the rental rate multiplied by the number of booking days. Start and end dates are both included.'}
                </Text>
              )}

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#777777"
                />
                <Text style={styles.locationText}>
                  {equipment.location ||
                    'Location not provided'}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Description
              </Text>

              <Text style={styles.bodyText}>
                {equipment.description ||
                  'No description provided.'}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Equipment Provider
              </Text>

              <Text style={styles.providerName}>
                {equipment.owner_name ||
                  'Provider name unavailable'}
              </Text>

              <Text style={styles.bodyText}>
                {equipment.owner_phone ||
                  'Phone number not provided'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.contactButton,
                  !equipment.owner_phone &&
                    styles.disabled,
                ]}
                onPress={handleCall}
                disabled={!equipment.owner_phone}
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color="#2E7D32"
                />
                <Text style={styles.contactText}>
                  Call Provider
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            !canBook && styles.disabled,
          ]}
          disabled={!canBook}
          onPress={handleBooking}
        >
          {checking || loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookText}>
              {error
                ? 'Refresh Details to Continue'
                : !available
                  ? 'Not Available'
                  : !validPricing
                    ? 'Price Not Configured'
                    : 'Continue to Booking'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },

  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    color: '#222222',
  },

  content: {
    padding: 16,
    paddingBottom: 24,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  errorBox: {
    padding: 14,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    marginBottom: 14,
  },

  errorText: {
    color: '#B71C1C',
    lineHeight: 21,
  },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },

  placeholder: {
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  placeholderText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 18,
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  category: {
    color: '#8D6E63',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },

  name: {
    fontSize: 23,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  availability: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },

  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
  },

  bodyText: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 22,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },

  locationText: {
    flex: 1,
    color: '#666666',
    fontSize: 14,
  },

  sectionTitle: {
    color: '#222222',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  providerName: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
  },

  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    marginTop: 14,
  },

  contactText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 15,
  },

  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  bookButton: {
    backgroundColor: '#2E7D32',
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  bookText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  disabled: {
    opacity: 0.5,
  },
});