import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface CombineSinglePageState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}
