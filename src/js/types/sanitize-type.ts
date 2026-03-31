import type { PDFDict } from 'pdf-lib';

export interface PDFDocumentInternal {
  getInfoDict(): PDFDict;
  javaScripts?: unknown[];
  embeddedFiles?: unknown[];
  fonts?: unknown[];
}
