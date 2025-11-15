import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function doImageConvertAndFlatten(pdf, newPdf) {
  const totalPages = pdf.numPages;
  for (let i = 1; i <= totalPages; i++) {
    showLoader(`Processing page ${i} of ${totalPages}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/png', 0.95)
    );
    const arrayBuffer = await blob.arrayBuffer();
    const jpgImage = await newPdf.embedPng(arrayBuffer);
    const pdfPage = newPdf.addPage([jpgImage.width, jpgImage.height]);
    pdfPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: jpgImage.width,
        height: jpgImage.height,
    });
 
  }
}

export async function flattenAsImage(pdfBuffer?: ArrayBuffer, filename?: string) {
  showLoader('Flattening/Converting PDF...');
  try {
    const saveFilename = filename || state.files[0].name;
    const source = pdfBuffer || await readFileAsArrayBuffer(state.files[0]);

    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument({data: source }).promise;
    const pdfDoc = await PDFLibDocument.create();
    await doImageConvertAndFlatten(pdf, pdfDoc);

    const flattenedBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(flattenedBytes)], { type: 'application/pdf' }),
      saveFilename
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not flatten the PDF as Image.');
  } finally {
    hideLoader();
  }
}
