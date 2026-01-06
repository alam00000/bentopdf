export interface SignPdfState {
    file: File | null;
    pdfBytes: ArrayBuffer | null;
    signatureData: string | null;
}
