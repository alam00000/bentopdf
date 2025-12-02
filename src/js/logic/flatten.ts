import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument } from 'pdf-lib';

export function flattenFormsInDoc(pdfDoc) {
  const form = pdfDoc.getForm();
  form.flatten();
}

export async function flatten() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select at least one PDF file.');
    return;
  }

  try {
    if (state.files.length === 1) {
      showLoader('Flattening PDF...');
      const file = state.files[0];
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true });

      try {
        flattenFormsInDoc(pdfDoc);
      } catch (e) {
        if (e.message.includes('getForm')) {
          // Ignore if no form found
        } else {
          throw e;
        }
      }

      const flattenedBytes = await pdfDoc.save();
      downloadFile(
        new Blob([flattenedBytes as any], { type: 'application/pdf' }),
        `flattened_${file.name}`
      );
      hideLoader();
    } else {
      showLoader('Flattening multiple PDFs...');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      let processedCount = 0;

      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        showLoader(`Flattening ${i + 1}/${state.files.length}: ${file.name}...`);

        try {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true });

          try {
            flattenFormsInDoc(pdfDoc);
          } catch (e) {
            if (e.message.includes('getForm')) {
              // Ignore if no form found
            } else {
              throw e;
            }
          }

          const flattenedBytes = await pdfDoc.save();
          zip.file(`flattened_${file.name}`, flattenedBytes);
          processedCount++;
        } catch (e) {
          console.error(`Error processing ${file.name}:`, e);
        }
      }

      if (processedCount > 0) {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, 'flattened_pdfs.zip');
        showAlert('Success', `Processed ${processedCount} PDFs.`);
      } else {
        showAlert('Error', 'No PDFs could be processed.');
      }
      hideLoader();
    }
  } catch (e) {
    console.error(e);
    hideLoader();
    showAlert('Error', e.message || 'An unexpected error occurred.');
  }
}
