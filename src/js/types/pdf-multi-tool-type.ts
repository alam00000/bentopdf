export interface MultiToolPageData {
    id: string;
    originalPdfId: string;
    pageIndex: number;
    thumbnail: string;
    width: number;
    height: number;
    rotation: number;
    isBlank?: boolean;
}
