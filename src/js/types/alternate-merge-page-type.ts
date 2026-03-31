import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface AlternateMergeState {
  files: File[];
  pdfBytes: Map<string, ArrayBuffer>;
  pdfDocs: Map<string, PDFDocumentProxy>;
}
