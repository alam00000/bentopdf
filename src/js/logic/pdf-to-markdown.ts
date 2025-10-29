import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export async function pdfToMarkdown() {
  showLoader(String(t('alerts.convertingToMarkdown')));
  try {
    const file = state.files[0];
    const arrayBuffer = await readFileAsArrayBuffer(file);
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let markdown = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // This is a simple text extraction. For more advanced formatting, more complex logic is needed.
      const text = content.items.map((item: any) => item.str).join(' ');
      markdown += text + '\n\n'; // Add double newline for paragraph breaks between pages
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, file.name.replace(/\.pdf$/i, '.md'));
  } catch (e) {
    console.error(e);
    showAlert(
      String(t('alerts.conversionError')),
      String(t('alerts.failedConvertPdfToMarkdown'))
    );
  } finally {
    hideLoader();
  }
}
