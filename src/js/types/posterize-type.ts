import * as pdfjsLib from 'pdfjs-dist';

export interface PosterizeState {
    file: File | null;
    pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;
    pdfBytes: Uint8Array | null;
    pageSnapshots: Record<number, ImageData>;
    currentPage: number;
}
