// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createTranslationChecker } from '../../scripts/page-translation.mjs';

describe('createTranslationChecker', () => {
  const isTranslated = createTranslationChecker(
    { de: { mergePdf: { name: 'PDF zusammenführen' } } },
    (page: string) =>
      page.replace(/-([a-z])/g, (_: string, letter: string) =>
        letter.toUpperCase()
      )
  );

  it('always treats English and the home page as translated', () => {
    expect(isTranslated('terms', 'en')).toBe(true);
    expect(isTranslated('index', 'xx')).toBe(true);
  });

  it('uses the tools.json entry when one exists', () => {
    expect(isTranslated('merge-pdf', 'de')).toBe(true);
  });

  it('keeps English-only and unknown pages untranslated', () => {
    expect(isTranslated('terms', 'de')).toBe(false);
    expect(isTranslated('no-such-page', 'de')).toBe(false);
  });

  it('counts a page as translated once enough of its text is', () => {
    expect(isTranslated('about', 'de')).toBe(true);
    expect(isTranslated('about', 'xx')).toBe(false);
  });
});
