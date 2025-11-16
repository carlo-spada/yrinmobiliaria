import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {} // Will be loaded from public/locales/es/translation.json
      },
      en: {
        translation: {} // Will be loaded from public/locales/en/translation.json
      }
    },
    lng: 'es', // Set Spanish as the initial language
    fallbackLng: 'es',
    defaultNS: 'translation',
    debug: false,
    
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

// Load translations from public folder
const loadTranslations = async () => {
  try {
    const [esRes, enRes] = await Promise.all([
      fetch('/locales/es/translation.json'),
      fetch('/locales/en/translation.json'),
    ]);

    const [esData, enData] = await Promise.all([
      esRes.json(),
      enRes.json(),
    ]);

    i18n.addResourceBundle('es', 'translation', esData, true, true);
    i18n.addResourceBundle('en', 'translation', enData, true, true);
  } catch (error) {
    console.error('Error loading translations:', error);
  }
};

loadTranslations();

export default i18n;
