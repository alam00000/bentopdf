import { describe, expect, it } from 'vitest';
import {
  assertTesseractLanguagesAvailable,
  formatTesseractLanguageList,
  getAvailableTesseractLanguageEntries,
  getUnavailableTesseractLanguages,
  UnsupportedOcrLanguageError,
} from '../js/utils/tesseract-language-availability';

describe('tesseract-language-availability', () => {
  describe('formatTesseractLanguageList', () => {
    it('formats known language codes into "Language (code)" format', () => {
      expect(formatTesseractLanguageList(['eng'])).toBe('English (eng)');
      expect(formatTesseractLanguageList(['eng', 'fra'])).toBe(
        'English (eng), French (fra)'
      );
    });

    it('returns an empty string when provided an empty array', () => {
      expect(formatTesseractLanguageList([])).toBe('');
    });

    it('returns the unmapped code directly for unknown languages', () => {
      expect(formatTesseractLanguageList(['unknown_lang'])).toBe(
        'unknown_lang'
      );
    });

    it('handles a mix of known and unknown language codes', () => {
      expect(formatTesseractLanguageList(['eng', 'unknown_lang', 'deu'])).toBe(
        'English (eng), unknown_lang, German (deu)'
      );
    });
  });

  describe('getAvailableTesseractLanguageEntries', () => {
    it('filters OCR language entries when the build restricts bundled languages', () => {
      expect(
        getAvailableTesseractLanguageEntries({
          VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
        })
      ).toEqual([
        ['eng', 'English'],
        ['deu', 'German'],
      ]);
    });
  });

  describe('getUnavailableTesseractLanguages', () => {
    it('reports unavailable OCR languages for restricted air-gap builds', () => {
      expect(
        getUnavailableTesseractLanguages('eng+fra', {
          VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
        })
      ).toEqual(['fra']);
    });
  });

  describe('assertTesseractLanguagesAvailable', () => {
    it('throws UnsupportedOcrLanguageError when unavailable languages are requested', () => {
      expect(() =>
        assertTesseractLanguagesAvailable('eng+fra', {
          VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
        })
      ).toThrow(UnsupportedOcrLanguageError);
    });

    it('does not throw when all requested languages are available', () => {
      expect(() =>
        assertTesseractLanguagesAvailable('eng+deu', {
          VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
        })
      ).not.toThrow();
    });
  });
});
