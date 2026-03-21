export interface OrganizeState {
    file: File | null;
    pdfBytes: ArrayBuffer | null;
    totalPages: number;
    pageOrder: number[];
}
