import { PDFDocument } from 'pdf-lib';

export interface PageDimensionsState {
    file: File | null;
    pdfDoc: PDFDocument | null;
}
