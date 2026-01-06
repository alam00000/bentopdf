import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface AddWatermarkState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}