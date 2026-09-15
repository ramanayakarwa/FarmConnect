import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import { CATEGORIES } from '../utils/categories';

export const FilterBar = ({ selected, onSelect }) => {
  const { t } = useTranslation();

  // Translate only what is displayed.
  // Keep the original category values for filtering.
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'All':
        return t('all');

      case 'Tractor':
        return t('tractor');

      case 'Rotavator':
        return t('rotavator');

      case 'Seed Drill':
        return t('seedDrill');

      case 'Boom Sprayer':
        return t('boomSprayer');

      default:
        return category;
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              selected === cat && styles.chipSelected,
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.text,
                selected === cat && styles.textSelected,
              ]}
            >
              {getCategoryLabel(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },

  container: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },

  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },

  chipSelected: {
    backgroundColor: '#2E7D32',
  },

  text: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },

  textSelected: {
    color: '#fff',
  },
});