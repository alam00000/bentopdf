declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface AddAttachmentsMessage {
  command: 'add-attachments';
  pdfBuffer: ArrayBuffer;
  attachmentBuffers: ArrayBuffer[];
  attachmentNames: string[];
  cpdfUrl?: string;
}

interface AddAttachmentsSuccessResponse {
  status: 'success';
  modifiedPDF: ArrayBuffer;
}

interface AddAttachmentsErrorResponse {
  status: 'error';
  message: string;
}

type AddAttachmentsResponse =
  | AddAttachmentsSuccessResponse
  | AddAttachmentsErrorResponse;
