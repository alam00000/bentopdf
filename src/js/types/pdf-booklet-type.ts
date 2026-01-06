export interface BookletState {
    file: File | null;
    pdfBytes: ArrayBuffer | null;
    totalPages: number;
}
