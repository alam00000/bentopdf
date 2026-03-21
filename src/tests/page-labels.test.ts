import { describe, expect, it } from 'vitest';
import {
  normalizePageLabelStartValue,
  resolvePageLabelStyle,
  type PageLabelStyleName,
} from '@/js/utils/page-labels';

const mockCpdf = {
  decimalArabic: 0,
  uppercaseRoman: 1,
  lowercaseRoman: 2,
  uppercaseLetters: 3,
  lowercaseLetters: 4,
};

describe('page label helpers', () => {
  it.each([
    ['DecimalArabic', 0],
    ['LowercaseRoman', 2],
    ['UppercaseRoman', 1],
    ['LowercaseLetters', 4],
    ['UppercaseLetters', 3],
  ] satisfies Array<[PageLabelStyleName, number]>)(
    'maps %s to the expected CoherentPDF style value',
    (style, expected) => {
      expect(resolvePageLabelStyle(mockCpdf, style)).toBe(expected);
    }
  );

  it('falls back to style value 5 for NoLabelPrefixOnly when the runtime constant is absent', () => {
    expect(resolvePageLabelStyle(mockCpdf, 'NoLabelPrefixOnly')).toBe(5);
  });

  it('uses the runtime constant for NoLabelPrefixOnly when available', () => {
    expect(
      resolvePageLabelStyle(
        {
          ...mockCpdf,
          noLabelPrefixOnly: 9,
        },
        'NoLabelPrefixOnly'
      )
    ).toBe(9);
  });

  it('normalizes invalid and decimal start values', () => {
    expect(normalizePageLabelStartValue(Number.NaN)).toBe(1);
    expect(normalizePageLabelStartValue(-4)).toBe(0);
    expect(normalizePageLabelStartValue(7.9)).toBe(7);
  });
});
