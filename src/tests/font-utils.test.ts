import { describe, it, expect } from 'vitest';
import { parseFont, generateFontSourceUrl, getDisplayName, hasValidFontExtension } from '../js/utils/font-utils';

describe('parseFont', () => {
  it('should parse basic font family names', () => {
    const result = parseFont('Open Sans');
    expect(result).toEqual({
      family: 'Open Sans',
      weight: '400',
      style: 'normal',
      originalInput: 'Open Sans'
    });
  });

  it('should parse single word font names', () => {
    const result = parseFont('Roboto');
    expect(result).toEqual({
      family: 'Roboto',
      weight: '400',
      style: 'normal',
      originalInput: 'Roboto'
    });
  });

  it('should parse font with numeric weight', () => {
    const result = parseFont('Open Sans 300');
    expect(result).toEqual({
      family: 'Open Sans',
      weight: '300',
      style: 'normal',
      originalInput: 'Open Sans 300'
    });
  });

  it('should parse font with word weight', () => {
    const result = parseFont('Roboto Bold');
    expect(result).toEqual({
      family: 'Roboto',
      weight: '700',
      style: 'normal',
      originalInput: 'Roboto Bold'
    });
  });

  it('should parse font with italic style', () => {
    const result = parseFont('Open Sans Italic');
    expect(result).toEqual({
      family: 'Open Sans',
      weight: '400',
      style: 'italic',
      originalInput: 'Open Sans Italic'
    });
  });

  it('should parse font with weight and italic', () => {
    const result = parseFont('Roboto Bold Italic');
    expect(result).toEqual({
      family: 'Roboto',
      weight: '700',
      style: 'italic',
      originalInput: 'Roboto Bold Italic'
    });
  });

  it('should parse font with numeric weight and italic', () => {
    const result = parseFont('Poppins 300 Italic');
    expect(result).toEqual({
      family: 'Poppins',
      weight: '300',
      style: 'italic',
      originalInput: 'Poppins 300 Italic'
    });
  });

  it('should parse two-word weights', () => {
    const result = parseFont('Poppins Semi Bold');
    expect(result).toEqual({
      family: 'Poppins',
      weight: '600',
      style: 'normal',
      originalInput: 'Poppins Semi Bold'
    });
  });

  it('should parse hyphenated weights', () => {
    const result = parseFont('Open Sans Extra-Light');
    expect(result).toEqual({
      family: 'Open Sans',
      weight: '200',
      style: 'normal',
      originalInput: 'Open Sans Extra-Light'
    });
  });

  it('should handle all weight variants', () => {
    const testCases = [
      { input: 'Font Thin', expectedWeight: '100' },
      { input: 'Font ExtraLight', expectedWeight: '200' },
      { input: 'Font Extra-Light', expectedWeight: '200' },
      { input: 'Font UltraLight', expectedWeight: '200' },
      { input: 'Font Light', expectedWeight: '300' },
      { input: 'Font Normal', expectedWeight: '400' },
      { input: 'Font Regular', expectedWeight: '400' },
      { input: 'Font Medium', expectedWeight: '500' },
      { input: 'Font SemiBold', expectedWeight: '600' },
      { input: 'Font Semi-Bold', expectedWeight: '600' },
      { input: 'Font DemiBold', expectedWeight: '600' },
      { input: 'Font Bold', expectedWeight: '700' },
      { input: 'Font ExtraBold', expectedWeight: '800' },
      { input: 'Font UltraBold', expectedWeight: '800' },
      { input: 'Font Black', expectedWeight: '900' },
      { input: 'Font Heavy', expectedWeight: '900' }
    ];

    testCases.forEach(({ input, expectedWeight }) => {
      const result = parseFont(input);
      expect(result.weight).toBe(expectedWeight);
      expect(result.family).toBe('Font');
    });
  });

  it('should handle style variants', () => {
    const testCases = [
      { input: 'Font Italic', expectedStyle: 'italic' },
      { input: 'Font Oblique', expectedStyle: 'italic' },
      { input: 'Font Slanted', expectedStyle: 'italic' }
    ];

    testCases.forEach(({ input, expectedStyle }) => {
      const result = parseFont(input);
      expect(result.style).toBe(expectedStyle);
      expect(result.family).toBe('Font');
    });
  });

  it('should handle case insensitivity for weights and styles', () => {
    const result1 = parseFont('Roboto BOLD');
    expect(result1.weight).toBe('700');

    const result2 = parseFont('Open Sans italic');
    expect(result2.style).toBe('italic');
  });

  it('should handle complex multi-word font names', () => {
    const result = parseFont('Source Sans Pro Light Italic');
    expect(result).toEqual({
      family: 'Source Sans Pro',
      weight: '300',
      style: 'italic',
      originalInput: 'Source Sans Pro Light Italic'
    });
  });

  it('should prioritize numeric weight over word weight', () => {
    const result = parseFont('Font 500 Bold');
    expect(result.weight).toBe('500');
    expect(result.family).toBe('Font');
  });

  it('should handle edge cases', () => {
    // Empty string
    const empty = parseFont('');
    expect(empty).toEqual({
      family: '',
      weight: '400',
      style: 'normal',
      originalInput: ''
    });

    // Whitespace only
    const whitespace = parseFont('   ');
    expect(whitespace).toEqual({
      family: '',
      weight: '400',
      style: 'normal',
      originalInput: '   '
    });

    // Single word with weight
    const singleWord = parseFont('Bold');
    expect(singleWord).toEqual({
      family: '',
      weight: '700',
      style: 'normal',
      originalInput: 'Bold'
    });
  });

  it('should preserve original input', () => {
    const input = '  Roboto  Bold   Italic  ';
    const result = parseFont(input);
    expect(result.originalInput).toBe(input);
  });

  it('should handle numeric weights at different positions', () => {
    const result1 = parseFont('300 Open Sans');
    expect(result1.weight).toBe('300');
    expect(result1.family).toBe('Open Sans');

    const result2 = parseFont('Open 300 Sans');
    expect(result2.weight).toBe('300');
    expect(result2.family).toBe('Open Sans');
  });
});

describe('getDisplayName', () => {
  it('should return just family name for normal 400 weight', () => {
    const parsed = { family: 'Roboto', weight: '400', style: 'normal', originalInput: 'Roboto' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Roboto');
  });

  it('should include weight name for non-400 weights', () => {
    const parsed = { family: 'Roboto', weight: '700', style: 'normal', originalInput: 'Roboto Bold' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Roboto Bold');
  });

  it('should include style for non-normal styles', () => {
    const parsed = { family: 'Roboto', weight: '400', style: 'italic', originalInput: 'Roboto Italic' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Roboto Italic');
  });

  it('should include both weight and style', () => {
    const parsed = { family: 'Open Sans', weight: '600', style: 'italic', originalInput: 'Open Sans SemiBold Italic' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Open Sans Semibold Italic');
  });

  it('should use numeric weight when no word equivalent exists', () => {
    const parsed = { family: 'Font', weight: '450', style: 'normal', originalInput: 'Font 450' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Font 450');
  });

  it('should capitalize weight and style names', () => {
    const parsed = { family: 'Font', weight: '300', style: 'italic', originalInput: 'Font Light Italic' };
    const displayName = getDisplayName(parsed);
    expect(displayName).toBe('Font Light Italic');
  });
});

describe('generateFontSourceUrl', () => {
  it('should generate basic URL for normal weight', () => {
    const parsed = { family: 'Open Sans', weight: '400', style: 'normal', originalInput: 'Open Sans' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-normal.ttf');
  });

  it('should generate URL with custom weight', () => {
    const parsed = { family: 'Roboto', weight: '700', style: 'normal', originalInput: 'Roboto Bold' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf');
  });

  it('should generate URL with italic style', () => {
    const parsed = { family: 'Open Sans', weight: '400', style: 'italic', originalInput: 'Open Sans Italic' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/open-sans@latest/latin-400-italic.ttf');
  });

  it('should generate URL with custom weight and italic', () => {
    const parsed = { family: 'Poppins', weight: '600', style: 'italic', originalInput: 'Poppins SemiBold Italic' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-600-italic.ttf');
  });

  it('should handle font names with spaces', () => {
    const parsed = { family: 'Source Sans Pro', weight: '300', style: 'normal', originalInput: 'Source Sans Pro Light' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/source-sans-pro@latest/latin-300-normal.ttf');
  });

  it('should throw error for empty family name', () => {
    const parsed = { family: '', weight: '400', style: 'normal', originalInput: '' };
    expect(() => generateFontSourceUrl(parsed)).toThrow('Font family name is required');
  });

  it('should handle special characters in font names', () => {
    const parsed = { family: 'Font & Family', weight: '400', style: 'normal', originalInput: 'Font & Family' };
    const url = generateFontSourceUrl(parsed);
    expect(url).toBe('https://cdn.jsdelivr.net/fontsource/fonts/font-&-family@latest/latin-400-normal.ttf');
  });
});

describe('hasValidFontExtension', () => {
  it('should return true for valid font extensions', () => {
    const validUrls = [
      'https://example.com/font.ttf',
      'https://example.com/font.otf',
      'https://example.com/font.woff',
      'https://example.com/font.woff2',
      'https://example.com/font.eot',
      'https://example.com/path/to/font.TTF',
      'https://example.com/font.WOFF2'
    ];

    validUrls.forEach(url => {
      expect(hasValidFontExtension(url)).toBe(true);
    });
  });

  it('should return false for invalid font extensions', () => {
    const invalidUrls = [
      'https://example.com/font.css',
      'https://example.com/font.js',
      'https://example.com/font.html',
      'https://example.com/font.json',
      'https://example.com/font.txt',
      'https://example.com/font',
      'https://fonts.googleapis.com/css2?family=Roboto'
    ];

    invalidUrls.forEach(url => {
      expect(hasValidFontExtension(url)).toBe(false);
    });
  });

  it('should handle URLs with query parameters', () => {
    expect(hasValidFontExtension('https://example.com/font.woff2?version=1.0')).toBe(false);
    expect(hasValidFontExtension('https://example.com/font.woff2')).toBe(true);
  });

  it('should handle URLs with fragments', () => {
    expect(hasValidFontExtension('https://example.com/font.ttf#section')).toBe(false);
    expect(hasValidFontExtension('https://example.com/font.ttf')).toBe(true);
  });
});
