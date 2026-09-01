interface InterleaveStep {
  fileIndex: number;
  page: number;
}

interface InterleaveFile {
  name: string;
  data: ArrayBuffer;
}

interface InterleaveMessage {
  command: 'interleave';
  files: InterleaveFile[];
  series: InterleaveStep[];
}

interface InterleaveSuccessResponse {
  status: 'success';
  pdfBytes: ArrayBuffer;
}

interface InterleaveErrorResponse {
  status: 'error';
  message: string;
}

type InterleaveResponse = InterleaveSuccessResponse | InterleaveErrorResponse;
