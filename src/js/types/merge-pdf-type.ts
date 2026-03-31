import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface MergeState {
  files: File[];
  pdfBytes: Map<string, ArrayBuffer>;
  pdfDocs: Map<string, PDFDocumentProxy>;
}
