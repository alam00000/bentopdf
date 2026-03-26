import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { loadPdfDocument } from './load-pdf-document.js';

export async function mergePdfs(
  pdfBytesList: Uint8Array[]
): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();
  for (const bytes of pdfBytesList) {
    const srcDoc = await loadPdfDocument(bytes);
    const copiedPages = await mergedDoc.copyPages(
      srcDoc,
      srcDoc.getPageIndices()
    );
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }
  return new Uint8Array(await mergedDoc.save({ addDefaultPage: false }));
}

export async function splitPdf(
  pdfBytes: Uint8Array,
  pageIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await loadPdfDocument(pdfBytes);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return new Uint8Array(await newPdf.save());
}

export async function rotatePdfUniform(
  pdfBytes: Uint8Array,
  angle: number
): Promise<Uint8Array> {
  const srcDoc = await loadPdfDocument(pdfBytes);
  const newPdfDoc = await PDFDocument.create();
  const pageCount = srcDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const originalPage = srcDoc.getPage(i);
    const currentRotation = originalPage.getRotation().angle;
    const totalRotation = currentRotation + angle;

    if (totalRotation % 90 === 0) {
      const [copiedPage] = await newPdfDoc.copyPages(srcDoc, [i]);
      copiedPage.setRotation(degrees(totalRotation));
      newPdfDoc.addPage(copiedPage);
    } else {
      const embeddedPage = await newPdfDoc.embedPage(originalPage);
      const { width, height } = embeddedPage.scale(1);
      const angleRad = (totalRotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(angleRad));
      const absSin = Math.abs(Math.sin(angleRad));
      const newWidth = width * absCos + height * absSin;
      const newHeight = width * absSin + height * absCos;
      const newPage = newPdfDoc.addPage([newWidth, newHeight]);
      const x =
        newWidth / 2 -
        ((width / 2) * Math.cos(angleRad) - (height / 2) * Math.sin(angleRad));
      const y =
        newHeight / 2 -
        ((width / 2) * Math.sin(angleRad) + (height / 2) * Math.cos(angleRad));
      newPage.drawPage(embeddedPage, {
        x,
        y,
        width,
        height,
        rotate: degrees(totalRotation),
      });
    }
  }

  return new Uint8Array(await newPdfDoc.save());
}

export async function rotatePdfPages(
  pdfBytes: Uint8Array,
  rotations: number[]
): Promise<Uint8Array> {
  const srcDoc = await loadPdfDocument(pdfBytes);
  const newPdfDoc = await PDFDocument.create();
  const pageCount = srcDoc.getPageCount();

  for (let i = 0; i < pageCount; i++) {
    const rotation = rotations[i] || 0;
    const originalPage = srcDoc.getPage(i);
    const currentRotation = originalPage.getRotation().angle;
    const totalRotation = currentRotation + rotation;

    if (totalRotation % 90 === 0) {
      const [copiedPage] = await newPdfDoc.copyPages(srcDoc, [i]);
      copiedPage.setRotation(degrees(totalRotation));
      newPdfDoc.addPage(copiedPage);
    } else {
      const embeddedPage = await newPdfDoc.embedPage(originalPage);
      const { width, height } = embeddedPage.scale(1);
      const angleRad = (totalRotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(angleRad));
      const absSin = Math.abs(Math.sin(angleRad));
      const newWidth = width * absCos + height * absSin;
      const newHeight = width * absSin + height * absCos;
      const newPage = newPdfDoc.addPage([newWidth, newHeight]);
      const x =
        newWidth / 2 -
        ((width / 2) * Math.cos(angleRad) - (height / 2) * Math.sin(angleRad));
      const y =
        newHeight / 2 -
        ((width / 2) * Math.sin(angleRad) + (height / 2) * Math.cos(angleRad));
      newPage.drawPage(embeddedPage, {
        x,
        y,
        width,
        height,
        rotate: degrees(totalRotation),
      });
    }
  }

  return new Uint8Array(await newPdfDoc.save());
}

export async function deletePdfPages(
  pdfBytes: Uint8Array,
  pagesToDelete: Set<number>
): Promise<Uint8Array> {
  const srcDoc = await loadPdfDocument(pdfBytes);
  const totalPages = srcDoc.getPageCount();

  const pagesToKeep: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (!pagesToDelete.has(i + 1)) {
      pagesToKeep.push(i);
    }
  }

  if (pagesToKeep.length === 0) throw new Error('Cannot delete all pages');

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcDoc, pagesToKeep);
  copiedPages.forEach((page) => newPdf.addPage(page));
  return new Uint8Array(await newPdf.save());
}

export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const indices: Set<number> = new Set();
  const parts = rangeStr.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= totalPages) {
        indices.add(page - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

export function parseDeletePages(str: string, totalPages: number): Set<number> {
  const pages = new Set<number>();
  const parts = str.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= totalPages) pages.add(page);
    }
  }

  return pages;
}

export interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  color: { r: number; g: number; b: number };
  opacity: number;
  angle: number;
  x?: number;
  y?: number;
  pageIndices?: number[];
}

export async function addTextWatermark(
  pdfBytes: Uint8Array,
  options: TextWatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfDocument(pdfBytes);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  const dpr = 2;
  const colorR = Math.round(options.color.r * 255);
  const colorG = Math.round(options.color.g * 255);
  const colorB = Math.round(options.color.b * 255);
  const fontStr = `bold ${options.fontSize * dpr}px "Noto Sans SC", "Noto Sans JP", "Noto Sans KR", "Noto Sans Arabic", Arial, sans-serif`;

  ctx.font = fontStr;
  const metrics = ctx.measureText(options.text);

  canvas.width = Math.ceil(metrics.width) + 4;
  canvas.height = Math.ceil(options.fontSize * dpr * 1.4);

  ctx.font = fontStr;
  ctx.fillStyle = `rgb(${colorR}, ${colorG}, ${colorB})`;
  ctx.textBaseline = 'middle';
  ctx.fillText(options.text, 2, canvas.height / 2);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/png'
    );
  });
  const imageBytes = new Uint8Array(await blob.arrayBuffer());

  const image = await pdfDoc.embedPng(imageBytes);
  const pages = pdfDoc.getPages();
  const posX = options.x ?? 0.5;
  const posY = options.y ?? 0.5;
  const imgWidth = image.width / dpr;
  const imgHeight = image.height / dpr;

  const rad = (options.angle * Math.PI) / 180;
  const halfW = imgWidth / 2;
  const halfH = imgHeight / 2;

  const targetIndices = options.pageIndices ?? pages.map((_, i) => i);
  for (const idx of targetIndices) {
    const page = pages[idx];
    if (!page) continue;
    const { width, height } = page.getSize();
    const cx = posX * width;
    const cy = posY * height;

    page.drawImage(image, {
      x: cx - Math.cos(rad) * halfW + Math.sin(rad) * halfH,
      y: cy - Math.sin(rad) * halfW - Math.cos(rad) * halfH,
      width: imgWidth,
      height: imgHeight,
      opacity: options.opacity,
      rotate: degrees(options.angle),
    });
  }

  return new Uint8Array(await pdfDoc.save());
}

export interface ImageWatermarkOptions {
  imageBytes: Uint8Array;
  imageType: 'png' | 'jpg';
  opacity: number;
  angle: number;
  scale: number;
  x?: number;
  y?: number;
  pageIndices?: number[];
}

export async function addImageWatermark(
  pdfBytes: Uint8Array,
  options: ImageWatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfDocument(pdfBytes);
  const image =
    options.imageType === 'png'
      ? await pdfDoc.embedPng(options.imageBytes)
      : await pdfDoc.embedJpg(options.imageBytes);
  const pages = pdfDoc.getPages();
  const posX = options.x ?? 0.5;
  const posY = options.y ?? 0.5;

  const imgWidth = image.width * options.scale;
  const imgHeight = image.height * options.scale;
  const rad = (options.angle * Math.PI) / 180;
  const halfW = imgWidth / 2;
  const halfH = imgHeight / 2;

  const targetIndices = options.pageIndices ?? pages.map((_, i) => i);
  for (const idx of targetIndices) {
    const page = pages[idx];
    if (!page) continue;
    const { width, height } = page.getSize();
    const cx = posX * width;
    const cy = posY * height;

    page.drawImage(image, {
      x: cx - Math.cos(rad) * halfW + Math.sin(rad) * halfH,
      y: cy - Math.sin(rad) * halfW - Math.cos(rad) * halfH,
      width: imgWidth,
      height: imgHeight,
      opacity: options.opacity,
      rotate: degrees(options.angle),
    });
  }

  return new Uint8Array(await pdfDoc.save());
}

export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';
export type PageNumberFormat = 'simple' | 'page_x_of_y';

export interface PageNumberOptions {
  position: PageNumberPosition;
  fontSize: number;
  format: PageNumberFormat;
  color: { r: number; g: number; b: number };
}

export async function addPageNumbers(
  pdfBytes: Uint8Array,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const pdfDoc = await loadPdfDocument(pdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const mediaBox = page.getMediaBox();
    const cropBox = page.getCropBox();
    const bounds = cropBox || mediaBox;
    const width = bounds.width;
    const height = bounds.height;
    const xOffset = bounds.x || 0;
    const yOffset = bounds.y || 0;

    const pageNumText =
      options.format === 'page_x_of_y'
        ? `${i + 1} / ${totalPages}`
        : `${i + 1}`;

    const textWidth = helveticaFont.widthOfTextAtSize(
      pageNumText,
      options.fontSize
    );
    const textHeight = options.fontSize;

    const minMargin = 8;
    const maxMargin = 40;
    const marginPercentage = 0.04;

    const horizontalMargin = Math.max(
      minMargin,
      Math.min(maxMargin, width * marginPercentage)
    );
    const verticalMargin = Math.max(
      minMargin,
      Math.min(maxMargin, height * marginPercentage)
    );

    const safeHorizontalMargin = Math.max(horizontalMargin, textWidth / 2 + 3);
    const safeVerticalMargin = Math.max(verticalMargin, textHeight + 3);

    let x = 0,
      y = 0;

    switch (options.position) {
      case 'bottom-center':
        x =
          Math.max(
            safeHorizontalMargin,
            Math.min(
              width - safeHorizontalMargin - textWidth,
              (width - textWidth) / 2
            )
          ) + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case 'bottom-left':
        x = safeHorizontalMargin + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case 'bottom-right':
        x =
          Math.max(
            safeHorizontalMargin,
            width - safeHorizontalMargin - textWidth
          ) + xOffset;
        y = safeVerticalMargin + yOffset;
        break;
      case 'top-center':
        x =
          Math.max(
            safeHorizontalMargin,
            Math.min(
              width - safeHorizontalMargin - textWidth,
              (width - textWidth) / 2
            )
          ) + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
      case 'top-left':
        x = safeHorizontalMargin + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
      case 'top-right':
        x =
          Math.max(
            safeHorizontalMargin,
            width - safeHorizontalMargin - textWidth
          ) + xOffset;
        y = height - safeVerticalMargin - textHeight + yOffset;
        break;
    }

    x = Math.max(xOffset + 3, Math.min(xOffset + width - textWidth - 3, x));
    y = Math.max(yOffset + 3, Math.min(yOffset + height - textHeight - 3, y));

    page.drawText(pageNumText, {
      x,
      y,
      font: helveticaFont,
      size: options.fontSize,
      color: rgb(options.color.r, options.color.g, options.color.b),
    });
  }

  return new Uint8Array(await pdfDoc.save());
}

export interface FixPageSizeOptions {
  targetSize: string;
  orientation: string;
  scalingMode: string;
  backgroundColor: { r: number; g: number; b: number };
  customWidth?: number;
  customHeight?: number;
  customUnits?: string;
}

export async function fixPageSize(
  pdfBytes: Uint8Array,
  options: FixPageSizeOptions
): Promise<Uint8Array> {
  let targetWidth: number;
  let targetHeight: number;

  if (options.targetSize.toLowerCase() === 'custom') {
    const w = options.customWidth ?? 210;
    const h = options.customHeight ?? 297;
    const units = (options.customUnits ?? 'mm').toLowerCase();
    if (units === 'in') {
      targetWidth = w * 72;
      targetHeight = h * 72;
    } else {
      targetWidth = w * (72 / 25.4);
      targetHeight = h * (72 / 25.4);
    }
  } else {
    const selected =
      PageSizes[options.targetSize as keyof typeof PageSizes] || PageSizes.A4;
    targetWidth = selected[0];
    targetHeight = selected[1];
  }

  const orientation = options.orientation.toLowerCase();
  if (orientation === 'landscape' && targetWidth < targetHeight) {
    [targetWidth, targetHeight] = [targetHeight, targetWidth];
  } else if (orientation === 'portrait' && targetWidth > targetHeight) {
    [targetWidth, targetHeight] = [targetHeight, targetWidth];
  }

  const sourceDoc = await loadPdfDocument(pdfBytes);
  const outputDoc = await PDFDocument.create();

  for (const sourcePage of sourceDoc.getPages()) {
    const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();
    const embeddedPage = await outputDoc.embedPage(sourcePage);

    const outputPage = outputDoc.addPage([targetWidth, targetHeight]);
    outputPage.drawRectangle({
      x: 0,
      y: 0,
      width: targetWidth,
      height: targetHeight,
      color: rgb(
        options.backgroundColor.r,
        options.backgroundColor.g,
        options.backgroundColor.b
      ),
    });

    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const useFill = options.scalingMode.toLowerCase() === 'fill';
    const scale = useFill ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

    const scaledWidth = sourceWidth * scale;
    const scaledHeight = sourceHeight * scale;

    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    outputPage.drawPage(embeddedPage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  return new Uint8Array(await outputDoc.save());
}
