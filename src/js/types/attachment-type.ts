import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export interface AddAttachmentState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
    attachments: File[];
}