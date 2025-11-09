declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface ConvertPDFToJSONMessage {
  command: 'convert';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

interface PDFToJSONSuccessResponse {
  status: 'success';
  jsonFiles: Array<{ name: string; data: ArrayBuffer }>;
}

interface PDFToJSONErrorResponse {
  status: 'error';
  message: string;
}

type PDFToJSONResponse = PDFToJSONSuccessResponse | PDFToJSONErrorResponse;

