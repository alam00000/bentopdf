import { ExtractedSignature } from './validate-signature-type.ts';

export interface PdfValueSpan {
  start: number;
  end: number;
}

export interface ExtractedSignatureWithError extends ExtractedSignature {
  extractionError?: string;
}
