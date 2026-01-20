import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface DividePagesState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
    totalPages: number;
}