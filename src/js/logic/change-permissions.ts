import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  initializeQpdf,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export async function changePermissions() {
  const file = state.files[0];
  const currentPassword =
    (document.getElementById('current-password') as HTMLInputElement)?.value ||
    '';
  const newUserPassword =
    (document.getElementById('new-user-password') as HTMLInputElement)?.value ||
    '';
  const newOwnerPassword =
    (document.getElementById('new-owner-password') as HTMLInputElement)
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

    showLoader(String(t('alerts.processingPdfPermissions')));

    const args = [inputPath];

    // Add password if provided
    if (currentPassword) {
      args.push('--password=' + currentPassword);
    }

    const shouldEncrypt = newUserPassword || newOwnerPassword;

    if (shouldEncrypt) {
      const finalUserPassword = newUserPassword;
      const finalOwnerPassword = newOwnerPassword;

      args.push('--encrypt', finalUserPassword, finalOwnerPassword, '256');

      const allowPrinting = (
        document.getElementById('allow-printing') as HTMLInputElement
      )?.checked;
      const allowCopying = (
        document.getElementById('allow-copying') as HTMLInputElement
      )?.checked;
      const allowModifying = (
        document.getElementById('allow-modifying') as HTMLInputElement
      )?.checked;
      const allowAnnotating = (
        document.getElementById('allow-annotating') as HTMLInputElement
      )?.checked;
      const allowFillingForms = (
        document.getElementById('allow-filling-forms') as HTMLInputElement
      )?.checked;
      const allowDocumentAssembly = (
        document.getElementById('allow-document-assembly') as HTMLInputElement
      )?.checked;
      const allowPageExtraction = (
        document.getElementById('allow-page-extraction') as HTMLInputElement
      )?.checked;

      if (finalOwnerPassword) {
        if (!allowModifying) args.push('--modify=none');
        if (!allowCopying) args.push('--extract=n');
        if (!allowPrinting) args.push('--print=none');
        if (!allowAnnotating) args.push('--annotate=n');
        if (!allowDocumentAssembly) args.push('--assemble=n');
        if (!allowFillingForms) args.push('--form=n');
        if (!allowPageExtraction) args.push('--extract=n');
        // --modify-other is not directly mapped, apply if modifying is disabled
        if (!allowModifying) args.push('--modify-other=n');
      } else if (finalUserPassword) {
        args.push('--allow-insecure');
      }
    } else {
      args.push('--decrypt');
    }

    args.push('--', outputPath);
    try {
      qpdf.callMain(args);
    } catch (qpdfError: any) {
      console.error('qpdf execution error:', qpdfError);

      const errorMsg = qpdfError.message || '';

      if (
        errorMsg.includes('invalid password') ||
        errorMsg.includes('incorrect password') ||
        errorMsg.includes('password')
      ) {
        throw new Error('INVALID_PASSWORD');
      }

      if (
        errorMsg.includes('encrypted') ||
        errorMsg.includes('password required')
      ) {
        throw new Error('PASSWORD_REQUIRED');
      }

      throw new Error('Processing failed: ' + errorMsg || String(t('alerts.unknownError')));
    }

    showLoader(String(t('alerts.preparingDownload')));
    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

    if (!outputFile || outputFile.length === 0) {
      throw new Error(String(t('alerts.processingResultedInEmptyFile')));
    }

    const blob = new Blob([outputFile], { type: 'application/pdf' });
    downloadFile(blob, `permissions-changed-${file.name}`);

    hideLoader();

    let successMessage = String(t('alerts.permissionsChangedSuccess'));
    if (!shouldEncrypt) {
      successMessage = String(t('alerts.pdfDecryptedSuccess'));
    }

    showAlert(String(t('alerts.success')), successMessage);
  } catch (error: any) {
    console.error('Error during PDF permission change:', error);
    hideLoader();

    if (error.message === 'INVALID_PASSWORD') {
      showAlert(
        String(t('alerts.incorrectPassword')),
        String(t('alerts.incorrectPasswordMessage'))
      );
    } else if (error.message === 'PASSWORD_REQUIRED') {
      showAlert(
        String(t('alerts.passwordRequired')),
        String(t('alerts.passwordRequiredMessage'))
      );
    } else {
      showAlert(
        String(t('alerts.processingFailed')),
        String(t('alerts.processingFailedMessage', { error: error.message || '' }))
      );
    }
  } finally {
    try {
      if (qpdf?.FS) {
        try {
          qpdf.FS.unlink(inputPath);
        } catch (e) {}
        try {
          qpdf.FS.unlink(outputPath);
        } catch (e) {}
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup WASM FS:', cleanupError);
    }
  }
}
