import { PDFDocument } from 'pdf-lib';

export interface SanitizePdfState {
    file: File | null;
    pdfDoc: PDFDocument | null;
}
