import createModule from '@neslinesli93/qpdf-wasm';
import { showLoader, hideLoader, showAlert } from '../ui';
import { readFileAsArrayBuffer, downloadFile } from '../utils/helpers';
import { state } from '../state';
import JSZip from 'jszip';

let qpdfInstance: any = null;

async function initializeQpdf() {
  if (qpdfInstance) {
    return qpdfInstance;
  }
  showLoader('Initializing optimization engine...');
  try {
    qpdfInstance = await createModule({
      locateFile: () => '/qpdf.wasm',
    });
  } catch (error) {
    console.error('Failed to initialize qpdf-wasm:', error);
    showAlert(
      'Initialization Error',
      'Could not load the optimization engine. Please refresh the page and try again.'
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
    showAlert('No PDF Files', 'Please upload at least one PDF file.');
    return;
  }

  showLoader('Optimizing PDFs for web view (linearizing)...');
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

      showLoader(`Optimizing ${file.name} (${i + 1}/${pdfFiles.length})...`);

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
          throw new Error(`Processing failed for ${file.name}.`);
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
      throw new Error('No PDF files could be linearized.');
    }

    showLoader('Generating ZIP file...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'linearized-pdfs.zip');

    let alertMessage = `${successCount} PDF(s) linearized successfully.`;
    if (errorCount > 0) {
      alertMessage += ` ${errorCount} file(s) failed.`;
    }
    showAlert('Processing Complete', alertMessage);
  } catch (error: any) {
    console.error('Linearization process error:', error);
    showAlert(
      'Linearization Failed',
      `An error occurred: ${error.message || 'Unknown error'}.`
    );
  } finally {
    hideLoader();
  }
}
