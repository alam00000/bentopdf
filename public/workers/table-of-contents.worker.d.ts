declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface GenerateTOCMessage {
  command: 'generate-toc';
  pdfData: ArrayBuffer;
  title: string;
  fontSize: number;
  fontFamily: number;
  addBookmark: boolean;
}

interface TOCSuccessResponse {
  status: 'success';
  pdfBytes: ArrayBuffer;
}

interface TOCErrorResponse {
  status: 'error';
  message: string;
}

type TOCResponse = TOCSuccessResponse | TOCErrorResponse;
