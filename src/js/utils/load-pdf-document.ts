import { PDFDocument } from 'pdf-lib';

type LoadOptions = Parameters<typeof PDFDocument.load>[1];
type PDFDocumentInstance = Awaited<ReturnType<typeof PDFDocument.load>>;

export async function loadPdfDocument(
  pdf: Uint8Array | ArrayBuffer,
  options?: LoadOptions
): Promise<PDFDocumentInstance> {
  return PDFDocument.load(pdf, {
    ignoreEncryption: true,
    ...options,
  });
}
