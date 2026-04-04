import { describe, it, expect } from 'vitest';
import { tiffIfdToRgba } from '../js/utils/tiff-utils';

describe('tiffIfdToRgba', () => {
  describe('RGB (3 channels)', () => {
    it('converts RGB data to RGBA with full opacity', () => {
      const src = new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255]);
      const result = tiffIfdToRgba(src, 3, 1, 3, 2);
      expect(Array.from(result)).toEqual([
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255,
      ]);
    });

    it('handles a 2x2 RGB image', () => {
      const src = new Uint8Array([
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
      ]);
      const result = tiffIfdToRgba(src, 2, 2, 3, 2);
      expect(result.length).toBe(16);
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(20);
      expect(result[2]).toBe(30);
      expect(result[3]).toBe(255);
      expect(result[4]).toBe(40);
      expect(result[5]).toBe(50);
      expect(result[6]).toBe(60);
      expect(result[7]).toBe(255);
    });
  });

  describe('RGBA (4 channels)', () => {
    it('copies all 4 channels directly', () => {
      const src = new Uint8Array([255, 128, 64, 200, 0, 0, 0, 0]);
      const result = tiffIfdToRgba(src, 2, 1, 4, 2);
      expect(Array.from(result)).toEqual([255, 128, 64, 200, 0, 0, 0, 0]);
    });

    it('preserves alpha = 0 (fully transparent)', () => {
      const src = new Uint8Array([100, 100, 100, 0]);
      const result = tiffIfdToRgba(src, 1, 1, 4, 2);
      expect(result[3]).toBe(0);
    });

    it('preserves alpha = 255 (fully opaque)', () => {
      const src = new Uint8Array([100, 100, 100, 255]);
      const result = tiffIfdToRgba(src, 1, 1, 4, 2);
      expect(result[3]).toBe(255);
    });
  });

  describe('Grayscale (1 channel)', () => {
    it('expands grayscale to RGB with full opacity', () => {
      const src = new Uint8Array([128]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 1);
      expect(Array.from(result)).toEqual([128, 128, 128, 255]);
    });

    it('handles black pixel', () => {
      const src = new Uint8Array([0]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 1);
      expect(Array.from(result)).toEqual([0, 0, 0, 255]);
    });

    it('handles white pixel', () => {
      const src = new Uint8Array([255]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 1);
      expect(Array.from(result)).toEqual([255, 255, 255, 255]);
    });

    it('handles multiple grayscale pixels', () => {
      const src = new Uint8Array([0, 128, 255]);
      const result = tiffIfdToRgba(src, 3, 1, 1, 1);
      expect(result.length).toBe(12);
      expect(result[0]).toBe(0);
      expect(result[4]).toBe(128);
      expect(result[8]).toBe(255);
      expect(result[3]).toBe(255);
      expect(result[7]).toBe(255);
      expect(result[11]).toBe(255);
    });
  });

  describe('Grayscale + Alpha (2 channels)', () => {
    it('expands grayscale and copies alpha', () => {
      const src = new Uint8Array([200, 100]);
      const result = tiffIfdToRgba(src, 1, 1, 2, 1);
      expect(Array.from(result)).toEqual([200, 200, 200, 100]);
    });

    it('handles fully transparent grayscale', () => {
      const src = new Uint8Array([255, 0]);
      const result = tiffIfdToRgba(src, 1, 1, 2, 1);
      expect(result[3]).toBe(0);
    });
  });

  describe('WhiteIsZero (photometric type 0)', () => {
    it('inverts grayscale values', () => {
      const src = new Uint8Array([0]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 0);
      expect(Array.from(result)).toEqual([255, 255, 255, 255]);
    });

    it('inverts mid-gray', () => {
      const src = new Uint8Array([200]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 0);
      expect(result[0]).toBe(55);
      expect(result[1]).toBe(55);
      expect(result[2]).toBe(55);
    });

    it('inverts white to black', () => {
      const src = new Uint8Array([255]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 0);
      expect(Array.from(result)).toEqual([0, 0, 0, 255]);
    });

    it('does not invert alpha in grayscale+alpha', () => {
      const src = new Uint8Array([0, 128]);
      const result = tiffIfdToRgba(src, 1, 1, 2, 0);
      expect(result[0]).toBe(255);
      expect(result[3]).toBe(128);
    });

    it('does not affect RGB images', () => {
      const src = new Uint8Array([100, 150, 200]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 0);
      expect(result[0]).toBe(100);
      expect(result[1]).toBe(150);
      expect(result[2]).toBe(200);
    });
  });

  describe('16-bit images', () => {
    it('normalizes 16-bit RGB to 8-bit', () => {
      const src = new Uint16Array([65535, 0, 32768]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(128);
      expect(result[3]).toBe(255);
    });

    it('normalizes 16-bit grayscale to 8-bit', () => {
      const src = new Uint16Array([65535]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 1);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(255);
      expect(result[2]).toBe(255);
    });

    it('handles 16-bit zero values', () => {
      const src = new Uint16Array([0, 0, 0]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(0);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });

    it('normalizes 16-bit RGBA including alpha', () => {
      const src = new Uint16Array([65535, 32768, 0, 49152]);
      const result = tiffIfdToRgba(src, 1, 1, 4, 2);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(128);
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(192);
    });
  });

  describe('Float32 images', () => {
    it('normalizes float RGB (0.0-1.0) to 8-bit', () => {
      const src = new Float32Array([1.0, 0.0, 0.5]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(128);
      expect(result[3]).toBe(255);
    });

    it('clamps float values above 1.0', () => {
      const src = new Float32Array([1.5, 0.0, 0.0]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(255);
    });

    it('clamps float values below 0.0', () => {
      const src = new Float32Array([-0.5, 0.0, 0.0]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(0);
    });

    it('normalizes float grayscale', () => {
      const src = new Float32Array([0.5]);
      const result = tiffIfdToRgba(src, 1, 1, 1, 1);
      expect(result[0]).toBe(128);
      expect(result[1]).toBe(128);
      expect(result[2]).toBe(128);
    });
  });

  describe('Float64 images', () => {
    it('normalizes float64 RGB to 8-bit', () => {
      const src = new Float64Array([1.0, 0.5, 0.0]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result[0]).toBe(255);
      expect(result[1]).toBe(128);
      expect(result[2]).toBe(0);
    });
  });

  describe('output buffer size', () => {
    it('always outputs width * height * 4 bytes', () => {
      const src1 = new Uint8Array([100, 200, 50]);
      expect(tiffIfdToRgba(src1, 1, 1, 3, 2).length).toBe(4);

      const src2 = new Uint8Array([100]);
      expect(tiffIfdToRgba(src2, 1, 1, 1, 1).length).toBe(4);

      const src3 = new Uint8Array(new Array(12).fill(128));
      expect(tiffIfdToRgba(src3, 2, 2, 3, 2).length).toBe(16);
    });

    it('returns Uint8ClampedArray', () => {
      const src = new Uint8Array([0, 0, 0]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });
  });

  describe('edge cases', () => {
    it('handles 1x1 pixel image', () => {
      const src = new Uint8Array([42, 84, 126]);
      const result = tiffIfdToRgba(src, 1, 1, 3, 2);
      expect(Array.from(result)).toEqual([42, 84, 126, 255]);
    });

    it('handles 5+ channel images (uses first 4)', () => {
      const src = new Uint8Array([10, 20, 30, 40, 99]);
      const result = tiffIfdToRgba(src, 1, 1, 5, 2);
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(20);
      expect(result[2]).toBe(30);
      expect(result[3]).toBe(40);
    });
  });
});
