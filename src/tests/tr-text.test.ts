import { describe, it, expect, beforeAll } from 'vitest';
import i18next from 'i18next';
import { trHtml, trText } from '../js/i18n/i18n';
import { fillPlaceholders } from '../js/i18n/placeholders';

describe('trText', () => {
  beforeAll(async () => {
    await i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: { ui: {} },
        de: {
          ui: {
            'Adding {{n}} blank pages...': 'Füge {{n}} leere Seiten hinzu...',
            'Open the file. Then: save it.': 'Datei öffnen. Dann speichern.',
            'Empty one': '',
          },
        },
      },
      interpolation: { escapeValue: false },
    });
  });

  it('returns English text with placeholders filled in', async () => {
    await i18next.changeLanguage('en');
    expect(trText('Adding {{n}} blank pages...', { n: 3 })).toBe(
      'Adding 3 blank pages...'
    );
    expect(trText('Plain text')).toBe('Plain text');
  });

  it('uses the translation for the current language', async () => {
    await i18next.changeLanguage('de');
    expect(trText('Adding {{n}} blank pages...', { n: 3 })).toBe(
      'Füge 3 leere Seiten hinzu...'
    );
  });

  it('finds keys that contain dots and colons', async () => {
    await i18next.changeLanguage('de');
    expect(trText('Open the file. Then: save it.')).toBe(
      'Datei öffnen. Dann speichern.'
    );
  });

  it('falls back to English when a translation is missing or empty', async () => {
    await i18next.changeLanguage('de');
    expect(trText('Not translated {{x}}', { x: 'yet' })).toBe(
      'Not translated yet'
    );
    expect(trText('Empty one')).toBe('Empty one');
  });

  it('keeps unknown placeholders visible instead of dropping them', async () => {
    await i18next.changeLanguage('en');
    expect(trText('Hello {{name}}', { other: 1 })).toBe('Hello {{name}}');
  });
});

describe('trHtml and placeholders', () => {
  it('escapes the template and the values for HTML', async () => {
    await i18next.changeLanguage('en');
    expect(
      trHtml('Rename "{{name}}" to <b>', { name: '<img src=x onerror=1>' })
    ).toBe('Rename &quot;&lt;img src=x onerror=1&gt;&quot; to &lt;b&gt;');
  });

  it('only fills placeholders from the given values, not inherited ones', () => {
    expect(fillPlaceholders('{{constructor}} {{n}}', { n: 2 })).toBe(
      '{{constructor}} 2'
    );
  });
});
