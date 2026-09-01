import type { MergeFile } from './merge-worker-type';

export interface InterleaveStep {
  fileIndex: number;
  page: number;
}

export interface InterleaveMessage {
  command: 'interleave';
  files: MergeFile[];
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
