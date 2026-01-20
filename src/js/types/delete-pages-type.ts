export interface DeletePagesState {
    file: File | null;
    pdfDoc: any;
    pdfJsDoc: any;
    totalPages: number;
    pagesToDelete: Set<number>;
}
