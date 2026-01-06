export interface OcrWord {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
}

export interface OcrState {
    file: File | null;
    searchablePdfBytes: Uint8Array | null;
}
