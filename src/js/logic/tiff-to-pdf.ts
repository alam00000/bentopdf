import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { decode } from 'tiff';

export async function tiffToPdf() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select at least one TIFF file.');
    return;
  }
  showLoader('Converting TIFF to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of state.files) {
      const tiffBytes = await readFileAsArrayBuffer(file);
      const ifds = decode(tiffBytes as any);

      for (const ifd of ifds) {
        const canvas = document.createElement('canvas');
        canvas.width = ifd.width;
        canvas.height = ifd.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const imageData = ctx.createImageData(ifd.width, ifd.height);
        const pixels = imageData.data;

        // Calculate samples per pixel from data length
        const totalPixels = ifd.width * ifd.height;
        const samplesPerPixel = ifd.data.length / totalPixels;

        // Convert TIFF data to RGBA
        for (let i = 0; i < totalPixels; i++) {
          const dstIndex = i * 4;

          if (samplesPerPixel === 1) {
            // Grayscale
            const gray = ifd.data[i];
            pixels[dstIndex] = gray;
            pixels[dstIndex + 1] = gray;
            pixels[dstIndex + 2] = gray;
            pixels[dstIndex + 3] = 255;
          } else if (samplesPerPixel === 3) {
            // RGB
            const srcIndex = i * 3;
            pixels[dstIndex] = ifd.data[srcIndex];
            pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
            pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
            pixels[dstIndex + 3] = 255;
          } else if (samplesPerPixel === 4) {
            // RGBA
            const srcIndex = i * 4;
            pixels[dstIndex] = ifd.data[srcIndex];
            pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
            pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
            pixels[dstIndex + 3] = ifd.data[srcIndex + 3];
          }
        }

        ctx.putImageData(imageData, 0, 0);

        const pngBlob = await new Promise<Blob>((res) =>
          canvas.toBlob(res!, 'image/png')
        );
        const pngBytes = await pngBlob.arrayBuffer();

        const pngImage = await pdfDoc.embedPng(pngBytes);
        const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: pngImage.width,
          height: pngImage.height,
        });
      }
    }
    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_tiff.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert TIFF to PDF. One of the files may be invalid or corrupted.'
    );
  } finally {
    hideLoader();
  }
}
