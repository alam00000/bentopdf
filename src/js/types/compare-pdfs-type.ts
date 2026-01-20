import * as pdfjsLib from 'pdfjs-dist';

export interface CompareState {
    pdfDoc1: pdfjsLib.PDFDocumentProxy | null;
    pdfDoc2: pdfjsLib.PDFDocumentProxy | null;
    currentPage: number;
    viewMode: 'overlay' | 'side-by-side';
    isSyncScroll: boolean;
}
