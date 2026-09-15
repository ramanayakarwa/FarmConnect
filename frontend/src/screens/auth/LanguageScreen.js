import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import { useTranslation } from 'react-i18next';

import i18n from '../../i18n';

export default function LanguageScreen({ onLanguageSelected }) {
  const { t } = useTranslation();

  const selectLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);

      if (onLanguageSelected) {
        onLanguageSelected();
      }
    } catch (error) {
      console.log('LANGUAGE SELECTION ERROR:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* LOGO */}
        <Text style={styles.logo}>🚜</Text>

        {/* APP NAME */}
        <Text style={styles.title}>
          FarmConnect
        </Text>

        {/* SELECT LANGUAGE */}
        <Text style={styles.subtitle}>
          {t('selectLanguage')}
        </Text>

        {/* ENGLISH */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => selectLanguage('en')}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>🇬🇧</Text>

          <Text style={styles.languageText}>
            English
          </Text>
        </TouchableOpacity>

        {/* HINDI */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => selectLanguage('hi')}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>🇮🇳</Text>

          <Text style={styles.languageText}>
            हिंदी
          </Text>
        </TouchableOpacity>

        {/* MARATHI */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => selectLanguage('mr')}
          activeOpacity={0.8}
        >
          <Text style={styles.flag}>🇮🇳</Text>

          <Text style={styles.languageText}>
            मराठी
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  logo: {
    fontSize: 65,
    textAlign: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  languageButton: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  flag: {
    fontSize: 25,
    marginRight: 15,
  },

  languageText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
});