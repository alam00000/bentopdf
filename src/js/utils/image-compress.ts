export type ImageQuality = 'high' | 'medium' | 'low';

interface QualityConfig {
  jpegQuality: number;
  maxDimension: number;
}

const QUALITY_CONFIGS: Record<ImageQuality, QualityConfig> = {
  high: { jpegQuality: 0.92, maxDimension: 0 },
  medium: { jpegQuality: 0.75, maxDimension: 2500 },
  low: { jpegQuality: 0.5, maxDimension: 1500 },
};

export function getSelectedQuality(): ImageQuality {
  const select = document.getElementById(
    'jpg-pdf-quality'
  ) as HTMLSelectElement | null;
  const value = select?.value;
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return 'medium';
}

export async function compressImageFile(
  file: File,
  quality: ImageQuality
): Promise<File> {
  if (quality === 'high') return file;

  const config = QUALITY_CONFIGS[quality];

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (
        config.maxDimension > 0 &&
        (width > config.maxDimension || height > config.maxDimension)
      ) {
        const ratio = Math.min(
          config.maxDimension / width,
          config.maxDimension / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context failed'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        config.jpegQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export async function compressImageBytes(
  bytes: Uint8Array | ArrayBuffer,
  quality: ImageQuality
): Promise<{ bytes: Uint8Array; type: 'jpeg' | 'png' }> {
  if (quality === 'high') {
    return {
      bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
      type: 'png',
    };
  }

  const config = QUALITY_CONFIGS[quality];

  return new Promise((resolve, reject) => {
    const blob = new Blob([new Uint8Array(bytes)]);
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (
        config.maxDimension > 0 &&
        (width > config.maxDimension || height > config.maxDimension)
      ) {
        const ratio = Math.min(
          config.maxDimension / width,
          config.maxDimension / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context failed'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        async (jpegBlob) => {
          if (!jpegBlob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const arrayBuffer = await jpegBlob.arrayBuffer();
          resolve({ bytes: new Uint8Array(arrayBuffer), type: 'jpeg' });
        },
        'image/jpeg',
        config.jpegQuality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
        type: 'png',
      });
    };

    img.src = url;
  });
}
