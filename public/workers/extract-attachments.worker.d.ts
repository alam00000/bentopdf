declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface ExtractAttachmentsMessage {
  command: 'extract-attachments';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}

interface ExtractAttachmentSuccessResponse {
  status: 'success';
  attachments: Array<{ name: string; data: ArrayBuffer }>;
}

interface ExtractAttachmentErrorResponse {
  status: 'error';
  message: string;
}

type ExtractAttachmentResponse = ExtractAttachmentSuccessResponse | ExtractAttachmentErrorResponse;