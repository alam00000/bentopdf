import { describe, it, expect } from 'vitest';
import {
  parseBBox,
  parseBaseline,
  parseTextangle,
  getTextDirection,
  shouldInjectWordBreaks,
  normalizeText,
  calculateWordTransform,
  calculateSpaceTransform,
} from '../js/utils/hocr-transform';
import type { OcrWord } from '@/types';

describe('hocr-transform', () => {
  describe('parseBBox', () => {
    it('should parse valid bbox string', () => {
      expect(parseBBox('bbox 100 200 300 400')).toEqual({
        x0: 100,
        y0: 200,
        x1: 300,
        y1: 400,
      });
    });

    it('should parse bbox with other attributes', () => {
      expect(parseBBox('bbox 10 20 30 40; x_wconf 95')).toEqual({
        x0: 10,
        y0: 20,
        x1: 30,
        y1: 40,
      });
    });

    it('should return null for missing bbox', () => {
      expect(parseBBox('x_wconf 95')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseBBox('')).toBeNull();
    });

    it('should parse zero values', () => {
      expect(parseBBox('bbox 0 0 0 0')).toEqual({
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
      });
    });

    it('should parse large coordinates', () => {
      expect(parseBBox('bbox 0 0 2480 3508')).toEqual({
        x0: 0,
        y0: 0,
        x1: 2480,
        y1: 3508,
      });
    });
  });

  describe('parseBaseline', () => {
    it('should parse valid baseline', () => {
      expect(parseBaseline('baseline 0.012 -5')).toEqual({
        slope: 0.012,
        intercept: -5,
      });
    });

    it('should parse zero baseline', () => {
      expect(parseBaseline('baseline 0 0')).toEqual({
        slope: 0,
        intercept: 0,
      });
    });

    it('should parse negative slope', () => {
      expect(parseBaseline('baseline -0.005 3')).toEqual({
        slope: -0.005,
        intercept: 3,
      });
    });

    it('should return defaults for missing baseline', () => {
      expect(parseBaseline('bbox 100 200 300 400')).toEqual({
        slope: 0,
        intercept: 0,
      });
    });

    it('should return defaults for empty string', () => {
      expect(parseBaseline('')).toEqual({
        slope: 0,
        intercept: 0,
      });
    });

    it('should handle baseline with other attributes', () => {
      expect(parseBaseline('bbox 10 20 30 40; baseline 0.1 -2')).toEqual({
        slope: 0.1,
        intercept: -2,
      });
    });
  });

  describe('parseTextangle', () => {
    it('should parse valid textangle', () => {
      expect(parseTextangle('textangle 90')).toBe(90);
    });

    it('should parse float textangle', () => {
      expect(parseTextangle('textangle 1.5')).toBe(1.5);
    });

    it('should parse negative textangle', () => {
      expect(parseTextangle('textangle -45')).toBe(-45);
    });

    it('should return 0 for missing textangle', () => {
      expect(parseTextangle('bbox 0 0 100 100')).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(parseTextangle('')).toBe(0);
    });

    it('should parse zero textangle', () => {
      expect(parseTextangle('textangle 0')).toBe(0);
    });
  });

  describe('getTextDirection', () => {
    it('should return rtl for dir="rtl" attribute', () => {
      const el = document.createElement('div');
      el.setAttribute('dir', 'rtl');
      expect(getTextDirection(el)).toBe('rtl');
    });

    it('should return ltr for dir="ltr" attribute', () => {
      const el = document.createElement('div');
      el.setAttribute('dir', 'ltr');
      expect(getTextDirection(el)).toBe('ltr');
    });

    it('should default to ltr when no dir attribute', () => {
      const el = document.createElement('div');
      expect(getTextDirection(el)).toBe('ltr');
    });

    it('should default to ltr for unknown dir values', () => {
      const el = document.createElement('div');
      el.setAttribute('dir', 'auto');
      expect(getTextDirection(el)).toBe('ltr');
    });
  });

  describe('shouldInjectWordBreaks', () => {
    it('should return true for English', () => {
      const el = document.createElement('div');
      el.setAttribute('lang', 'eng');
      expect(shouldInjectWordBreaks(el)).toBe(true);
    });

    it('should return true for no lang attribute', () => {
      const el = document.createElement('div');
      expect(shouldInjectWordBreaks(el)).toBe(true);
    });

    it('should return false for CJK languages', () => {
      const cjkLangs = ['chi_sim', 'chi_tra', 'jpn', 'kor', 'zh', 'ja', 'ko'];
      cjkLangs.forEach((lang) => {
        const el = document.createElement('div');
        el.setAttribute('lang', lang);
        expect(shouldInjectWordBreaks(el)).toBe(false);
      });
    });

    it('should return true for non-CJK languages', () => {
      const langs = ['fra', 'deu', 'spa', 'ara', 'hin'];
      langs.forEach((lang) => {
        const el = document.createElement('div');
        el.setAttribute('lang', lang);
        expect(shouldInjectWordBreaks(el)).toBe(true);
      });
    });
  });

  describe('normalizeText', () => {
    it('should normalize NFKC', () => {
      expect(normalizeText('\ufb01')).toBe('fi');
    });

    it('should keep ASCII text unchanged', () => {
      expect(normalizeText('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(normalizeText('')).toBe('');
    });

    it('should normalize full-width characters', () => {
      expect(normalizeText('\uff21')).toBe('A');
    });

    it('should normalize superscript digits', () => {
      expect(normalizeText('\u00b2')).toBe('2');
    });
  });

  describe('calculateWordTransform', () => {
    const baseLine = {
      bbox: { x0: 0, y0: 100, x1: 500, y1: 130 },
      baseline: { slope: 0, intercept: 0 },
      textangle: 0,
      words: [] as OcrWord[],
      direction: 'ltr' as const,
      injectWordBreaks: true,
    };

    it('should calculate position and font size', () => {
      const word = {
        text: 'Hello',
        bbox: { x0: 10, y0: 100, x1: 60, y1: 120 },
        confidence: 95,
      };
      const fontWidthFn = (_text: string, fontSize: number) => fontSize * 2.5;

      const result = calculateWordTransform(word, baseLine, 800, fontWidthFn);

      expect(result.x).toBe(10);
      expect(result.y).toBe(680);
      expect(result.fontSize).toBeGreaterThan(0);
      expect(result.horizontalScale).toBeGreaterThan(0);
    });

    it('should clamp font size to max 2x word height', () => {
      const word = {
        text: 'x',
        bbox: { x0: 0, y0: 0, x1: 1000, y1: 10 },
        confidence: 95,
      };
      const fontWidthFn = (_text: string, _fontSize: number) => 0.001;

      const result = calculateWordTransform(word, baseLine, 800, fontWidthFn);
      expect(result.fontSize).toBeLessThanOrEqual(20);
    });

    it('should clamp font size to minimum 1', () => {
      const word = {
        text: 'x',
        bbox: { x0: 0, y0: 0, x1: 1, y1: 10 },
        confidence: 95,
      };
      const fontWidthFn = (_text: string, _fontSize: number) => 10000;

      const result = calculateWordTransform(word, baseLine, 800, fontWidthFn);
      expect(result.fontSize).toBeGreaterThanOrEqual(1);
    });

    it('should handle zero font width gracefully', () => {
      const word = {
        text: '',
        bbox: { x0: 0, y0: 0, x1: 50, y1: 20 },
        confidence: 95,
      };
      const fontWidthFn = () => 0;

      const result = calculateWordTransform(word, baseLine, 800, fontWidthFn);
      expect(result.horizontalScale).toBe(1);
    });

    it('should incorporate baseline slope into rotation', () => {
      const slopedLine = {
        ...baseLine,
        baseline: { slope: 0.1, intercept: 0 },
      };
      const word = {
        text: 'Hi',
        bbox: { x0: 10, y0: 100, x1: 40, y1: 115 },
        confidence: 90,
      };
      const fontWidthFn = (_text: string, fontSize: number) => fontSize * 1.5;

      const result = calculateWordTransform(word, slopedLine, 800, fontWidthFn);
      expect(result.rotation).not.toBe(0);
    });

    it('should incorporate textangle into rotation', () => {
      const angledLine = { ...baseLine, textangle: 5 };
      const word = {
        text: 'Hi',
        bbox: { x0: 10, y0: 100, x1: 40, y1: 115 },
        confidence: 90,
      };
      const fontWidthFn = (_text: string, fontSize: number) => fontSize * 1.5;

      const result = calculateWordTransform(word, angledLine, 800, fontWidthFn);
      expect(result.rotation).toBe(-5);
    });
  });

  describe('calculateSpaceTransform', () => {
    const baseLine = {
      bbox: { x0: 0, y0: 100, x1: 500, y1: 130 },
      baseline: { slope: 0, intercept: 0 },
      textangle: 0,
      words: [] as OcrWord[],
      direction: 'ltr' as const,
      injectWordBreaks: true,
    };

    it('should calculate space between two words', () => {
      const prev = {
        text: 'Hello',
        bbox: { x0: 10, y0: 100, x1: 60, y1: 120 },
        confidence: 95,
      };
      const next = {
        text: 'World',
        bbox: { x0: 70, y0: 100, x1: 130, y1: 120 },
        confidence: 95,
      };
      const spaceWidthFn = (fontSize: number) => fontSize * 0.3;

      const result = calculateSpaceTransform(
        prev,
        next,
        baseLine,
        800,
        spaceWidthFn
      );
      expect(result).not.toBeNull();
      expect(result!.x).toBe(60);
      expect(result!.horizontalScale).toBeGreaterThan(0);
    });

    it('should return null when gap is zero or negative', () => {
      const prev = {
        text: 'Hello',
        bbox: { x0: 10, y0: 100, x1: 60, y1: 120 },
        confidence: 95,
      };
      const next = {
        text: 'World',
        bbox: { x0: 60, y0: 100, x1: 120, y1: 120 },
        confidence: 95,
      };
      const spaceWidthFn = (fontSize: number) => fontSize * 0.3;

      expect(
        calculateSpaceTransform(prev, next, baseLine, 800, spaceWidthFn)
      ).toBeNull();
    });

    it('should return null when overlapping words', () => {
      const prev = {
        text: 'Hello',
        bbox: { x0: 10, y0: 100, x1: 80, y1: 120 },
        confidence: 95,
      };
      const next = {
        text: 'World',
        bbox: { x0: 70, y0: 100, x1: 130, y1: 120 },
        confidence: 95,
      };
      const spaceWidthFn = (fontSize: number) => fontSize * 0.3;

      expect(
        calculateSpaceTransform(prev, next, baseLine, 800, spaceWidthFn)
      ).toBeNull();
    });

    it('should return null when space width function returns 0', () => {
      const prev = {
        text: 'Hello',
        bbox: { x0: 10, y0: 100, x1: 60, y1: 120 },
        confidence: 95,
      };
      const next = {
        text: 'World',
        bbox: { x0: 70, y0: 100, x1: 130, y1: 120 },
        confidence: 95,
      };

      expect(
        calculateSpaceTransform(prev, next, baseLine, 800, () => 0)
      ).toBeNull();
    });

    it('should account for baseline intercept in y position', () => {
      const lineWithIntercept = {
        ...baseLine,
        baseline: { slope: 0, intercept: -5 },
      };
      const prev = {
        text: 'A',
        bbox: { x0: 0, y0: 100, x1: 20, y1: 130 },
        confidence: 90,
      };
      const next = {
        text: 'B',
        bbox: { x0: 30, y0: 100, x1: 50, y1: 130 },
        confidence: 90,
      };
      const spaceWidthFn = (fontSize: number) => fontSize * 0.3;

      const result = calculateSpaceTransform(
        prev,
        next,
        lineWithIntercept,
        800,
        spaceWidthFn
      );
      expect(result).not.toBeNull();
      expect(result!.y).toBe(800 - 130 - -5);
    });

    it('should use line height + intercept for font size', () => {
      const prev = {
        text: 'A',
        bbox: { x0: 0, y0: 100, x1: 20, y1: 130 },
        confidence: 90,
      };
      const next = {
        text: 'B',
        bbox: { x0: 30, y0: 100, x1: 50, y1: 130 },
        confidence: 90,
      };
      const spaceWidthFn = (fontSize: number) => fontSize * 0.3;

      const result = calculateSpaceTransform(
        prev,
        next,
        baseLine,
        800,
        spaceWidthFn
      );
      expect(result).not.toBeNull();
      expect(result!.fontSize).toBe(30);
    });
  });
});
