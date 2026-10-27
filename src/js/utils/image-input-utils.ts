import heic2any from 'heic2any';

import { trText } from '../i18n/i18n.js';

export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.bmp',
  '.gif',
  '.tiff',
  '.tif',
  '.pnm',
  '.pgm',
  '.pbm',
  '.ppm',
  '.pam',
  '.jxr',
  '.jpx',
  '.jp2',
  '.psd',
  '.svg',
  '.heic',
  '.heif',
  '.webp',
] as const;

// TODO@alam00000: Implement image resolution
export const IMAGE_ACCEPT = IMAGE_EXTENSIONS.join(',');

export const IMAGE_FORMATS_LABEL =
  'JPG, PNG, BMP, GIF, TIFF, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2, PSD, SVG, HEIC, WebP';

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

export function isValidImageFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return true;
  }
  return file.type.startsWith('image/');
}

export async function preprocessImageFile(file: File): Promise<File> {
  const ext = getFileExtension(file.name);

  if (ext === '.heic' || ext === '.heif') {
    try {
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.9,
      });
      const blob = Array.isArray(conversionResult)
        ? conversionResult[0]
        : conversionResult;
      return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.png'), {
        type: 'image/png',
      });
    } catch (cause) {
      console.error(`Failed to convert HEIC: ${file.name}`, cause);
      throw new Error(
        trText('Failed to process HEIC file: {{name}}', { name: file.name }),
        { cause }
      );
    }
  }

  if (ext === '.webp') {
    try {
      return await new Promise<File>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error(trText('Canvas context failed')));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.webp$/i, '.png'), {
                  type: 'image/png',
                })
              );
            } else {
              reject(new Error(trText('Canvas toBlob failed')));
            }
          }, 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(trText('Failed to load WebP image')));
        };
        img.src = url;
      });
    } catch (cause) {
      console.error(`Failed to convert WebP: ${file.name}`, cause);
      throw new Error(
        trText('Failed to process WebP file: {{name}}', { name: file.name }),
        { cause }
      );
    }
  }

  return file;
}
