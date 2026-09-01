export interface InterleaveStep {
  fileIndex: number;
  page: number;
}

export interface InterleaveMessage {
  command: 'interleave';
  files: { name: string; data: ArrayBuffer }[];
  series: InterleaveStep[];
}

export interface InterleaveSuccessResponse {
  status: 'success';
  pdfBytes: ArrayBuffer;
}

export interface InterleaveErrorResponse {
  status: 'error';
  message: string;
}

export type InterleaveResponse =
  | InterleaveSuccessResponse
  | InterleaveErrorResponse;
