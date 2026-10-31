import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { preprocessImageFile } from './image-input-utils.js';

import { trText } from '../i18n/i18n.js';

export interface EmbeddableImage {
  bytes: Uint8Array;
  format: 'jpg' | 'png';
}

export async function normalizeImageToEmbeddable(
  file: File
): Promise<EmbeddableImage> {
  const processed = await preprocessImageFile(file);
  const name = processed.name.toLowerCase();
  const isJpg =
    processed.type === 'image/jpeg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg');
  const isPng = processed.type === 'image/png' || name.endsWith('.png');

  if (isJpg) {
    return {
      bytes: new Uint8Array(await processed.arrayBuffer()),
      format: 'jpg',
    };
  }
  if (isPng) {
    return {
      bytes: new Uint8Array(await processed.arrayBuffer()),
      format: 'png',
    };
  }

  const url = URL.createObjectURL(processed);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () =>
        reject(
          new Error(
            trText('Failed to decode image: {{name}}', { name: processed.name })
          )
        );
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(trText('Canvas context unavailable'));
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error(trText('Canvas toBlob failed'))),
        'image/png'
      );
    });
    return { bytes: new Uint8Array(await blob.arrayBuffer()), format: 'png' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function convertImagesToPdfFile(images: File[]): Promise<File> {
  const pdfDoc = await PDFLibDocument.create();
  for (const img of images) {
    const { bytes, format } = await normalizeImageToEmbeddable(img);
    const embedded =
      format === 'jpg'
        ? await pdfDoc.embedJpg(bytes)
        : await pdfDoc.embedPng(bytes);
    const page = pdfDoc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }
  const pdfBytes = await pdfDoc.save();
  const filename =
    images.length === 1
      ? images[0].name.replace(/\.[^.]+$/, '.pdf')
      : `images-${Date.now()}.pdf`;
  return new File([new Uint8Array(pdfBytes)], filename, {
    type: 'application/pdf',
  });
}
