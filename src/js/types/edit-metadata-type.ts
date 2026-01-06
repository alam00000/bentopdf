import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface EditMetadataState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}