import createModule from '@neslinesli93/qpdf-wasm';
import { showLoader, hideLoader, showAlert } from '../ui';
import { readFileAsArrayBuffer, downloadFile } from '../utils/helpers';
import { state } from '../state';
import { t } from '../i18n/index.js';
import JSZip from 'jszip';

let qpdfInstance: any = null;

async function initializeQpdf() {
  if (qpdfInstance) {
    return qpdfInstance;
  }
  showLoader(String(t('alerts.initializingOptimizationEngine')));
  try {
    qpdfInstance = await createModule({
      locateFile: () => '/qpdf.wasm',
    });
  } catch (error) {
    console.error('Failed to initialize qpdf-wasm:', error);
    showAlert(
      String(t('alerts.initializationError')),
      String(t('alerts.couldNotLoadOptimizationEngine'))
    );
    throw error;
  } finally {
    hideLoader();
  }
  return qpdfInstance;
}

export async function linearizePdf() {
  // Check if there are files and at least one PDF
  const pdfFiles = state.files.filter(
    (file: File) => file.type === 'application/pdf'
  );
  if (!pdfFiles || pdfFiles.length === 0) {
    showAlert(String(t('alerts.noPdfFiles')), String(t('alerts.pleaseUploadAtLeastOnePdf')));
    return;
  }

  showLoader(String(t('alerts.linearizingPdfs')));
  const zip = new JSZip(); // Create a JSZip instance
  let qpdf: any;
  let successCount = 0;
  let errorCount = 0;

  try {
    qpdf = await initializeQpdf();

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const inputPath = `/input_${i}.pdf`;
      const outputPath = `/output_${i}.pdf`;

      showLoader(String(t('alerts.optimizingFile', { fileName: file.name, current: i + 1, total: pdfFiles.length })));

      try {
        const fileBuffer = await readFileAsArrayBuffer(file);
        const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

        qpdf.FS.writeFile(inputPath, uint8Array);

        const args = [inputPath, '--linearize', outputPath];

        qpdf.callMain(args);

        const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
        if (!outputFile || outputFile.length === 0) {
          console.error(
            `Linearization resulted in an empty file for ${file.name}.`
          );
          throw new Error(String(t('alerts.processingFailedForFile', { fileName: file.name })));
        }

        zip.file(`linearized-${file.name}`, outputFile, { binary: true });
        successCount++;
      } catch (fileError: any) {
        errorCount++;
        console.error(`Failed to linearize ${file.name}:`, fileError);
        // Optionally add an error marker/file to the zip? For now, we just skip.
      } finally {
        // Clean up WASM filesystem for this file
        try {
          if (qpdf?.FS) {
            if (qpdf.FS.analyzePath(inputPath).exists) {
              qpdf.FS.unlink(inputPath);
            }
            if (qpdf.FS.analyzePath(outputPath).exists) {
              qpdf.FS.unlink(outputPath);
            }
          }
        } catch (cleanupError) {
          console.warn(
            `Failed to cleanup WASM FS for ${file.name}:`,
            cleanupError
          );
        }
      }
    }

    if (successCount === 0) {
      throw new Error(String(t('alerts.noPdfFilesCouldBeLinearized')));
    }

    showLoader(String(t('alerts.generatingZip')));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'linearized-pdfs.zip');

    let alertMessage = String(t('alerts.linearizedSuccess', { count: successCount }));
    if (errorCount > 0) {
      alertMessage += ` ${String(t('alerts.filesFailed', { count: errorCount }))}`;
    }
    showAlert(String(t('alerts.processingComplete')), alertMessage);
  } catch (error: any) {
    console.error('Linearization process error:', error);
    showAlert(
      String(t('alerts.linearizationFailed')),
      String(t('alerts.errorOccurred', { error: error.message || 'Unknown error' }))
    );
  } finally {
    hideLoader();
  }
}
