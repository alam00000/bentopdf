declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface InterleaveFile {
    name: string;
    data: ArrayBuffer;
}

interface InterleaveMessage {
    command: 'interleave';
    files: InterleaveFile[];
}

interface InterleaveSuccessResponse {
    status: 'success';
    pdfBytes: ArrayBuffer;
}

interface InterleaveErrorResponse {
    status: 'error';
    message: string;
}

type InterleaveResponse = InterleaveSuccessResponse | InterleaveErrorResponse;
