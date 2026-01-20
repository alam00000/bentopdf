export interface ExtractPagesState {
    file: File | null;
    pdfBytes: ArrayBuffer | null;
    totalPages: number;
}
