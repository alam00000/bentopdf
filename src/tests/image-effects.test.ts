import { describe, it, expect } from 'vitest';
import {
  rgbToHsl,
  hslToRgb,
  applyGreyscale,
  applyInvertColors,
} from '../js/utils/image-effects';

function createImageData(pixels: number[][]): ImageData {
  const data = new Uint8ClampedArray(pixels.flat());
  return {
    data,
    width: pixels.length,
    height: 1,
    colorSpace: 'srgb',
  } as ImageData;
}

describe('image-effects', () => {
  describe('rgbToHsl', () => {
    it('should convert pure red', () => {
      const [h, s, l] = rgbToHsl(255, 0, 0);
      expect(h).toBeCloseTo(0, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should convert pure green', () => {
      const [h, s, l] = rgbToHsl(0, 255, 0);
      expect(h).toBeCloseTo(1 / 3, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should convert pure blue', () => {
      const [h, s, l] = rgbToHsl(0, 0, 255);
      expect(h).toBeCloseTo(2 / 3, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should convert white', () => {
      const [h, s, l] = rgbToHsl(255, 255, 255);
      expect(h).toBe(0);
      expect(s).toBe(0);
      expect(l).toBeCloseTo(1, 2);
    });

    it('should convert black', () => {
      const [h, s, l] = rgbToHsl(0, 0, 0);
      expect(h).toBe(0);
      expect(s).toBe(0);
      expect(l).toBe(0);
    });

    it('should convert mid gray', () => {
      const [h, s, l] = rgbToHsl(128, 128, 128);
      expect(h).toBe(0);
      expect(s).toBe(0);
      expect(l).toBeCloseTo(0.502, 2);
    });

    it('should convert yellow', () => {
      const [h, s, l] = rgbToHsl(255, 255, 0);
      expect(h).toBeCloseTo(1 / 6, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should convert cyan', () => {
      const [h, s, l] = rgbToHsl(0, 255, 255);
      expect(h).toBeCloseTo(0.5, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should convert magenta', () => {
      const [h, s, l] = rgbToHsl(255, 0, 255);
      expect(h).toBeCloseTo(5 / 6, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.5, 2);
    });

    it('should handle dark colors (l < 0.5)', () => {
      const [h, s, l] = rgbToHsl(128, 0, 0);
      expect(h).toBeCloseTo(0, 2);
      expect(s).toBeCloseTo(1, 2);
      expect(l).toBeCloseTo(0.251, 2);
    });

    it('should handle light colors (l > 0.5)', () => {
      const [_h, s, l] = rgbToHsl(255, 128, 128);
      expect(l).toBeGreaterThan(0.5);
      expect(s).toBeGreaterThan(0);
    });
  });

  describe('hslToRgb', () => {
    it('should convert pure red', () => {
      expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0]);
    });

    it('should convert pure green', () => {
      expect(hslToRgb(1 / 3, 1, 0.5)).toEqual([0, 255, 0]);
    });

    it('should convert pure blue', () => {
      expect(hslToRgb(2 / 3, 1, 0.5)).toEqual([0, 0, 255]);
    });

    it('should convert white', () => {
      expect(hslToRgb(0, 0, 1)).toEqual([255, 255, 255]);
    });

    it('should convert black', () => {
      expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]);
    });

    it('should convert gray (zero saturation)', () => {
      const [r, g, b] = hslToRgb(0, 0, 0.5);
      expect(r).toBe(g);
      expect(g).toBe(b);
      expect(r).toBe(128);
    });

    it('should convert yellow', () => {
      expect(hslToRgb(1 / 6, 1, 0.5)).toEqual([255, 255, 0]);
    });

    it('should convert cyan', () => {
      expect(hslToRgb(0.5, 1, 0.5)).toEqual([0, 255, 255]);
    });

    it('should handle different saturation values', () => {
      const [r1] = hslToRgb(0, 0.5, 0.5);
      const [r2] = hslToRgb(0, 1, 0.5);
      expect(r2).toBeGreaterThan(r1);
    });

    it('should handle l < 0.5 branch', () => {
      const result = hslToRgb(0, 1, 0.25);
      expect(result[0]).toBe(128);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('should handle l >= 0.5 branch', () => {
      const result = hslToRgb(0, 1, 0.75);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(128);
      expect(result[2]).toBe(128);
    });
  });

  describe('rgbToHsl <-> hslToRgb round-trip', () => {
    const testColors: [number, number, number][] = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255],
      [128, 128, 128],
      [200, 100, 50],
      [50, 150, 200],
      [10, 10, 10],
      [245, 245, 245],
    ];

    testColors.forEach(([r, g, b]) => {
      it(`should round-trip rgb(${r}, ${g}, ${b})`, () => {
        const [h, s, l] = rgbToHsl(r, g, b);
        const [r2, g2, b2] = hslToRgb(h, s, l);
        expect(r2).toBeCloseTo(r, 0);
        expect(g2).toBeCloseTo(g, 0);
        expect(b2).toBeCloseTo(b, 0);
      });
    });
  });

  describe('applyGreyscale', () => {
    it('should convert colored pixel to grey using luminance weights', () => {
      const imageData = createImageData([[255, 0, 0, 255]]);
      applyGreyscale(imageData);
      const expected = Math.round(0.299 * 255);
      expect(imageData.data[0]).toBe(expected);
      expect(imageData.data[1]).toBe(expected);
      expect(imageData.data[2]).toBe(expected);
      expect(imageData.data[3]).toBe(255);
    });

    it('should keep white as white', () => {
      const imageData = createImageData([[255, 255, 255, 255]]);
      applyGreyscale(imageData);
      expect(imageData.data[0]).toBe(255);
      expect(imageData.data[1]).toBe(255);
      expect(imageData.data[2]).toBe(255);
    });

    it('should keep black as black', () => {
      const imageData = createImageData([[0, 0, 0, 255]]);
      applyGreyscale(imageData);
      expect(imageData.data[0]).toBe(0);
      expect(imageData.data[1]).toBe(0);
      expect(imageData.data[2]).toBe(0);
    });

    it('should process multiple pixels', () => {
      const imageData = createImageData([
        [255, 0, 0, 255],
        [0, 255, 0, 255],
        [0, 0, 255, 255],
      ]);
      applyGreyscale(imageData);
      expect(imageData.data[0]).toBe(imageData.data[1]);
      expect(imageData.data[4]).toBe(imageData.data[5]);
      expect(imageData.data[8]).toBe(imageData.data[9]);
    });

    it('should not modify alpha channel', () => {
      const imageData = createImageData([[100, 150, 200, 128]]);
      applyGreyscale(imageData);
      expect(imageData.data[3]).toBe(128);
    });
  });

  describe('applyInvertColors', () => {
    it('should invert black to white', () => {
      const imageData = createImageData([[0, 0, 0, 255]]);
      applyInvertColors(imageData);
      expect(imageData.data[0]).toBe(255);
      expect(imageData.data[1]).toBe(255);
      expect(imageData.data[2]).toBe(255);
    });

    it('should invert white to black', () => {
      const imageData = createImageData([[255, 255, 255, 255]]);
      applyInvertColors(imageData);
      expect(imageData.data[0]).toBe(0);
      expect(imageData.data[1]).toBe(0);
      expect(imageData.data[2]).toBe(0);
    });

    it('should invert mid-range colors', () => {
      const imageData = createImageData([[100, 150, 200, 255]]);
      applyInvertColors(imageData);
      expect(imageData.data[0]).toBe(155);
      expect(imageData.data[1]).toBe(105);
      expect(imageData.data[2]).toBe(55);
    });

    it('should not modify alpha channel', () => {
      const imageData = createImageData([[100, 150, 200, 128]]);
      applyInvertColors(imageData);
      expect(imageData.data[3]).toBe(128);
    });

    it('should be its own inverse (double invert = original)', () => {
      const imageData = createImageData([[42, 128, 200, 255]]);
      applyInvertColors(imageData);
      applyInvertColors(imageData);
      expect(imageData.data[0]).toBe(42);
      expect(imageData.data[1]).toBe(128);
      expect(imageData.data[2]).toBe(200);
    });

    it('should process multiple pixels', () => {
      const imageData = createImageData([
        [0, 0, 0, 255],
        [255, 255, 255, 255],
      ]);
      applyInvertColors(imageData);
      expect(imageData.data[0]).toBe(255);
      expect(imageData.data[4]).toBe(0);
    });
  });
});
