import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', countryCode: 'gb' },
  { code: 'fr', label: 'Français', countryCode: 'fr' },
  { code: 'de', label: 'Deutsch', countryCode: 'de' },
  { code: 'es', label: 'Español', countryCode: 'es' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const savedLang = localStorage.getItem('cutasks_language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(code: LanguageCode) {
  i18n.changeLanguage(code);
  localStorage.setItem('cutasks_language', code);
}

export default i18n;
