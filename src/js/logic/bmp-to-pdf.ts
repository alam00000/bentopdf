import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

async function convertImageToPngBytes(file: any) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise((res) =>
          canvas.toBlob(res, 'image/png')
        );
        // @ts-expect-error TS(2339) FIXME: Property 'arrayBuffer' does not exist on type 'unk... Remove this comment to see the full error message
        const pngBytes = await pngBlob.arrayBuffer();
        resolve(pngBytes);
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      // @ts-expect-error TS(2322) FIXME: Type 'string | ArrayBuffer' is not assignable to t... Remove this comment to see the full error message
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export async function bmpToPdf() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select at least one BMP file.');
    return;
  }
  showLoader('Converting BMP to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of state.files) {
      const pngBytes = await convertImageToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(pngBytes as ArrayBuffer);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    }
    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_bmps.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert BMP to PDF. One of the files may be invalid.'
    );
  } finally {
    hideLoader();
  }
}
