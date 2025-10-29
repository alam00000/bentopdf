import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import JSZip from 'jszip';

export async function pdfToZip() {
  if (state.files.length === 0) {
    showAlert(String(t('alerts.noFiles')), String(t('alerts.pleaseSelectPdf')));
    return;
  }
  showLoader(String(t('alerts.creatingZipFile')));
  try {
    const zip = new JSZip();
    for (const file of state.files) {
      const fileBuffer = await readFileAsArrayBuffer(file);
      zip.file(file.name, fileBuffer as ArrayBuffer);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'pdfs.zip');
  } catch (e) {
    console.error(e);
    showAlert(String(t('alerts.error')), String(t('alerts.failedCreateZip')));
  } finally {
    hideLoader();
  }
}
