import i18next from 'i18next';
import { fillPlaceholders } from './placeholders.js';
import common from '../../../public/locales/ar/common.json';
import tools from '../../../public/locales/ar/tools.json';
import ui from '../../../public/locales/ar/ui.json';

// Bundle Arabic resources: no detection, network requests, or English fallback.
export const getLanguageFromUrl = (): 'ar' => 'ar';
let initPromise: Promise<typeof i18next> | null = null;
export const initI18n = (): Promise<typeof i18next> => {
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  initPromise ??= i18next
    .init({
      showSupportNotice: false,
      lng: 'ar',
      fallbackLng: false,
      supportedLngs: ['ar'],
      ns: ['common', 'tools', 'ui'],
      defaultNS: 'common',
      resources: { ar: { common, tools, ui } },
      interpolation: { escapeValue: false },
    })
    .then(() => i18next);
  return initPromise;
};

const domReady = (): Promise<void> =>
  document.readyState === 'loading'
    ? new Promise((resolve) =>
        document.addEventListener('DOMContentLoaded', () => resolve(), {
          once: true,
        })
      )
    : Promise.resolve();

const I18N_READY_TIMEOUT_MS = 5000;

export const onPageReady = (callback: () => void | Promise<void>): void => {
  const i18nReady = Promise.race([
    initI18n().then(
      (): void => undefined,
      (): void => undefined
    ),
    new Promise<void>((resolve) => setTimeout(resolve, I18N_READY_TIMEOUT_MS)),
  ]);
  const holdDrop = (event: DragEvent) => event.preventDefault();
  window.addEventListener('dragover', holdDrop);
  window.addEventListener('drop', holdDrop);
  void Promise.all([domReady(), i18nReady]).then(() => {
    window.removeEventListener('dragover', holdDrop);
    window.removeEventListener('drop', holdDrop);
    return callback();
  });
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const hasKey = (key: string): boolean => i18next.exists(key);

export const trText = (
  text: string,
  params?: Record<string, string | number>
): string => {
  const translated = (ui as Record<string, string>)[text];
  const template = translated || text;
  return fillPlaceholders(template, params);
};

const escapeForHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const trHtml = (
  text: string,
  params?: Record<string, string | number>
): string => escapeForHtml(trText(text, params));

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

  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
};

// Routes are canonical and Arabic-only; never add locale prefixes.
export const rewriteLinks = (): void => {};
export default i18next;
