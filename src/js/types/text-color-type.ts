import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface TextColorState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}
