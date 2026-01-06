export interface AlternateMergeState {
    files: File[];
    pdfBytes: Map<string, ArrayBuffer>;
    pdfDocs: Map<string, any>;
}