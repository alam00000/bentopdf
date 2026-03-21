import { PDFDocument } from 'pdf-lib';
import { getPDFDocument } from './helpers.js';
import { loadPyMuPDF } from './pymupdf-loader.js';

export const CONDENSE_PRESETS = {
  light: {
    images: { quality: 90, dpiTarget: 150, dpiThreshold: 200 },
    scrub: { metadata: false, thumbnails: true },
    subsetFonts: true,
  },
  balanced: {
    images: { quality: 75, dpiTarget: 96, dpiThreshold: 150 },
    scrub: { metadata: true, thumbnails: true },
    subsetFonts: true,
  },
  aggressive: {
    images: { quality: 50, dpiTarget: 72, dpiThreshold: 100 },
    scrub: { metadata: true, thumbnails: true, xmlMetadata: true },
    subsetFonts: true,
  },
  extreme: {
    images: { quality: 30, dpiTarget: 60, dpiThreshold: 96 },
    scrub: { metadata: true, thumbnails: true, xmlMetadata: true },
    subsetFonts: true,
  },
};

export const PHOTON_PRESETS = {
  light: { scale: 2.0, quality: 0.85 },
  balanced: { scale: 1.5, quality: 0.65 },
  aggressive: { scale: 1.2, quality: 0.45 },
  extreme: { scale: 1.0, quality: 0.25 },
};

export interface CondenseCustomSettings {
  imageQuality?: number;
  dpiTarget?: number;
  dpiThreshold?: number;
  removeMetadata?: boolean;
  subsetFonts?: boolean;
  convertToGrayscale?: boolean;
  removeThumbnails?: boolean;
}

export async function performCondenseCompression(
  fileBlob: Blob,
  level: string,
  customSettings?: CondenseCustomSettings
) {
  const pymupdf = await loadPyMuPDF();

  const preset =
    CONDENSE_PRESETS[level as keyof typeof CONDENSE_PRESETS] ||
    CONDENSE_PRESETS.balanced;

  const dpiTarget = customSettings?.dpiTarget ?? preset.images.dpiTarget;
  const userThreshold =
    customSettings?.dpiThreshold ?? preset.images.dpiThreshold;
  const dpiThreshold = Math.max(userThreshold, dpiTarget + 10);

  const options = {
    images: {
      enabled: true,
      quality: customSettings?.imageQuality ?? preset.images.quality,
      dpiTarget,
      dpiThreshold,
      convertToGray: customSettings?.convertToGrayscale ?? false,
    },
    scrub: {
      metadata: customSettings?.removeMetadata ?? preset.scrub.metadata,
      thumbnails: customSettings?.removeThumbnails ?? preset.scrub.thumbnails,
      xmlMetadata: (preset.scrub as any).xmlMetadata ?? false,
    },
    subsetFonts: customSettings?.subsetFonts ?? preset.subsetFonts,
    save: {
      garbage: 4 as const,
      deflate: true,
      clean: true,
      useObjstms: true,
    },
  };

  try {
    const result = await pymupdf.compressPdf(fileBlob, options);
    return result;
  } catch {
    const fallbackOptions = {
      ...options,
      images: {
        ...options.images,
        enabled: false,
      },
    };

    try {
      const result = await pymupdf.compressPdf(fileBlob, fallbackOptions);
      return { ...result, usedFallback: true };
    } catch (fallbackError: any) {
      const msg = fallbackError?.message || String(fallbackError);
      throw new Error(`PDF compression failed: ${msg}`);
    }
  }
}

export async function performPhotonCompression(
  arrayBuffer: ArrayBuffer,
  level: string
): Promise<Uint8Array> {
  const pdfJsDoc = await getPDFDocument({ data: arrayBuffer }).promise;
  const newPdfDoc = await PDFDocument.create();
  const settings =
    PHOTON_PRESETS[level as keyof typeof PHOTON_PRESETS] ||
    PHOTON_PRESETS.balanced;

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: settings.scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to create canvas context');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport, canvas: canvas })
      .promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create JPEG blob'));
        },
        'image/jpeg',
        settings.quality
      )
    );

    // Release canvas memory
    canvas.width = 0;
    canvas.height = 0;

    const jpegBytes = await jpegBlob.arrayBuffer();
    const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
  return await newPdfDoc.save();
}
