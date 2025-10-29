import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  initializeQpdf,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export async function removeRestrictions() {
  const file = state.files[0];
  const password =
    (document.getElementById('owner-password-remove') as HTMLInputElement)
      ?.value || '';

  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  let qpdf: any;

  try {
    showLoader(String(t('alerts.initializing')));
    qpdf = await initializeQpdf();

    showLoader(String(t('alerts.readingPdf')));
    const fileBuffer = await readFileAsArrayBuffer(file);
    const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

    qpdf.FS.writeFile(inputPath, uint8Array);

    showLoader(String(t('alerts.removingRestrictions')));

    const args = [inputPath];

    if (password) {
      args.push(`--password=${password}`);
    }

    args.push('--decrypt', '--remove-restrictions', '--', outputPath);

    try {
      qpdf.callMain(args);
    } catch (qpdfError: any) {
      console.error('qpdf execution error:', qpdfError);
      if (
        qpdfError.message?.includes('password') ||
        qpdfError.message?.includes('encrypt')
      ) {
        throw new Error(
          String(t('alerts.failedToRemoveRestrictions'))
        );
      }

      throw new Error(
        String(t('alerts.failedToRemoveRestrictionsError', { error: qpdfError.message || String(t('alerts.unknownError')) }))
      );
    }

    showLoader(String(t('alerts.preparingDownload')));
    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

    if (!outputFile || outputFile.length === 0) {
      throw new Error(String(t('alerts.operationResultedInEmptyFile')));
    }

    const blob = new Blob([outputFile], { type: 'application/pdf' });
    downloadFile(blob, `unrestricted-${file.name}`);

    hideLoader();

    showAlert(
      String(t('alerts.success')),
      String(t('alerts.restrictionsRemovedSuccess'))
    );
  } catch (error: any) {
    console.error('Error during restriction removal:', error);
    hideLoader();
    showAlert(
      String(t('alerts.operationFailed')),
      String(t('alerts.operationFailedMessage', { error: error.message || '' }))
    );
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
