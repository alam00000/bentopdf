import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFName, PDFString } from 'pdf-lib';

export async function editMetadata() {
  showLoader('Updating metadata...');
  try {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    state.pdfDoc.setTitle(document.getElementById('meta-title').value);
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    state.pdfDoc.setAuthor(document.getElementById('meta-author').value);
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    state.pdfDoc.setSubject(document.getElementById('meta-subject').value);
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    state.pdfDoc.setCreator(document.getElementById('meta-creator').value);
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    state.pdfDoc.setProducer(document.getElementById('meta-producer').value);

    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const keywords = document.getElementById('meta-keywords').value;
    state.pdfDoc.setKeywords(
      keywords
        .split(',')
        .map((k: any) => k.trim())
        .filter(Boolean)
    );

    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const creationDate = document.getElementById('meta-creation-date').value;
    if (creationDate) {
      state.pdfDoc.setCreationDate(new Date(creationDate));
    }

    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const modDate = document.getElementById('meta-mod-date').value;
    if (modDate) {
      state.pdfDoc.setModificationDate(new Date(modDate));
    } else {
      state.pdfDoc.setModificationDate(new Date());
    }

    const infoDict = state.pdfDoc.getInfoDict();
    const standardKeys = new Set([
      'Title',
      'Author',
      'Subject',
      'Keywords',
      'Creator',
      'Producer',
      'CreationDate',
      'ModDate',
    ]);

    const allKeys = infoDict
      .keys()
      .map((key: any) => key.asString().substring(1)); // Clean keys

    allKeys.forEach((key: any) => {
      if (!standardKeys.has(key)) {
        infoDict.delete(PDFName.of(key));
      }
    });

    const customKeys = document.querySelectorAll('.custom-meta-key');
    const customValues = document.querySelectorAll('.custom-meta-value');

    customKeys.forEach((keyInput, index) => {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'Element'.
      const key = keyInput.value.trim();
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'Element'.
      const value = customValues[index].value.trim();
      if (key && value) {
        // Now we add the fields to a clean slate
        infoDict.set(PDFName.of(key), PDFString.of(value));
      }
    });

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'metadata-edited.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Could not update metadata. Please check that date formats are correct.'
    );
  } finally {
    hideLoader();
  }
}
