import { describe, it, expect } from 'vitest';
import {
  getStandardPageName,
  convertPoints,
  hexToRgb,
  formatBytes,
  parsePageRanges,
} from '../js/utils/helpers';

describe('helpers', () => {
  describe('getStandardPageName', () => {
    it('should identify A4 portrait', () => {
      expect(getStandardPageName(595.28, 841.89)).toBe('A4');
    });

    it('should identify A4 landscape', () => {
      expect(getStandardPageName(841.89, 595.28)).toBe('A4');
    });

    it('should identify Letter size', () => {
      expect(getStandardPageName(612, 792)).toBe('Letter');
    });

    it('should identify Legal size', () => {
      expect(getStandardPageName(612, 1008)).toBe('Legal');
    });

    it('should identify A3 size', () => {
      expect(getStandardPageName(841.89, 1190.55)).toBe('A3');
    });

    it('should handle floating point variations within tolerance', () => {
      expect(getStandardPageName(595.5, 841.9)).toBe('A4');
    });

    it('should return Custom for non-standard sizes', () => {
      expect(getStandardPageName(600, 800)).toBe('Custom');
    });
  });

  describe('convertPoints', () => {
    it('should convert points to inches', () => {
      expect(convertPoints(72, 'in')).toBe('1.00');
      expect(convertPoints(144, 'in')).toBe('2.00');
    });

    it('should convert points to millimeters', () => {
      expect(convertPoints(72, 'mm')).toBe('25.40');
    });

    it('should convert points to pixels', () => {
      expect(convertPoints(72, 'px')).toBe('96.00');
    });

    it('should return points as is for pt unit', () => {
      expect(convertPoints(100, 'pt')).toBe('100.00');
    });

    it('should default to points for unknown unit', () => {
      expect(convertPoints(50, 'unknown')).toBe('50.00');
    });

    it('should handle decimal values', () => {
      expect(convertPoints(36, 'in')).toBe('0.50');
    });
  });

  describe('hexToRgb', () => {
    it('should convert hex to RGB (with #)', () => {
      const result = hexToRgb('#ff0000');
      expect(result).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('should convert hex to RGB (without #)', () => {
      const result = hexToRgb('00ff00');
      expect(result).toEqual({ r: 0, g: 1, b: 0 });
    });

    it('should handle blue color', () => {
      const result = hexToRgb('#0000ff');
      expect(result).toEqual({ r: 0, g: 0, b: 1 });
    });

    it('should handle white color', () => {
      const result = hexToRgb('#ffffff');
      expect(result).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('should handle black color', () => {
      const result = hexToRgb('#000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle gray color', () => {
      const result = hexToRgb('#808080');
      expect(result.r).toBeCloseTo(0.502, 2);
      expect(result.g).toBeCloseTo(0.502, 2);
      expect(result.b).toBeCloseTo(0.502, 2);
    });

    it('should return black for invalid hex', () => {
      const result = hexToRgb('invalid');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should be case insensitive', () => {
      const result = hexToRgb('#FF0000');
      expect(result).toEqual({ r: 1, g: 0, b: 0 });
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
      expect(formatBytes(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle custom decimal places', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
      expect(formatBytes(1536, 0)).toBe('2 KB');
    });

    it('should handle decimal values', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
    });
  });

  describe('parsePageRanges', () => {
    const totalPages = 10;

    it('should return all pages for empty string', () => {
      const result = parsePageRanges('', totalPages);
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return all pages for whitespace', () => {
      const result = parsePageRanges('   ', totalPages);
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should parse single page', () => {
      const result = parsePageRanges('5', totalPages);
      expect(result).toEqual([4]); // 0-indexed
    });

    it('should parse multiple single pages', () => {
      const result = parsePageRanges('1,3,5', totalPages);
      expect(result).toEqual([0, 2, 4]);
    });

    it('should parse page ranges', () => {
      const result = parsePageRanges('1-3', totalPages);
      expect(result).toEqual([0, 1, 2]);
    });

    it('should parse mixed ranges and single pages', () => {
      const result = parsePageRanges('1,3-5,7', totalPages);
      expect(result).toEqual([0, 2, 3, 4, 6]);
    });

    it('should handle spaces in input', () => {
      const result = parsePageRanges(' 1 , 3 - 5 , 7 ', totalPages);
      expect(result).toEqual([0, 2, 3, 4, 6]);
    });

    it('should remove duplicates and sort', () => {
      const result = parsePageRanges('5,3,5,1-3', totalPages);
      expect(result).toEqual([0, 1, 2, 4]);
    });

    it('should skip invalid page numbers', () => {
      const result = parsePageRanges('0,1,15,5', totalPages);
      expect(result).toEqual([0, 4]); // Only valid pages
    });

    it('should skip invalid ranges', () => {
      const result = parsePageRanges('1-15,3-5', totalPages);
      expect(result).toEqual([2, 3, 4]); // Only 3-5 is valid
    });

    it('should skip ranges where start > end', () => {
      const result = parsePageRanges('5-3,1-2', totalPages);
      expect(result).toEqual([0, 1]); // Only 1-2 is valid
    });

    it('should handle all pages explicitly', () => {
      const result = parsePageRanges('1-10', totalPages);
      expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should skip non-numeric values', () => {
      const result = parsePageRanges('1,abc,5', totalPages);
      expect(result).toEqual([0, 4]);
    });
  });
});
