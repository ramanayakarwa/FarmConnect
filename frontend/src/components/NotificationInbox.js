import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import api from '../services/api';

const formatTime = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationInbox() {
  const [notifications, setNotifications] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const focused = useRef(false);
  const requestVersion = useRef(0);
  const actionLock = useRef(false);

  const loadNotifications = useCallback(
    async (showLoading = true) => {
      const version = ++requestVersion.current;

      if (showLoading && focused.current) {
        setLoading(true);
      }

      try {
        // api.js already unwraps the Axios response.
        const response = await api.get('/notifications');

        if (
          !focused.current ||
          version !== requestVersion.current
        ) {
          return;
        }

        if (
          !Array.isArray(response?.data) ||
          typeof response.enabled !== 'boolean'
        ) {
          throw new Error(
            'Invalid notification response received.'
          );
        }

        setNotifications(response.data);
        setEnabled(response.enabled);
        setLoaded(true);
        setError('');
      } catch (err) {
        if (
          focused.current &&
          version === requestVersion.current
        ) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load notifications.'
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
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      loadNotifications();

      const timer = setInterval(() => {
        if (!actionLock.current) {
          loadNotifications(false);
        }
      }, 15000);

      return () => {
        focused.current = false;
        requestVersion.current += 1;
        clearInterval(timer);
      };
    }, [loadNotifications])
  );

  const changePreference = async (value) => {
    if (
      actionLock.current ||
      !loaded ||
      !focused.current
    ) {
      return;
    }

    actionLock.current = true;
    requestVersion.current += 1;

    setSaving(true);
    setLoading(false);
    setError('');

    try {
      await api.put('/notifications/preferences', {
        enabled: value,
      });

      // Change the switch only after the server saves it.
      if (focused.current) {
        setEnabled(value);
      }
    } catch (err) {
      if (focused.current) {
        setError(
          err.response?.data?.message ||
            'Could not save the preference. Refresh to check its current setting.'
        );
      }
    } finally {
      actionLock.current = false;
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    if (actionLock.current || !focused.current) return;

    actionLock.current = true;
    requestVersion.current += 1;

    setSaving(true);
    setLoading(false);
    setError('');

    try {
      await api.put('/notifications/read');

      if (focused.current) {
        await loadNotifications(false);
      }
    } catch (err) {
      if (focused.current) {
        setError(
          err.response?.data?.message ||
            'Could not mark notifications as read. Please refresh.'
        );
      }
    } finally {
      actionLock.current = false;
      setSaving(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.read_at
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <Ionicons
          name="notifications-outline"
          size={25}
          color="#2E7D32"
        />

        <Text style={styles.heading}>
          Notifications
        </Text>

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        Booking requests, service updates, payment
        confirmations and feedback.
      </Text>

      <View style={styles.preferenceRow}>
        <View style={styles.preferenceText}>
          <Text style={styles.preferenceTitle}>
            Receive in-app notifications
          </Text>

          <Text style={styles.hint}>
            {!loaded
              ? 'Load your preference to change this setting.'
              : enabled
                ? 'New booking alerts are enabled.'
                : 'New booking alerts are paused.'}
          </Text>
        </View>

        <Switch
          value={enabled}
          onValueChange={changePreference}
          disabled={!loaded || loading || saving}
          trackColor={{
            false: '#CCCCCC',
            true: '#A5D6A7',
          }}
          thumbColor={enabled ? '#2E7D32' : '#F4F4F4'}
          accessibilityLabel="Receive in-app notifications"
        />
      </View>

      <Text style={styles.hint}>
        These updates appear inside the app. Background
        push alerts are not enabled.
      </Text>

      {loaded && !enabled && (
        <Text style={styles.pausedText}>
          Existing notifications remain available below.
        </Text>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => loadNotifications()}
          disabled={loading || saving}
          style={styles.actionButton}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#2E7D32"
          />

          <Text style={styles.actionText}>
            Refresh
          </Text>
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllRead}
            disabled={loading || saving}
            style={styles.actionButton}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color="#2E7D32"
            />

            <Text style={styles.actionText}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(loading || saving) && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#2E7D32" />

          <Text style={styles.hint}>
            {saving ? 'Saving…' : 'Refreshing…'}
          </Text>
        </View>
      )}

      {loaded &&
        !loading &&
        !error &&
        notifications.length === 0 && (
          <Text style={styles.emptyText}>
            No notifications yet.
          </Text>
        )}

      {notifications.map((item) => {
        const unread = !item.read_at;

        return (
          <View
            key={item.id}
            style={[
              styles.notification,
              unread && styles.unreadNotification,
            ]}
          >
            <View style={styles.messageRow}>
              {unread && <View style={styles.unreadDot} />}

              <Text
                style={[
                  styles.message,
                  unread && styles.unreadMessage,
                ]}
              >
                {item.message}
              </Text>
            </View>

            <Text style={styles.timestamp}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        );
      })}

      {notifications.length > 0 && (
        <Text style={styles.bottomNote}>
          Showing up to 100 recent notifications.
          Booking details are available in your
          bookings tab.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },

  heading: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },

  badge: {
    minWidth: 25,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 14,
  },

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  preferenceText: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },

  hint: {
    fontSize: 12,
    lineHeight: 19,
    color: '#777777',
  },

  pausedText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#8D6E63',
    marginTop: 6,
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    marginBottom: 6,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingRight: 5,
  },

  actionText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 13,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },

  errorBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#FFEBEE',
  },

  errorText: {
    color: '#B71C1C',
    fontSize: 13,
    lineHeight: 20,
  },

  emptyText: {
    color: '#777777',
    textAlign: 'center',
    paddingVertical: 20,
  },

  notification: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    marginTop: 8,
  },

  unreadNotification: {
    backgroundColor: '#E8F5E9',
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginTop: 6,
  },

  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#444444',
  },

  unreadMessage: {
    fontWeight: '700',
    color: '#245B28',
  },

  timestamp: {
    fontSize: 11,
    color: '#888888',
    marginTop: 7,
  },

  bottomNote: {
    marginTop: 14,
    fontSize: 11,
    lineHeight: 18,
    color: '#888888',
  },
});