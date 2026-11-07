import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('heic2any', () => ({
  default: vi.fn(async ({ blob }: { blob: Blob }) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return new Blob([bytes], { type: 'image/png' });
  }),
}));

import heic2any from 'heic2any';
import {
  IMAGE_EXTENSIONS,
  IMAGE_ACCEPT,
  IMAGE_FORMATS_LABEL,
  getFileExtension,
  isValidImageFile,
  preprocessImageFile,
} from '@/js/utils/image-input-utils';

describe('image-input-utils', () => {
  describe('IMAGE_EXTENSIONS', () => {
    it('includes HEIC, HEIF and WebP', () => {
      expect(IMAGE_EXTENSIONS).toContain('.heic');
      expect(IMAGE_EXTENSIONS).toContain('.heif');
      expect(IMAGE_EXTENSIONS).toContain('.webp');
    });

    it('includes core raster formats', () => {
      expect(IMAGE_EXTENSIONS).toContain('.jpg');
      expect(IMAGE_EXTENSIONS).toContain('.jpeg');
      expect(IMAGE_EXTENSIONS).toContain('.png');
      expect(IMAGE_EXTENSIONS).toContain('.bmp');
      expect(IMAGE_EXTENSIONS).toContain('.tiff');
    });
  });

  describe('IMAGE_ACCEPT', () => {
    it('is a comma-joined extension list usable as input.accept', () => {
      expect(IMAGE_ACCEPT).toContain('.heic');
      expect(IMAGE_ACCEPT).toContain('.png');
      expect(IMAGE_ACCEPT.split(',')).toEqual(Array.from(IMAGE_EXTENSIONS));
    });
  });

  describe('IMAGE_FORMATS_LABEL', () => {
    it('mentions HEIC and WebP', () => {
      expect(IMAGE_FORMATS_LABEL).toContain('HEIC');
      expect(IMAGE_FORMATS_LABEL).toContain('WebP');
    });
  });

  describe('getFileExtension', () => {
    it('returns lowercased extension with leading dot', () => {
      expect(getFileExtension('photo.HEIC')).toBe('.heic');
      expect(getFileExtension('a.JPG')).toBe('.jpg');
    });

    it('returns empty string when no dot present', () => {
      expect(getFileExtension('Makefile')).toBe('');
    });

    it('handles multiple dots', () => {
      expect(getFileExtension('my.photo.heic')).toBe('.heic');
    });
  });

  describe('isValidImageFile', () => {
    it('accepts .heic file with empty MIME type (Chromium on Windows)', () => {
      const file = new File([new Uint8Array(8)], 'IMG_0001.HEIC', {
        type: '',
      });
      expect(isValidImageFile(file)).toBe(true);
    });

    it('accepts .heif file with empty MIME type', () => {
      const file = new File([new Uint8Array(8)], 'IMG_0001.heif', {
        type: '',
      });
      expect(isValidImageFile(file)).toBe(true);
    });

    it('accepts .webp file with empty MIME type', () => {
      const file = new File([new Uint8Array(8)], 'pic.webp', { type: '' });
      expect(isValidImageFile(file)).toBe(true);
    });

    it('accepts .png file with proper MIME', () => {
      const file = new File([new Uint8Array(8)], 'pic.png', {
        type: 'image/png',
      });
      expect(isValidImageFile(file)).toBe(true);
    });

    it('accepts file by MIME prefix even without known extension', () => {
      const file = new File([new Uint8Array(8)], 'mystery', {
        type: 'image/avif',
      });
      expect(isValidImageFile(file)).toBe(true);
    });

    it('rejects non-image files', () => {
      const file = new File([new Uint8Array(8)], 'doc.pdf', {
        type: 'application/pdf',
      });
      expect(isValidImageFile(file)).toBe(false);
    });

    it('rejects unknown extension with empty MIME', () => {
      const file = new File([new Uint8Array(8)], 'data.bin', { type: '' });
      expect(isValidImageFile(file)).toBe(false);
    });
  });

  describe('preprocessImageFile', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns original file unchanged for .png', async () => {
      const file = new File([new Uint8Array([1, 2, 3])], 'a.png', {
        type: 'image/png',
      });
      const result = await preprocessImageFile(file);
      expect(result).toBe(file);
      expect(heic2any).not.toHaveBeenCalled();
    });

    it('returns original file unchanged for .jpg', async () => {
      const file = new File([new Uint8Array([1, 2, 3])], 'a.jpg', {
        type: 'image/jpeg',
      });
      const result = await preprocessImageFile(file);
      expect(result).toBe(file);
    });

    it('converts .heic file to .png via heic2any', async () => {
      const file = new File([new Uint8Array([1, 2, 3])], 'IMG.heic', {
        type: '',
      });
      const result = await preprocessImageFile(file);
      expect(heic2any).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('IMG.png');
      expect(result.type).toBe('image/png');
    });

    it('converts .HEIC (uppercase) and renames to .png', async () => {
      const file = new File([new Uint8Array([1, 2, 3])], 'PHOTO.HEIC', {
        type: '',
      });
      const result = await preprocessImageFile(file);
      expect(result.name).toBe('PHOTO.png');
    });

    it('converts .heif file to .png', async () => {
      const file = new File([new Uint8Array([1, 2, 3])], 'photo.heif', {
        type: '',
      });
      const result = await preprocessImageFile(file);
      expect(heic2any).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('photo.png');
    });

    it('wraps heic2any errors with the offending filename', async () => {
      vi.mocked(heic2any).mockRejectedValueOnce(new Error('corrupt header'));
      const file = new File([new Uint8Array([1, 2, 3])], 'broken.heic', {
        type: '',
      });
      await expect(preprocessImageFile(file)).rejects.toThrow(
        /تعذرت معالجة ملف HEIC: broken\.heic/
      );
    });
  });
});
