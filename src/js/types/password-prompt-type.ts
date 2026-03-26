import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface LoadedPdf {
  pdf: PDFDocumentProxy;
  bytes: ArrayBuffer;
  file: File;
}
