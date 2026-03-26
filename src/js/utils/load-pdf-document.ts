import { PDFDocument } from 'pdf-lib';
import { initializeQpdf } from './helpers.js';

type LoadOptions = Parameters<typeof PDFDocument.load>[1];
type PDFDocumentInstance = Awaited<ReturnType<typeof PDFDocument.load>>;

async function repairPdfBytes(pdf: Uint8Array): Promise<Uint8Array | null> {
  try {
    const qpdf = await initializeQpdf();
    qpdf.FS.writeFile('/input.pdf', pdf);

    try {
      qpdf.callMain(['/input.pdf', '--decrypt', '/output.pdf']);
    } catch (e) {
      console.warn('[loadPdfDocument] qpdf repair warning:', e);
    }

    let repaired: Uint8Array | null = null;
    try {
      repaired = qpdf.FS.readFile('/output.pdf', { encoding: 'binary' });
    } catch (e) {
      console.warn('[loadPdfDocument] Failed to read repaired output:', e);
    }

    try {
      qpdf.FS.unlink('/input.pdf');
    } catch (e) {
      console.warn('[loadPdfDocument] Cleanup error:', e);
    }
    try {
      qpdf.FS.unlink('/output.pdf');
    } catch (e) {
      console.warn('[loadPdfDocument] Cleanup error:', e);
    }

    return repaired;
  } catch (e) {
    console.warn('[loadPdfDocument] qpdf not available for repair:', e);
    return null;
  }
}

export async function loadPdfDocument(
  pdf: Uint8Array | ArrayBuffer,
  options?: LoadOptions
): Promise<PDFDocumentInstance> {
  const loadOpts = {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
    ...options,
  };

  const inputBytes = pdf instanceof Uint8Array ? pdf : new Uint8Array(pdf);
  const repaired = await repairPdfBytes(inputBytes);

  if (repaired) {
    try {
      return await PDFDocument.load(repaired, loadOpts);
    } catch (e) {
      console.warn(
        '[loadPdfDocument] Failed to load repaired PDF, falling back to original:',
        e
      );
    }
  }

  return PDFDocument.load(pdf, loadOpts);
}
