import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

/**
 * Creates a BMP file buffer from raw pixel data (ImageData).
 * This function is self-contained and has no external dependencies.
 * @param {ImageData} imageData The pixel data from a canvas context.
 * @returns {ArrayBuffer} The complete BMP file as an ArrayBuffer.
 */
function encodeBMP(imageData: any) {
  const { width, height, data } = imageData;
  const stride = Math.floor((24 * width + 31) / 32) * 4; // Row size must be a multiple of 4 bytes
  const fileSize = stride * height + 54; // 54 byte header
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP File Header (14 bytes)
  view.setUint16(0, 0x4d42, true); // 'BM'
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // Offset to pixel data

  // DIB Header (BITMAPINFOHEADER) (40 bytes)
  view.setUint32(14, 40, true); // DIB header size
  view.setUint32(18, width, true);
  view.setUint32(22, -height, true); // Negative height for top-down scanline order
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel
  view.setUint32(30, 0, true); // No compression
  view.setUint32(34, stride * height, true); // Image size
  view.setUint32(38, 2835, true); // Horizontal resolution (72 DPI)
  view.setUint32(42, 2835, true); // Vertical resolution (72 DPI)

  // Pixel Data
  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // BMP is BGR, not RGB
      view.setUint8(offset++, data[i + 2]); // Blue
      view.setUint8(offset++, data[i + 1]); // Green
      view.setUint8(offset++, data[i]); // Red
    }
    // Add padding to make the row a multiple of 4 bytes
    for (let p = 0; p < stride - width * 3; p++) {
      view.setUint8(offset++, 0);
    }
  }
  return buffer;
}

export async function pdfToBmp() {
  showLoader('Converting PDF to BMP images...');
  try {
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      showLoader(`Processing page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the PDF page directly to the canvas
      await page.render({ canvasContext: context, viewport: viewport }).promise;

      // Get the raw pixel data from this canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use our new self-contained function to create the BMP file
      const bmpBuffer = encodeBMP(imageData);

      // Add the generated BMP file to the zip archive
      zip.file(`page_${i}.bmp`, bmpBuffer);
    }

    showLoader('Compressing files into a ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'converted_bmp_images.zip');
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert PDF to BMP. The file might be corrupted.'
    );
  } finally {
    hideLoader();
  }
}
