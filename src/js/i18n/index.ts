import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../../locales/en/translation.json';
import nbTranslation from '../../locales/nb/translation.json';
import { createIcons, icons } from 'lucide';

export const initI18n = async () => {
  await i18next
    .use(LanguageDetector)
    .init({
      debug: false,
      fallbackLng: 'en',
      supportedLngs: ['en', 'nb'],
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      resources: {
        en: {
          translation: enTranslation,
        },
        nb: {
          translation: nbTranslation,
        },
      },
      interpolation: {
        escapeValue: false,
      },
    });

  return i18next;
};

export const changeLanguage = async (lng: string) => {
  await i18next.changeLanguage(lng);
  updatePageTranslations();
};

export const t = (key: string, options?: any) => {
  return i18next.t(key, options);
};

export const getCurrentLanguage = () => {
  return i18next.language || 'en';
};

// Update all elements with data-i18n attributes
export const updatePageTranslations = () => {
  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = i18next.t(key);
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        (element as HTMLInputElement).placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Update elements with data-i18n-html attribute (for HTML content)
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const key = element.getAttribute('data-i18n-html');
    if (key) {
      element.innerHTML = i18next.t(key);
    }
  });

  // Update title
  const titleKey = document.documentElement.getAttribute('data-i18n-title');
  if (titleKey) {
    document.title = i18next.t(titleKey);
  }

  // Update aria-label attributes
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    if (key) {
      element.setAttribute('aria-label', i18next.t(key));
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      (element as HTMLInputElement).placeholder = i18next.t(key);
    }
  });

  // Re-render icons after HTML updates
  createIcons({ icons });
};

export default i18next;
