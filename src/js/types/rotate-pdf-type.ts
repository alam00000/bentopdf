export interface RotateState {
    file: File | null;
    pdfBytes: ArrayBuffer | null;
    totalPages: number;
    pageRotations: Map<number, number>;
}
