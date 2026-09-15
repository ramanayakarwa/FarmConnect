import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../context/AuthContext';
import providerService from '../../services/providerService';

export default function ProviderDashboardScreen({
  navigation,
}) {
  const { t } = useTranslation();

  const {
    user,
    logout,
    isAuthenticated,
  } = useAuth();

  const [dashboard, setDashboard] =
    useState({});

  const [myEquipment, setMyEquipment] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const isScreenActive = useRef(false);

  const authStateRef = useRef({
    isAuthenticated: false,
    userId: null,
  });

  authStateRef.current = {
    isAuthenticated,
    userId: user?.id || null,
  };

  const loadDashboard = useCallback(
    async (showLoader = true) => {
      const auth = authStateRef.current;

      if (
        !auth.isAuthenticated ||
        !auth.userId ||
        !isScreenActive.current
      ) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const [
          dashboardResponse,
          equipmentResponse,
        ] = await Promise.all([
          providerService.getDashboard(),
          providerService.getProviderEquipment(),
        ]);

        const latestAuth =
          authStateRef.current;

        if (
          !latestAuth.isAuthenticated ||
          !latestAuth.userId ||
          !isScreenActive.current
        ) {
          return;
        }

        setDashboard(
          dashboardResponse?.data || {}
        );

        setMyEquipment(
          equipmentResponse?.data || []
        );
      } catch (error) {
        const latestAuth =
          authStateRef.current;

        if (
          !latestAuth.isAuthenticated ||
          !latestAuth.userId ||
          !isScreenActive.current
        ) {
          return;
        }

        if (
          error?.response?.status === 401 ||
          error?.message === 'No token' ||
          error?.response?.data?.message ===
            'No token'
        ) {
          return;
        }

        console.log(
          'PROVIDER DASHBOARD ERROR:',
          error?.response?.data ||
            error?.message ||
            error
        );

        Alert.alert(
          t('error'),
          t('unableLoadDashboard')
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      isScreenActive.current = true;

      if (
        authStateRef.current
          .isAuthenticated &&
        authStateRef.current.userId
      ) {
        loadDashboard(true);
      } else {
        setLoading(false);
        setRefreshing(false);
      }

      return () => {
        isScreenActive.current = false;
      };
    }, [loadDashboard])
  );

  const onRefresh = async () => {
    const auth =
      authStateRef.current;

    if (
      !auth.isAuthenticated ||
      !auth.userId ||
      !isScreenActive.current
    ) {
      return;
    }

    setRefreshing(true);

    await loadDashboard(false);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },

        {
          text: t('logout'),
          style: 'destructive',

          onPress: async () => {
            try {
              isScreenActive.current = false;

              await logout();
            } catch (error) {
              console.log(
                'LOGOUT ERROR:',
                error?.message || error
              );

              if (
                !authStateRef.current
                  .isAuthenticated
              ) {
                return;
              }

              Alert.alert(
                t('error'),
                t('couldNotLogout')
              );
            }
          },
        },
      ]
    );
  };

  if (
    loading &&
    (!dashboard ||
      Object.keys(dashboard).length === 0)
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          {t('loadingDashboard')}
        </Text>
      </View>
    );
  }

  const totalEquipment =
    dashboard?.totalEquipment ??
    myEquipment?.length ??
    0;

  const activeBookings =
    dashboard?.activeBookings ?? 0;

  const monthlyEarnings =
    dashboard?.monthlyEarnings ?? 0;

  const totalEarnings =
    dashboard?.totalEarnings ?? 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {t('welcomeBack')}
          </Text>

          <Text style={styles.name}>
            {user?.name || t('provider')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutIcon}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>
          {t('overview')}
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="construct-outline"
                size={25}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.statNumber}>
              {totalEquipment}
            </Text>

            <Text style={styles.statLabel}>
              {t('totalEquipment')}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="calendar-outline"
                size={25}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.statNumber}>
              {activeBookings}
            </Text>

            <Text style={styles.statLabel}>
              {t('activeBookings')}
            </Text>
          </View>
        </View>

        {/* EARNINGS */}
        <Text style={styles.sectionTitle}>
          {t('earnings')}
        </Text>

        <View style={styles.earningsCard}>
          <View style={styles.earningRow}>
            <View>
              <Text style={styles.earningLabel}>
                {t('thisMonth')}
              </Text>

              <Text style={styles.earningValue}>
                ₹
                {Number(
                  monthlyEarnings
                ).toLocaleString('en-IN')}
              </Text>
            </View>

            <Ionicons
              name="trending-up-outline"
              size={32}
              color="#2E7D32"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.earningRow}>
            <View>
              <Text style={styles.earningLabel}>
                {t('totalEarnings')}
              </Text>

              <Text style={styles.earningValue}>
                ₹
                {Number(
                  totalEarnings
                ).toLocaleString('en-IN')}
              </Text>
            </View>

            <Ionicons
              name="cash-outline"
              size={32}
              color="#2E7D32"
            />
          </View>
        </View>

        {/* EQUIPMENT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('myEquipment')}
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'Equipment'
              )
            }
          >
            <Text style={styles.viewAll}>
              {t('viewAll')}
            </Text>
          </TouchableOpacity>
        </View>

        {myEquipment.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="construct-outline"
              size={45}
              color="#9E9E9E"
            />

            <Text style={styles.emptyTitle}>
              {t('noEquipmentFound')}
            </Text>

            <Text style={styles.emptyText}>
              {t(
                'addEquipmentToReceiveBookings'
              )}
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate(
                  'Equipment'
                )
              }
            >
              <Text style={styles.addButtonText}>
                {t('addEquipment')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {myEquipment
              .slice(0, 4)
              .map((equipment) => (
                <View
                  key={equipment.id}
                  style={
                    styles.equipmentCard
                  }
                >
                  <View
                    style={
                      styles.equipmentIcon
                    }
                  >
                    <Ionicons
                      name="construct"
                      size={25}
                      color="#2E7D32"
                    />
                  </View>

                  <View
                    style={
                      styles.equipmentInfo
                    }
                  >
                    <Text
                      style={
                        styles.equipmentName
                      }
                      numberOfLines={1}
                    >
                      {equipment.name}
                    </Text>

                    <Text
                      style={
                        styles.equipmentDetail
                      }
                    >
                      {equipment.category ||
                        t(
                          'agriculturalEquipment'
                        )}
                    </Text>

                    {equipment.location ? (
                      <Text
                        style={
                          styles.equipmentLocation
                        }
                      >
                        📍 {equipment.location}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7F5',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#757575',
  },

  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greeting: {
    color: '#E8F5E9',
    fontSize: 14,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 3,
  },

  logoutIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#212121',
  },

  statLabel: {
    fontSize: 13,
    color: '#757575',
    marginTop: 3,
  },

  earningsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
    elevation: 2,
  },

  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  earningLabel: {
    fontSize: 13,
    color: '#757575',
  },

  earningValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAll: {
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },

  addButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipmentInfo: {
    flex: 1,
    marginLeft: 12,
  },

  equipmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  equipmentDetail: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  equipmentLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});