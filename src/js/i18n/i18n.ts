import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages
export const supportedLanguages = [
  'en',
  'fr',
  'de',
  'es',
  'zh',
  'zh-TW',
  'vi',
  'tr',
  'id',
  'it',
  'pt',
] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  zh: '中文',
  'zh-TW': '繁體中文（台灣）',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  pt: 'Português',
};

export const getLanguageFromUrl = (): SupportedLanguage => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = window.location.pathname;

  if (basePath && basePath !== '/' && path.startsWith(basePath)) {
    path = path.slice(basePath.length) || '/';
  }

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const langMatch = path.match(
    /^\/(en|fr|es|de|zh|zh-TW|vi|tr|id|it|pt)(?:\/|$)/
  );
  if (
    langMatch &&
    supportedLanguages.includes(langMatch[1] as SupportedLanguage)
  ) {
    return langMatch[1] as SupportedLanguage;
  }

  const storedLang = localStorage.getItem('i18nextLng');
  if (
    storedLang &&
    supportedLanguages.includes(storedLang as SupportedLanguage)
  ) {
    return storedLang as SupportedLanguage;
  }

  return 'en';
};

let initialized = false;

export const initI18n = async (): Promise<typeof i18next> => {
  if (initialized) return i18next;

  const currentLang = getLanguageFromUrl();

  await i18next
    .use(HttpBackend)
    .use(LanguageDetector)
    .init({
      lng: currentLang,
      fallbackLng: 'en',
      supportedLngs: supportedLanguages as unknown as string[],
      ns: ['common', 'tools'],
      defaultNS: 'common',
      backend: {
        loadPath: `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}locales/{{lng}}/{{ns}}.json`,
      },
      detection: {
        order: ['path', 'localStorage', 'navigator'],
        lookupFromPathIndex: 0,
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
    });

  initialized = true;
  return i18next;
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const changeLanguage = (lang: SupportedLanguage): void => {
  if (!supportedLanguages.includes(lang)) return;
  localStorage.setItem('i18nextLng', lang);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let relativePath = window.location.pathname;

  if (basePath && basePath !== '/' && relativePath.startsWith(basePath)) {
    relativePath = relativePath.slice(basePath.length) || '/';
  }

  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }

  let pagePathWithoutLang = relativePath;
  const langPrefixMatch = relativePath.match(
    /^\/(en|fr|es|de|zh|zh-TW|vi|tr|id|it|pt)(\/.*)?$/
  );
  if (langPrefixMatch) {
    pagePathWithoutLang = langPrefixMatch[2] || '/';
  }

  if (!pagePathWithoutLang.startsWith('/')) {
    pagePathWithoutLang = '/' + pagePathWithoutLang;
  }

  let newRelativePath: string;
  if (lang === 'en') {
    newRelativePath = pagePathWithoutLang;
  } else {
    newRelativePath = `/${lang}${pagePathWithoutLang}`;
  }

  let newPath: string;
  if (basePath && basePath !== '/') {
    newPath = basePath + newRelativePath;
  } else {
    newPath = newRelativePath;
  }

  newPath = newPath.replace(/\/+/g, '/');

  const newUrl = newPath + window.location.search + window.location.hash;
  window.location.href = newUrl;
};

// Apply translations to all elements with data-i18n attribute
export const applyTranslations = (): void => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        (element as HTMLElement).title = translation;
      }
    }
  });

  document.documentElement.lang = i18next.language;
};

export const rewriteLinks = (): void => {
  const currentLang = getLanguageFromUrl();
  if (currentLang === 'en') return;

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const links = document.querySelectorAll('a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      href.startsWith('javascript:')
    ) {
      return;
    }

    if (href.includes('/assets/')) {
      return;
    }

    const langPrefixRegex = new RegExp(
      `^(${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?/(en|fr|es|de|zh|zh-TW|vi|tr|id|it|pt)(/|$)`
    );
    if (langPrefixRegex.test(href)) {
      return;
    }

    let newHref: string;
    if (basePath && basePath !== '/' && href.startsWith(basePath)) {
      const pathAfterBase = href.slice(basePath.length);
      newHref = `${basePath}/${currentLang}${pathAfterBase}`;
    } else if (href.startsWith('/')) {
      if (basePath && basePath !== '/') {
        newHref = `${basePath}/${currentLang}${href}`;
      } else {
        newHref = `/${currentLang}${href}`;
      }
    } else if (href === '' || href === 'index.html') {
      if (basePath && basePath !== '/') {
        newHref = `${basePath}/${currentLang}/`;
      } else {
        newHref = `/${currentLang}/`;
      }
    } else {
      newHref = `${currentLang}/${href}`;
    }

    newHref = newHref.replace(/([^:])\/+/g, '$1/');

    link.setAttribute('href', newHref);
  });
};

export default i18next;
