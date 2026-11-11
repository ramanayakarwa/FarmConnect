import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import providerService from '../../services/providerService';
import equipmentService from '../../services/equipmentService';

const formatRate = (equipment) => {
  const price = Number(equipment.price);

  const unit =
    equipment.pricing_type === 'per_acre'
      ? 'acre'
      : equipment.pricing_type === 'per_day'
        ? 'day'
        : null;

  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !unit
  ) {
    return 'Price not configured';
  }

  return `₹${price.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })} / ${unit}`;
};

export default function EquipmentManagementScreen({
  navigation,
}) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const focused = useRef(false);
  const requestVersion = useRef(0);
  const actionLock = useRef(false);

  const loadEquipment = useCallback(async () => {
    const version = ++requestVersion.current;

    if (focused.current) {
      setLoading(true);
    }

    try {
      const response =
        await providerService.getProviderEquipment();

      if (
        !focused.current ||
        version !== requestVersion.current
      ) {
        return;
      }

      if (!Array.isArray(response?.data)) {
        throw new Error(
          'Invalid equipment list received.'
        );
      }

      setEquipment(response.data);
      setError('');
    } catch (err) {
      if (
        focused.current &&
        version === requestVersion.current
      ) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load equipment.'
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
      loadEquipment();

      return () => {
        focused.current = false;
        requestVersion.current += 1;
      };
    }, [loadEquipment])
  );

  const openAddEquipment = () => {
    if (actionLock.current) return;

    navigation.navigate('AddEquipment', {
      mode: 'add',
    });
  };

  const openEditEquipment = (item) => {
    if (actionLock.current) return;

    navigation.navigate('AddEquipment', {
      mode: 'edit',
      equipment: item,
    });
  };

  const changeAvailability = async (item, value) => {
    if (
      actionLock.current ||
      loading ||
      !focused.current
    ) {
      return;
    }

    actionLock.current = true;

    // Ignore any earlier list request.
    requestVersion.current += 1;

    setSavingId(item.id);
    setError('');

    try {
      const response =
        await equipmentService.updateEquipment(
          item.id,
          { availability: value }
        );

      const updated = response?.data;

      if (
        !updated?.id ||
        typeof updated.availability !== 'boolean'
      ) {
        throw new Error(
          'The update response was incomplete. Refresh to verify availability.'
        );
      }

      if (focused.current) {
        // Preserve booking counts while merging the
        // equipment fields returned by the server.
        setEquipment((current) =>
          current.map((row) =>
            row.id === item.id
              ? { ...row, ...updated }
              : row
          )
        );
      }
    } catch (err) {
      if (focused.current) {
        Alert.alert(
          'Could not confirm availability',
          err.response?.data?.message ||
            err.message ||
            'Refresh and try again.'
        );

        // The server may have saved a change even if
        // its response was lost. Fetch the actual value.
        await loadEquipment();
      }
    } finally {
      actionLock.current = false;
      setSavingId(null);
    }
  };

  const renderEquipment = ({ item }) => {
    const available = item.availability === true;
    const savingThisItem = savingId === item.id;
    const controlsDisabled =
      loading || savingId !== null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <View style={styles.equipmentIcon}>
            <Ionicons
              name="construct-outline"
              size={26}
              color="#2E7D32"
            />
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text style={styles.category}>
              {item.category || 'Equipment'}
            </Text>
          </View>
        </View>

        <Text style={styles.rate}>
          {formatRate(item)}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#777777"
          />

          <Text style={styles.location}>
            {item.location || 'Location not provided'}
          </Text>
        </View>

        <View style={styles.statistics}>
          <Text style={styles.statText}>
            Total bookings: {item.total_bookings ?? 0}
          </Text>

          <Text style={styles.statText}>
            Active bookings: {item.active_bookings ?? 0}
          </Text>
        </View>

        <View style={styles.availabilityRow}>
          <View style={styles.availabilityDetails}>
            <Text style={styles.label}>
              Available for new bookings
            </Text>

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
              {available ? 'ON — Available' : 'OFF — Unavailable'}
            </Text>
          </View>

          {savingThisItem && (
            <ActivityIndicator
              size="small"
              color="#2E7D32"
            />
          )}

          <Switch
            value={available}
            onValueChange={(value) =>
              changeAvailability(item, value)
            }
            disabled={controlsDisabled}
            trackColor={{
              false: '#CCCCCC',
              true: '#A5D6A7',
            }}
            thumbColor={
              available ? '#2E7D32' : '#F4F4F4'
            }
            accessibilityLabel={
              `Availability for ${item.name}`
            }
          />
        </View>

        <Text style={styles.note}>
          Switching OFF stops new bookings. Existing
          bookings remain in Booking Requests.
        </Text>

        <TouchableOpacity
          style={[
            styles.editButton,
            controlsDisabled && styles.disabled,
          ]}
          onPress={() => openEditEquipment(item)}
          disabled={controlsDisabled}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color="#2E7D32"
          />

          <Text style={styles.editText}>
            Edit Equipment
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          My Equipment
        </Text>

        <Text style={styles.subtitle}>
          Manage rental rates and availability.
        </Text>

        <TouchableOpacity
          style={[
            styles.addButton,
            savingId !== null && styles.disabled,
          ]}
          onPress={openAddEquipment}
          disabled={savingId !== null}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.addText}>
            Add Equipment
          </Text>
        </TouchableOpacity>
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={loadEquipment}
            disabled={loading || savingId !== null}
          >
            <Text style={styles.retryText}>
              Refresh Equipment
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={equipment}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderEquipment}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => {
          if (!actionLock.current) {
            loadEquipment();
          }
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#2E7D32"
              />
            ) : (
              <>
                <Ionicons
                  name="construct-outline"
                  size={48}
                  color="#2E7D32"
                />

                <Text style={styles.emptyText}>
                  {error
                    ? 'Unable to load your equipment.'
                    : 'You have not added any equipment yet.'}
                </Text>
              </>
            )}
          </View>
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
    fontSize: 13,
    color: '#666666',
    marginTop: 6,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },

  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  equipmentIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nameBlock: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },

  category: {
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 4,
  },

  rate: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 10,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  location: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
  },

  statistics: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },

  statText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#666666',
  },

  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },

  availabilityDetails: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  availabilityText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },

  note: {
    fontSize: 12,
    lineHeight: 19,
    color: '#777777',
    marginTop: 9,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 10,
    marginTop: 14,
  },

  editText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.5,
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
  },

  errorText: {
    color: '#B71C1C',
    fontSize: 13,
  },

  retryText: {
    color: '#B71C1C',
    fontWeight: '700',
    marginTop: 10,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
    marginTop: 14,
  },
});