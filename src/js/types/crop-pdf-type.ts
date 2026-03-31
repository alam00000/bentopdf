import type { PDFDocumentProxy } from 'pdfjs-dist';
import Cropper from 'cropperjs';

export interface CropPercentages {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropperState {
  pdfDoc: PDFDocumentProxy | null;
  currentPageNum: number;
  cropper: Cropper | null;
  originalPdfBytes: ArrayBuffer | null;
  pageCrops: Record<number, CropPercentages>;
  file: File | null;
}
