import { PDFDocumentProxy } from 'pdfjs-dist';

export interface PreviewState {
  modal: HTMLElement | null;
  pdfjsDoc: PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  isOpen: boolean;
  container: HTMLElement | null;
}
