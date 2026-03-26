import { PDFDocument } from 'pdf-lib';

export interface PageDimensionsState {
  file: File | null;
  pdfDoc: PDFDocument | null;
}

export interface AnalyzedPageData {
  pageNum: number;
  width: number;
  height: number;
  orientation: string;
  standardSize: string;
  rotation: number;
}

export interface UniqueSizeEntry {
  count: number;
  label: string;
  width: number;
  height: number;
}
