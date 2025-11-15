declare const coherentpdf: typeof import('../../src/types/coherentpdf.global').coherentpdf;

interface GetAttachmentsMessage {
  command: 'get-attachments';
  fileBuffer: ArrayBuffer;
  fileName: string;
}

interface EditAttachmentsMessage {
  command: 'edit-attachments';
  fileBuffer: ArrayBuffer;
  fileName: string;
  attachmentsToRemove: number[];
}

type EditAttachmentsWorkerMessage = GetAttachmentsMessage | EditAttachmentsMessage;

interface GetAttachmentsSuccessResponse {
  status: 'success';
  attachments: Array<{ index: number; name: string; page: number; data: ArrayBuffer }>;
  fileName: string;
}

interface GetAttachmentsErrorResponse {
  status: 'error';
  message: string;
}

interface EditAttachmentsSuccessResponse {
  status: 'success';
  modifiedPDF: ArrayBuffer;
  fileName: string;
}

interface EditAttachmentsErrorResponse {
  status: 'error';
  message: string;
}

type GetAttachmentsResponse = GetAttachmentsSuccessResponse | GetAttachmentsErrorResponse;
type EditAttachmentsResponse = EditAttachmentsSuccessResponse | EditAttachmentsErrorResponse;
type EditAttachmentsWorkerResponse = GetAttachmentsResponse | EditAttachmentsResponse;