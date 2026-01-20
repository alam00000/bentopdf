export {
  initI18n,
  t,
  changeLanguage,
  applyTranslations,
  rewriteLinks,
  getLanguageFromUrl,
  supportedLanguages,
  languageNames,
} from './i18n';
export type { SupportedLanguage } from './i18n';
export {
  createLanguageSwitcher,
  injectLanguageSwitcher,
} from './language-switcher';
