import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  changeLanguage,
  getLanguageFromUrl,
  LANGUAGE_CHOICE_KEY,
} from '@/js/i18n/i18n';

describe('getLanguageFromUrl', () => {
  const originalLocation = window.location;
  const originalNavigator = window.navigator;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/' },
      writable: true,
      configurable: true,
    });

    localStorage.clear();

    // Reset navigator
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'languages', {
      value: [],
      configurable: true,
    });

    // Reset import.meta.env
    vi.stubEnv('BASE_URL', '/');
    vi.stubEnv('VITE_DEFAULT_LANGUAGE', 'en');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    vi.unstubAllEnvs();
  });

  it('should return language from URL path', () => {
    window.location.pathname = '/de/about';
    expect(getLanguageFromUrl()).toBe('de');
  });

  it('should prioritize URL path over localStorage', () => {
    window.location.pathname = '/fr/';
    localStorage.setItem(LANGUAGE_CHOICE_KEY, 'es');
    expect(getLanguageFromUrl()).toBe('fr');
  });

  it('should use English for unprefixed URLs whatever the browser or storage says', () => {
    window.location.pathname = '/about';
    localStorage.setItem('i18nextLng', 'it');
    localStorage.setItem('bentopdf-language', 'de');
    Object.defineProperty(window.navigator, 'languages', {
      value: ['fr-CA', 'de-DE'],
      configurable: true,
    });
    vi.stubEnv('VITE_DEFAULT_LANGUAGE', 'vi');
    expect(getLanguageFromUrl()).toBe('en');
  });

  it('should match zh-TW from the URL', () => {
    window.location.pathname = '/zh-TW/merge-pdf';
    expect(getLanguageFromUrl()).toBe('zh-TW');
  });
});

describe('changeLanguage', () => {
  const originalLocation = window.location;
  let target = '';

  function at(pathname: string, search = '', hash = '') {
    target = '';
    Object.defineProperty(window, 'location', {
      value: {
        pathname,
        search,
        hash,
        set href(value: string) {
          target = value;
        },
      },
      writable: true,
      configurable: true,
    });
  }

  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('BASE_URL', '/');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    vi.unstubAllEnvs();
  });

  it('moves to the same page in the chosen language and remembers it', () => {
    at('/merge-pdf', '?a=1', '#faq');
    changeLanguage('de');
    expect(target).toBe('/de/merge-pdf?a=1#faq');
    expect(localStorage.getItem(LANGUAGE_CHOICE_KEY)).toBe('de');
  });

  it('swaps one language for another and drops the prefix for English', () => {
    at('/de/merge-pdf');
    changeLanguage('fr');
    expect(target).toBe('/fr/merge-pdf');
    at('/fr/merge-pdf');
    changeLanguage('en');
    expect(target).toBe('/merge-pdf');
    expect(localStorage.getItem(LANGUAGE_CHOICE_KEY)).toBe('en');
  });

  it('handles the home page and zh-TW', () => {
    at('/');
    changeLanguage('zh-TW');
    expect(target).toBe('/zh-TW');
    at('/zh-TW/');
    changeLanguage('en');
    expect(target).toBe('/');
  });

  it('keeps a base path', () => {
    vi.stubEnv('BASE_URL', '/pdf/');
    at('/pdf/de/merge-pdf');
    changeLanguage('ja');
    expect(target).toBe('/pdf/ja/merge-pdf');
  });
});
