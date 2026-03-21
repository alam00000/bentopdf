export interface MergeState {
    files: File[];
    pdfBytes: Map<string, ArrayBuffer>;
    pdfDocs: Map<string, any>;
}
