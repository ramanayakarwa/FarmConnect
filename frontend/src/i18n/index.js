import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import hi from './hi';
import mr from './mr';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',

    resources: {
      en: {
        translation: en,
      },

      hi: {
        translation: hi,
      },

      mr: {
        translation: mr,
      },
    },

    lng: 'en',

    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;