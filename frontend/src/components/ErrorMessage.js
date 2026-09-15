import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export const ErrorMessage = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons
        name="alert-circle"
        size={48}
        color="#F44336"
      />

      <Text style={styles.message}>
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {t('tryAgain')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5DC',
  },

  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});