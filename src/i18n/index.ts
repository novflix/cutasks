import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', countryCode: 'gb' },
  { code: 'fr', label: 'Français', countryCode: 'fr' },
  { code: 'de', label: 'Deutsch', countryCode: 'de' },
  { code: 'es', label: 'Español', countryCode: 'es' },
  { code: 'it', label: 'Italiano', countryCode: 'it' },
  { code: 'pt', label: 'Português', countryCode: 'pt' },
  { code: 'ru', label: 'Русский', countryCode: 'ru' },
  { code: 'tr', label: 'Türkçe', countryCode: 'tr' },
  { code: 'zh', label: '中文', countryCode: 'cn' },
  { code: 'ja', label: '日本語', countryCode: 'jp' },
  { code: 'ko', label: '한국어', countryCode: 'kr' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const savedLang = localStorage.getItem('cutasks_language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    it: { translation: it },
    pt: { translation: pt },
    ru: { translation: ru },
    tr: { translation: tr },
    zh: { translation: zh },
    ja: { translation: ja },
    ko: { translation: ko },
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
