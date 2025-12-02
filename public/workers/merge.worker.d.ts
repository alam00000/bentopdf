declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface MergeJob {
    fileName: string;
    rangeType: 'all' | 'specific' | 'single' | 'range';
    rangeString?: string;
    pageIndex?: number;
    startPage?: number;
    endPage?: number;
}

interface MergeFile {
    name: string;
    data: ArrayBuffer;
}

interface MergeMessage {
    command: 'merge';
    files: MergeFile[];
    jobs: MergeJob[];
}

interface MergeSuccessResponse {
    status: 'success';
    pdfBytes: ArrayBuffer;
}

interface MergeErrorResponse {
    status: 'error';
    message: string;
}

type MergeResponse = MergeSuccessResponse | MergeErrorResponse;
