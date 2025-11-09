declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface ConvertJSONToPDFMessage {
  command: 'convert';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

interface JSONToPDFSuccessResponse {
  status: 'success';
  pdfFiles: Array<{ name: string; data: ArrayBuffer }>;
}

interface JSONToPDFErrorResponse {
  status: 'error';
  message: string;
}

type JSONToPDFResponse = JSONToPDFSuccessResponse | JSONToPDFErrorResponse;

