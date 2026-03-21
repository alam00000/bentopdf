export interface CropperState {
    pdfDoc: any;
    currentPageNum: number;
    cropper: any;
    originalPdfBytes: ArrayBuffer | null;
    pageCrops: Record<number, any>;
    file: File | null;
}
