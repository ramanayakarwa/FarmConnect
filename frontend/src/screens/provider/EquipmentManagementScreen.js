import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import providerService from '../../services/providerService';
import equipmentService from '../../services/equipmentService';

export default function EquipmentManagementScreen({
  navigation,
}) {
  const { t } = useTranslation();

  const [myEquipment, setMyEquipment] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);

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

      default:
        return category || t('agriculturalEquipment');
    }
  };

  const loadEquipment = async () => {
    try {
      const response =
        await providerService.getProviderEquipment();

      console.log(
        'MY EQUIPMENT RESPONSE:',
        response
      );

      setMyEquipment(response?.data || []);
    } catch (error) {
      console.log(
        'GET PROVIDER EQUIPMENT ERROR:',
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        t('error'),
        error?.response?.data?.message ||
          error?.message ||
          t('unableLoadEquipment')
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEquipment();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEquipment();
    setRefreshing(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      t('deleteEquipment'),
      `${t('deleteConfirmation')} "${name}"?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',

          onPress: async () => {
            try {
              await equipmentService.deleteEquipment(
                id
              );

              setMyEquipment((prev) =>
                prev.filter(
                  (item) => item.id !== id
                )
              );

              Alert.alert(
                t('success'),
                t('equipmentDeletedSuccess')
              );
            } catch (error) {
              console.log(
                'DELETE EQUIPMENT ERROR:',
                error?.response?.data ||
                  error?.message ||
                  error
              );

              Alert.alert(
                t('error'),
                error?.response?.data?.message ||
                  error?.message ||
                  t('couldNotDeleteEquipment')
              );
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (item) => {
    const currentValue =
      item.availability === true;

    try {
      setMyEquipment((prev) =>
        prev.map((equipment) =>
          equipment.id === item.id
            ? {
                ...equipment,
                availability: !currentValue,
              }
            : equipment
        )
      );

      await equipmentService.updateEquipment(
        item.id,
        {
          availability: !currentValue,
        }
      );
    } catch (error) {
      setMyEquipment((prev) =>
        prev.map((equipment) =>
          equipment.id === item.id
            ? {
                ...equipment,
                availability: currentValue,
              }
            : equipment
        )
      );

      console.log(
        'UPDATE AVAILABILITY ERROR:',
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        t('error'),
        error?.response?.data?.message ||
          error?.message ||
          t('couldNotUpdateAvailability')
      );
    }
  };

  const renderEquipment = ({ item }) => {
    const available =
      item.availability === true;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
        />

        <View style={styles.info}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.category}>
            {getCategoryLabel(item.category)}
          </Text>

          <Text style={styles.location}>
            📍{' '}
            {item.location ||
              t('locationNotSpecified')}
          </Text>

          <Text style={styles.price}>
            ₹{item.price} / {t('day')}
          </Text>

          <View style={styles.availabilityRow}>
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
              {available
                ? t('available')
                : t('unavailable')}
            </Text>

            <Switch
              value={available}
              onValueChange={() =>
                toggleAvailability(item)
              }
              trackColor={{
                false: '#ddd',
                true: '#A5D6A7',
              }}
              thumbColor={
                available
                  ? '#2E7D32'
                  : '#f4f3f4'
              }
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation
                .getParent()
                ?.navigate('AddEquipment', {
                  mode: 'edit',
                  equipment: item,
                })
            }
          >
            <Ionicons
              name="create-outline"
              size={21}
              color="#2E7D32"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDelete(
                item.id,
                item.name
              )
            }
          >
            <Ionicons
              name="trash-outline"
              size={21}
              color="#C62828"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {t('myEquipment')}
          </Text>

          <Text style={styles.headerSubtitle}>
            {t('manageAgriculturalMachines')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation
              .getParent()
              ?.navigate('AddEquipment', {
                mode: 'add',
              })
          }
        >
          <Ionicons
            name="add"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={myEquipment}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderEquipment}
        contentContainerStyle={
          myEquipment.length === 0
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
              name="construct-outline"
              size={60}
              color="#aaa"
            />

            <Text style={styles.emptyTitle}>
              {t('noEquipmentAdded')}
            </Text>

            <Text style={styles.emptyText}>
              {t('addEquipmentSoFarmersCan')}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate(
                    'AddEquipment',
                    {
                      mode: 'add',
                    }
                  )
              }
            >
              <Ionicons
                name="add"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.emptyButtonText
                }
              >
                {t('addEquipment')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    padding: 15,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  image: {
    width: 110,
    height: 130,
    borderRadius: 12,
    backgroundColor: '#eee',
  },

  info: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 5,
  },

  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222',
  },

  category: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  location: {
    fontSize: 13,
    color: '#555',
    marginTop: 7,
  },

  price: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '800',
    marginTop: 6,
  },

  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: '800',
  },

  actions: {
    justifyContent: 'space-between',
    paddingVertical: 3,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 20,
    marginTop: 8,
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
});