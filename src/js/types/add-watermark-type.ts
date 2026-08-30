import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface AddWatermarkState {
  file: File | null;
  pdfDoc: PDFLibDocument | null;
  pdfBytes: Uint8Array | null;
  previewCanvas: HTMLCanvasElement | null;
  watermarkX: number; // 0–1, percentage from left
  watermarkY: number; // 0–1, percentage from top (flipped to bottom for PDF)
}

export type WatermarkLayout = 'single' | 'tile';

export interface PageWatermarkConfig {
  type: 'text' | 'image';
  layout: WatermarkLayout;
  tileGapX: number;
  tileGapY: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  opacityText: number;
  angleText: number;
  imageDataUrl: string | null;
  imageFile: File | null;
  imageScale: number;
  opacityImage: number;
  angleImage: number;
}
