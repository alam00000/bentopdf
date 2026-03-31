import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface DeletePagesState {
  file: File | null;
  pdfDoc: PDFLibDocument | null;
  pdfJsDoc: PDFDocumentProxy | null;
  totalPages: number;
  pagesToDelete: Set<number>;
}
