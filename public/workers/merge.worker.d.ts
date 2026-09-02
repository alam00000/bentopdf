interface MergeJob {
  fileName: string;
  pageSpec: string;
}

interface MergeFile {
  name: string;
  data: ArrayBuffer;
}

interface MergeMessage {
  command: 'merge';
  files: MergeFile[];
  jobs: MergeJob[];
}

interface MergeSuccessResponse {
  status: 'success';
  pdfBytes: ArrayBuffer;
  files: MergeFile[];
}

interface MergeErrorResponse {
  status: 'error';
  message: string;
  files: MergeFile[];
}

type MergeResponse = MergeSuccessResponse | MergeErrorResponse;
