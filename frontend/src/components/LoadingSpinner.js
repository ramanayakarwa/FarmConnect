import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

import { useTranslation } from 'react-i18next';

export const LoadingSpinner = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#2E7D32"
      />

      <Text style={styles.text}>
        {t('loadingFarmConnect')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },

  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});