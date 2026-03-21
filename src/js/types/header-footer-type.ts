import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface HeaderFooterState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}
