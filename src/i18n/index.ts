import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import it from './locales/it.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'it';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
    },
    lng: deviceLanguage === 'it' ? 'it' : 'it',
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
