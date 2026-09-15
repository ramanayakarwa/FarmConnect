import React from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { formatPrice } from '../../utils/helpers';
import { getEquipmentLocalImage } from '../../utils/equipmentImages';

const { width } = Dimensions.get('window');

export default function EquipmentDetailScreen({ route, navigation }) {
  const { t } = useTranslation();

  const equipment = route?.params?.equipment;

  if (!equipment) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>{t('noEquipmentReceived')}</Text>
      </View>
    );
  }

  const equipmentData = {
    ...equipment,
    ownerName: equipment.owner_name,
    ownerPhone: equipment.owner_phone,
  };

  const handleContactOwner = () => {
    Alert.alert(
      t('contactOwner'),
      `${t('ownerName')}: ${equipmentData.ownerName}\n${t(
        'phoneNumber'
      )}: ${equipmentData.ownerPhone}`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('call'),
          onPress: () =>
            Alert.alert(
              t('simulatingCall'),
              t('callingOwner')
            ),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= TOP IMAGE ================= */}

        <View style={styles.imageContainer}>
          <Image
            source={getEquipmentLocalImage(equipmentData)}
            style={styles.image}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1B1B1B"
            />
          </TouchableOpacity>

          <View
            style={[
              styles.availBadge,
              {
                backgroundColor: equipmentData.availability
                  ? '#E8F5E9'
                  : '#FFEBEE',
              },
            ]}
          >
            <View
              style={[
                styles.availDot,
                {
                  backgroundColor:
                    equipmentData.availability
                      ? '#4CAF50'
                      : '#F44336',
                },
              ]}
            />

            <Text
              style={[
                styles.availText,
                {
                  color: equipmentData.availability
                    ? '#2E7D32'
                    : '#F44336',
                },
              ]}
            >
              {equipmentData.availability
                ? t('available')
                : t('booked')}
            </Text>
          </View>
        </View>

        {/* ================= CONTENT ================= */}

        <View style={styles.body}>
          {/* ================= HEADER ================= */}

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>
                {equipmentData.name}
              </Text>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {equipmentData.category}
                </Text>
              </View>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={14}
                color="#FFC107"
              />

              <Text style={styles.ratingText}>
                {equipmentData.rating || '4.5'}
              </Text>
            </View>
          </View>

          {/* ================= PRICE ================= */}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(equipmentData.price)}
            </Text>

            <View style={styles.distRow}>
              <Ionicons
                name="navigate-circle-outline"
                size={16}
                color="#8D6E63"
              />

              <Text style={styles.distanceText}>
                {equipmentData.distance ||
                  t('nearby')}
              </Text>
            </View>
          </View>

          {/* ================= LOCATION ================= */}

          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={16}
              color="#2E7D32"
            />

            <Text style={styles.locationText}>
              {equipmentData.location}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* ================= ABOUT ================= */}

          <Text style={styles.sectionTitle}>
            {t('aboutEquipment')}
          </Text>

          <Text style={styles.description}>
            {equipmentData.description ||
              t('defaultEquipmentDescription')}
          </Text>

          <View style={styles.divider} />

          {/* ================= SPECIFICATIONS ================= */}

          <Text style={styles.sectionTitle}>
            {t('specifications')}
          </Text>

          <View style={styles.specsGrid}>
            {equipmentData.specifications ? (
              Object.entries(
                equipmentData.specifications
              ).map(([key, value]) => (
                <View
                  key={key}
                  style={styles.specCard}
                >
                  <Text style={styles.specKey}>
                    {key.toUpperCase()}
                  </Text>

                  <Text style={styles.specVal}>
                    {value}
                  </Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.specCard}>
                  <Text style={styles.specKey}>
                    {t('condition').toUpperCase()}
                  </Text>

                  <Text style={styles.specVal}>
                    {t('excellent')}
                  </Text>
                </View>

                <View style={styles.specCard}>
                  <Text style={styles.specKey}>
                    {t('year').toUpperCase()}
                  </Text>

                  <Text style={styles.specVal}>
                    2022
                  </Text>
                </View>

                <View style={styles.specCard}>
                  <Text style={styles.specKey}>
                    {t('power').toUpperCase()}
                  </Text>

                  <Text style={styles.specVal}>
                    {t('standard')}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.divider} />

          {/* ================= OWNER ================= */}

          <Text style={styles.sectionTitle}>
            {t('equipmentOwner')}
          </Text>

          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.avatarText}>
                {equipmentData.ownerName
                  ? equipmentData.ownerName[0]
                  : 'O'}
              </Text>
            </View>

            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>
                {equipmentData.ownerName}
              </Text>

              <Text style={styles.ownerRole}>
                {t('verifiedProvider')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.contactIconBtn}
              onPress={handleContactOwner}
            >
              <Ionicons
                name="call"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ================= FOOTER ================= */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={handleContactOwner}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#2E7D32"
          />

          <Text style={styles.contactBtnText}>
            {t('contactOwner')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bookBtn,
            !equipmentData.availability &&
              styles.bookBtnDisabled,
          ]}
          disabled={!equipmentData.availability}
          onPress={() =>
            navigation.navigate('Booking', {
              equipment: equipmentData,
            })
          }
        >
          <Text style={styles.bookBtnText}>
            {equipmentData.availability
              ? t('bookNow')
              : t('currentlyBooked')}
          </Text>

          {equipmentData.availability && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  scroll: {
    paddingBottom: 100,
  },

  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,

    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor:
      'rgba(255, 255, 255, 0.9)',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 5,
  },

  availBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 16,

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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  availText: {
    fontSize: 13,
    fontWeight: '700',
  },

  body: {
    padding: 20,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    backgroundColor: '#F5F5DC',

    marginTop: -20,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',

    marginBottom: 12,
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 6,
  },

  categoryBadge: {
    backgroundColor: '#E8F5E9',

    paddingHorizontal: 10,
    paddingVertical: 4,

    borderRadius: 8,

    alignSelf: 'flex-start',
  },

  categoryText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFF8E1',

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 10,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 4,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 10,
  },

  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2E7D32',
  },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  distanceText: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '600',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,

    marginBottom: 10,
  },

  locationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  divider: {
    height: 1.5,
    backgroundColor: '#E0E0E0',
    marginVertical: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },

  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },

  specCard: {
    width: (width - 50) / 2,

    backgroundColor: '#fff',

    borderRadius: 12,

    padding: 12,

    borderWidth: 1,
    borderColor: '#E0E0E0',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.05,
    shadowRadius: 3,

    elevation: 1,
  },

  specKey: {
    fontSize: 11,
    color: '#8D6E63',
    fontWeight: '700',
    marginBottom: 4,
  },

  specVal: {
    fontSize: 14,
    color: '#1B1B1B',
    fontWeight: '600',
  },

  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#fff',

    borderRadius: 16,

    padding: 14,

    borderWidth: 1,
    borderColor: '#E0E0E0',

    marginTop: 4,
  },

  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: '#8D6E63',

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B1B1B',
  },

  ownerRole: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '500',
  },

  contactIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: '#2E7D32',

    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: '#fff',

    padding: 16,

    flexDirection: 'row',
    gap: 12,

    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 10,
  },

  contactBtn: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderWidth: 2,
    borderColor: '#2E7D32',

    borderRadius: 14,

    paddingVertical: 14,
  },

  contactBtnText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 15,
  },

  bookBtn: {
    flex: 1.3,

    backgroundColor: '#2E7D32',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    borderRadius: 14,

    paddingVertical: 14,

    shadowColor: '#2E7D32',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,
    shadowRadius: 6,

    elevation: 4,
  },

  bookBtnDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
  },

  bookBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});