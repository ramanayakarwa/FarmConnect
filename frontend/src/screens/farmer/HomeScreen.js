import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { EquipmentCard } from '../../components/EquipmentCard';
import { FilterBar } from '../../components/FilterBar';

import { useAuth } from '../../context/AuthContext';
import { equipmentService } from '../../services/equipmentService';

const getGreeting = (t) => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return t('goodMorning', {
      defaultValue: 'Good morning',
    });
  }

  if (hour < 17) {
    return t('goodAfternoon', {
      defaultValue: 'Good afternoon',
    });
  }

  return t('goodEvening', {
    defaultValue: 'Good evening',
  });
};

const normalize = (value) =>
  String(value || '').trim().toLowerCase();

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  // Ignore outdated requests when leaving the screen
  // or when a newer refresh has started.
  const requestVersion = useRef(0);

  const loadEquipment = useCallback(async () => {
    const version = ++requestVersion.current;

    setLoading(true);
    setError('');

    try {
      const response =
        await equipmentService.getEquipment({
          availability: true,
        });

      if (version !== requestVersion.current) {
        return;
      }

      if (!Array.isArray(response?.data)) {
        throw new Error(
          'The server returned an invalid equipment list.'
        );
      }

      // Also filter locally in case the API returns
      // unavailable equipment.
      const availableEquipment = response.data.filter(
        (item) => item.availability === true
      );

      setEquipment(availableEquipment);
    } catch (err) {
      if (version !== requestVersion.current) {
        return;
      }

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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEquipment();

      return () => {
        requestVersion.current += 1;
      };
    }, [loadEquipment])
  );

  const filteredEquipment = useMemo(() => {
    const query = normalize(search);
    const chosenCategory = normalize(selectedCategory);

    return equipment.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        normalize(item.category) === chosenCategory;

      const searchableText = [
        item.name,
        item.category,
        item.location,
      ]
        .map(normalize)
        .join(' ');

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [equipment, search, selectedCategory]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
    } catch (err) {
      Alert.alert(
        'Unable to log out',
        err.message || 'Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  const hasFilters =
    search.trim().length > 0 ||
    selectedCategory !== 'All';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            {getGreeting(t)},{' '}
            {user?.name?.split(' ')[0] || 'Farmer'}
          </Text>

          <Text style={styles.subtitle}>
            Find equipment for your farm
          </Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Open profile and notifications"
        >
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#2E7D32"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
          disabled={loggingOut}
          accessibilityLabel="Log out"
        >
          {loggingOut ? (
            <ActivityIndicator color="#D32F2F" />
          ) : (
            <Ionicons
              name="log-out-outline"
              size={23}
              color="#D32F2F"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>
            {t('findRightEquipment', {
              defaultValue: 'Find the right equipment',
            })}
          </Text>

          <Text style={styles.heroSubtitle}>
            Choose equipment, check its rate and request
            a booking.
          </Text>
        </View>

        <Text style={styles.heroEmoji}>🚜</Text>
      </View>

      {/* Keep the search input outside the list header.
          It stays mounted when search results change. */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={21}
          color="#777"
        />

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchEquipment', {
            defaultValue:
              'Search equipment, category or location',
          })}
          placeholderTextColor="#888"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search equipment"
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={21}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>

      <FilterBar
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          Available equipment
        </Text>

        <Text style={styles.countBadge}>
          {filteredEquipment.length} found
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          {equipment.length > 0 && (
            <Text style={styles.errorText}>
              Showing the last loaded list. Refresh to
              check current availability.
            </Text>
          )}

          <TouchableOpacity
            onPress={loadEquipment}
            disabled={loading}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        data={filteredEquipment}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EquipmentCard
            equipment={item}
            onPress={() =>
              navigation.navigate('EquipmentDetail', {
                equipment: item,
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadEquipment}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="large"
                  color="#2E7D32"
                />

                <Text style={styles.emptySubtitle}>
                  Loading equipment…
                </Text>
              </>
            ) : error ? (
              <Text style={styles.emptySubtitle}>
                Equipment could not be loaded. Tap
                “Try again” above.
              </Text>
            ) : (
              <>
                <Text style={styles.emptyEmoji}>
                  🚜
                </Text>

                <Text style={styles.emptyTitle}>
                  {hasFilters
                    ? 'No matching equipment'
                    : 'No equipment available'}
                </Text>

                <Text style={styles.emptySubtitle}>
                  {hasFilters
                    ? 'Try another search or category.'
                    : 'Pull down to refresh the list.'}
                </Text>

                {hasFilters && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={clearFilters}
                  >
                    <Text style={styles.resetText}>
                      Clear filters
                    </Text>
                  </TouchableOpacity>
                )}
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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
  },

  greetingBlock: {
    flex: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#E8F5E9',
  },

  heroEmoji: {
    fontSize: 44,
    marginLeft: 10,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1B1B1B',
  },

  clearButton: {
    padding: 6,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  countBadge: {
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '700',
    fontSize: 12,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },

  errorBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
  },

  errorText: {
    color: '#B71C1C',
    fontSize: 13,
    lineHeight: 19,
  },

  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
  },

  retryText: {
    color: '#B71C1C',
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },

  resetButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
  },

  resetText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});