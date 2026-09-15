import React, { useState, useEffect, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { EquipmentCard } from '../../components/EquipmentCard';
import { FilterBar } from '../../components/FilterBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';

import { useAuth } from '../../context/AuthContext';
import { equipmentService } from '../../services/equipmentService';


/* =========================================================
   GREETING
========================================================= */

const getGreeting = (t) => {
  const hour = new Date().getHours();

  if (hour < 12) return t('goodMorning');
  if (hour < 17) return t('goodAfternoon');

  return t('goodEvening');
};


/* =========================================================
   HOME SCREEN
========================================================= */

export default function HomeScreen({ navigation }) {

  const { t } = useTranslation();

  const { user, logout } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');


  /* =======================================================
     LOAD EQUIPMENT
  ======================================================= */

  const loadEquipment = async () => {

    try {

      setLoading(true);

      const response = await equipmentService.getEquipment();

      setEquipment(response.data);

    } catch (error) {

      Alert.alert(
        t('error'),
        error?.message || t('somethingWentWrong')
      );

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadEquipment();

  }, []);


  /* =======================================================
     REFRESH
  ======================================================= */

  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    await loadEquipment();

    setRefreshing(false);

  }, []);


  /* =======================================================
     FILTER EQUIPMENT
  ======================================================= */

  const getFilteredEquipment = () => {

    let data = [...equipment];


    /* CATEGORY FILTER */

    if (selectedCategory !== 'All') {

      data = data.filter((item) => {

        const category = (item.category || '').toLowerCase();

        const name = (item.name || '').toLowerCase();


        switch (selectedCategory) {

          case 'Tractor':

            return category.includes('tractor');


          case 'Rotavator':

            return (
              category.includes('rotavator') ||
              name.includes('rotavator')
            );


          case 'Seed Drill':

            return (
              category.includes('seed') ||
              name.includes('seed')
            );


          case 'Boom Sprayer':

            return (
              category.includes('sprayer') ||
              name.includes('sprayer')
            );


          default:

            return true;

        }

      });

    }


    /* SEARCH FILTER */

    if (search.trim()) {

      const q = search.toLowerCase();

      data = data.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
      );

    }


    return data;

  };


  const filtered = getFilteredEquipment();


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <LoadingSpinner
        message={t('loadingEquipment')}
      />
    );

  }


  /* =======================================================
     LIST HEADER
  ======================================================= */

  const ListHeader = () => (

    <View>


      {/* ================= TOP BAR ================= */}

      <View style={styles.topBar}>

        <View style={styles.greetingBlock}>

          <Text style={styles.greeting}>

            {getGreeting(t)}, {user?.name?.split(' ')[0] || t('farmer')} 👋

          </Text>


          <View style={styles.locationRow}>

            <Ionicons
              name="location-outline"
              size={14}
              color="#8D6E63"
            />

            <Text style={styles.locationText}>

              {t('location')}

            </Text>

          </View>

        </View>


        {/* TOP BUTTONS */}

        <View style={styles.topBtns}>


          {/* NOTIFICATION */}

          <TouchableOpacity style={styles.notifBtn}>

            <Ionicons
              name="notifications-outline"
              size={24}
              color="#2E7D32"
            />

            <View style={styles.notifDot} />

          </TouchableOpacity>


          {/* LOGOUT */}

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {

              await logout();

            }}
          >

            <Ionicons
              name="log-out-outline"
              size={22}
              color="#E53935"
            />

          </TouchableOpacity>


        </View>

      </View>


      {/* ================= HERO ================= */}

      <View style={styles.heroBanner}>

        <View style={styles.heroContent}>

          <Text style={styles.heroTitle}>

            {t('findRightEquipment')}

          </Text>


          <Text style={styles.heroSub}>

            {t('rentEquipmentSubtitle')}

          </Text>

        </View>


        <Text style={styles.heroEmoji}>
          🚜
        </Text>

      </View>


      {/* ================= SEARCH ================= */}

      <View style={styles.searchBar}>

        <Ionicons
          name="search-outline"
          size={20}
          color="#8D6E63"
          style={{ marginLeft: 14 }}
        />


        <TextInput

          style={styles.searchInput}

          placeholder={t('searchEquipment')}

          placeholderTextColor="#999"

          value={search}

          onChangeText={setSearch}

        />


        {search.length > 0 && (

          <TouchableOpacity
            onPress={() => setSearch('')}
          >

            <Ionicons
              name="close-circle"
              size={20}
              color="#999"
            />

          </TouchableOpacity>

        )}

      </View>


      {/* ================= FILTER ================= */}

      <FilterBar
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />


      {/* ================= SECTION ================= */}

      <View style={styles.sectionRow}>

        <Text style={styles.sectionTitle}>

          {t('nearbyEquipment')}

        </Text>


        <Text style={styles.countBadge}>

          {t('found', {
            count: filtered.length,
          })}

        </Text>

      </View>

    </View>

  );


  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const ListEmpty = () => (

    <View style={styles.emptyContainer}>

      <Text style={styles.emptyEmoji}>
        🚜
      </Text>


      <Text style={styles.emptyTitle}>

        {t('noEquipmentFound')}

      </Text>


      <Text style={styles.emptySubtitle}>

        {t('tryAnotherCategory')}

      </Text>

    </View>

  );


  /* =======================================================
     MAIN SCREEN
  ======================================================= */

  return (

    <SafeAreaView style={styles.safe}>

      <FlatList

        data={filtered}

        keyExtractor={(item) =>
          item.id.toString()
        }


        renderItem={({ item }) => (

          <EquipmentCard

            equipment={item}

            onPress={() =>
              navigation.navigate(
                'EquipmentDetail',
                {
                  equipment: item,
                }
              )
            }

          />

        )}


        ListHeaderComponent={ListHeader}

        ListEmptyComponent={ListEmpty}

        contentContainerStyle={styles.listContent}

        showsVerticalScrollIndicator={false}


        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

            tintColor="#2E7D32"

          />

        }

      />

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

  listContent: {
    padding: 16,
    paddingBottom: 80,
  },


  /* ================= TOP BAR ================= */

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  greetingBlock: {
    flex: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  locationText: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '500',
  },


  /* ================= BUTTONS ================= */

  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  topBtns: {
    flexDirection: 'row',
    gap: 10,
  },

  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,

    marginLeft: 8,
  },

  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1.5,
    borderColor: '#fff',
  },


  /* ================= HERO ================= */

  heroBanner: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,

    flexDirection: 'row',
    alignItems: 'center',

    overflow: 'hidden',

    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.4,
    shadowRadius: 12,

    elevation: 8,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 26,
  },

  heroSub: {
    fontSize: 13,
    color: '#A5D6A7',
    marginBottom: 16,
    lineHeight: 18,
  },

  heroEmoji: {
    fontSize: 56,
    marginLeft: 8,
  },


  /* ================= SEARCH ================= */

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#fff',

    borderRadius: 14,

    borderWidth: 1.5,
    borderColor: '#E0E0E0',

    marginBottom: 4,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 3,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1B1B1B',
  },


  /* ================= SECTION ================= */

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 14,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  countBadge: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '700',

    backgroundColor: '#E8F5E9',

    paddingHorizontal: 10,
    paddingVertical: 3,

    borderRadius: 10,
  },


  /* ================= EMPTY ================= */

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },

  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  clearBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  clearBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

});