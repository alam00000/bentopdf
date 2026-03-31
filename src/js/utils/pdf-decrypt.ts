import { getCpdf, isCpdfAvailable } from './cpdf-helper';
import { isPyMuPDFAvailable, loadPyMuPDF } from './pymupdf-loader';
import type { CpdfInstance } from '@/types';

export type PdfDecryptEngine = 'cpdf' | 'pymupdf';

export interface PdfDecryptResult {
  bytes: Uint8Array;
  engine: PdfDecryptEngine;
}

const DECRYPT_LOG_PREFIX = '[PDF Decrypt]';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

function normalizeErrorMessage(error: unknown): string {
  const message = getErrorMessage(error).trim();
  const cpdfReasonMatch = message.match(/Pdf\.PDFError\("([^"]+)"\)/);
  if (cpdfReasonMatch?.[1]) {
    return cpdfReasonMatch[1];
  }

  const trailingErrorMatch = message.match(/ERROR:\s*[^:]+:\s*(.+)$/);
  if (trailingErrorMatch?.[1]) {
    return trailingErrorMatch[1].trim();
  }

  return message;
}

function copyBytes(bytes: Uint8Array): Uint8Array {
  return Uint8Array.from(bytes);
}

function cleanupCpdfDocument(cpdf: CpdfInstance, pdf: unknown): void {
  if (!cpdf || !pdf) {
    return;
  }

  try {
    cpdf.deletePdf(pdf);
  } catch (cleanupError) {
    console.warn(
      `${DECRYPT_LOG_PREFIX} Failed to cleanup CoherentPDF document: ${normalizeErrorMessage(cleanupError)}`
    );
  }
}

async function decryptWithCpdf(
  inputBytes: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const cpdf = await getCpdf();
  cpdf.setSlow();

  let pdf: unknown | null = null;

  try {
    pdf = cpdf.fromMemory(new Uint8Array(inputBytes), password);

    if (cpdf.isEncrypted(pdf)) {
      try {
        cpdf.decryptPdf(pdf, password);
      } catch {
        cpdf.decryptPdfOwner(pdf, password);
      }
    }

    const outputBytes = cpdf.toMemory(pdf, false, false);
    pdf = null;

    if (!(outputBytes instanceof Uint8Array) || outputBytes.length === 0) {
      throw new Error('CoherentPDF produced an empty decrypted file.');
    }

    return copyBytes(outputBytes);
  } catch (error) {
    if (pdf) {
      cleanupCpdfDocument(cpdf, pdf);
    }

    throw new Error(normalizeErrorMessage(error), { cause: error });
  }
}

async function decryptWithPyMuPDF(
  inputBytes: Uint8Array,
  password: string
): Promise<Uint8Array> {
  const pymupdf = await loadPyMuPDF();
  const document = await pymupdf.open(
    new Blob([new Uint8Array(inputBytes)], { type: 'application/pdf' })
  );

  try {
    if (document.needsPass || document.isEncrypted) {
      const authenticated = document.authenticate(password);
      if (!authenticated) {
        throw new Error('Invalid PDF password.');
      }
    }

    const outputBytes = document.save();
    if (!(outputBytes instanceof Uint8Array) || outputBytes.length === 0) {
      throw new Error('PyMuPDF produced an empty decrypted file.');
    }

    return copyBytes(outputBytes);
  } finally {
    document.close();
  }
}

export async function decryptPdfBytes(
  inputBytes: Uint8Array,
  password: string
): Promise<PdfDecryptResult> {
  const errors: string[] = [];

  if (isCpdfAvailable()) {
    console.info(`${DECRYPT_LOG_PREFIX} Trying CoherentPDF decryption`);
    try {
      const result: PdfDecryptResult = {
        bytes: await decryptWithCpdf(inputBytes, password),
        engine: 'cpdf',
      };
      console.info(
        `${DECRYPT_LOG_PREFIX} Decryption succeeded with CoherentPDF`
      );
      return result;
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error);
      console.warn(
        `${DECRYPT_LOG_PREFIX} Decryption with CoherentPDF failed. Falling back to PyMuPDF. Reason: ${errorMessage}`
      );
      errors.push(`CoherentPDF: ${errorMessage}`);
    }
  } else {
    console.info(
      `${DECRYPT_LOG_PREFIX} CoherentPDF is not configured, skipping to PyMuPDF`
    );
    errors.push('CoherentPDF: not configured.');
  }

  if (isPyMuPDFAvailable()) {
    console.info(`${DECRYPT_LOG_PREFIX} Trying PyMuPDF decryption`);
    try {
      const result: PdfDecryptResult = {
        bytes: await decryptWithPyMuPDF(inputBytes, password),
        engine: 'pymupdf',
      };
      console.info(`${DECRYPT_LOG_PREFIX} Decryption succeeded with PyMuPDF`);
      return result;
    } catch (error) {
      const errorMessage = normalizeErrorMessage(error);
      console.warn(
        `${DECRYPT_LOG_PREFIX} PyMuPDF decryption failed: ${errorMessage}`
      );
      errors.push(`PyMuPDF: ${errorMessage}`);
    }
  } else {
    console.warn(`${DECRYPT_LOG_PREFIX} PyMuPDF is not configured`);
    errors.push('PyMuPDF: not configured.');
  }

  throw new Error(errors.join('\n'));
}
