import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  initializeQpdf,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export async function decrypt() {
  const file = state.files[0];
  const password = (
    document.getElementById('password-input') as HTMLInputElement
  )?.value;

  if (!password) {
    showAlert(String(t('alerts.inputRequired')), String(t('alerts.pleaseEnterPassword')));
    return;
  }

  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  let qpdf: any;

  try {
    showLoader(String(t('alerts.initializingDecryption')));
    qpdf = await initializeQpdf();

    showLoader(String(t('alerts.readingEncryptedPdf')));
    const fileBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

    qpdf.FS.writeFile(inputPath, uint8Array);

    showLoader(String(t('alerts.decryptingPdf')));

    const args = [inputPath, '--password=' + password, '--decrypt', outputPath];

    try {
      qpdf.callMain(args);
    } catch (qpdfError: any) {
      console.error('qpdf execution error:', qpdfError);

      if (
        qpdfError.message?.includes('invalid password') ||
        qpdfError.message?.includes('password')
      ) {
        throw new Error('INVALID_PASSWORD');
      }
      throw qpdfError;
    }

    showLoader(String(t('alerts.preparingDownload')));
    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

    if (outputFile.length === 0) {
      throw new Error(String(t('alerts.decryptionEmptyFile')));
    }

    const blob = new Blob([outputFile], { type: 'application/pdf' });
    downloadFile(blob, `unlocked-${file.name}`);

    hideLoader();
    showAlert(
      String(t('alerts.success')),
      String(t('alerts.pdfDecrypted'))
    );
  } catch (error: any) {
    console.error('Error during PDF decryption:', error);
    hideLoader();

    if (error.message === 'INVALID_PASSWORD') {
      showAlert(
        String(t('alerts.error')),
        String(t('alerts.invalidPassword'))
      );
    } else if (error.message?.includes('password')) {
      showAlert(
        String(t('alerts.error')),
        String(t('alerts.passwordRequired'))
      );
    } else {
      showAlert(
        String(t('alerts.error')),
        `An error occurred: ${error.message || 'The password you entered is wrong or the file is corrupted.'}`
      );
    }
  } finally {
    try {
      if (qpdf?.FS) {
        try {
          qpdf.FS.unlink(inputPath);
        } catch (e) {
          console.warn('Failed to unlink input file:', e);
        }
        try {
          qpdf.FS.unlink(outputPath);
        } catch (e) {
          console.warn('Failed to unlink output file:', e);
        }
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup WASM FS:', cleanupError);
    }
  }
}
