import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface InvertColorsState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}
