export interface GenerateTOCMessage {
    type: 'generateTOC';
    pdfBytes: ArrayBuffer;
    title: string;
    headerColor: string;
    fontColor: string;
    fontSize: number;
}

export interface TOCSuccessResponse {
    type: 'success';
    pdfBytes: ArrayBuffer;
}

export interface TOCErrorResponse {
    type: 'error';
    message: string;
}
