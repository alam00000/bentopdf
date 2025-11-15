import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { jpgToPdf } from './jpg-to-pdf.js';
import { pngToPdf } from './png-to-pdf.js';
import { webpToPdf } from './webp-to-pdf.js';
import { bmpToPdf } from './bmp-to-pdf.js';
import { tiffToPdf } from './tiff-to-pdf.js';
import { svgToPdf } from './svg-to-pdf.js';
import { heicToPdf } from './heic-to-pdf.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function imageToPdf() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select at least one image file.');
    return;
  }

  const filesByType: { [key: string]: File[] } = {};

  for (const file of state.files) {
    const type = file.type || '';
    if (!filesByType[type]) {
      filesByType[type] = [];
    }
    filesByType[type].push(file);
  }

  const types = Object.keys(filesByType);
  if (types.length === 1) {
    const type = types[0];
    const originalFiles = state.files;

    if (type === 'image/jpeg' || type === 'image/jpg') {
      state.files = filesByType[type] as File[];
      await jpgToPdf();
    } else if (type === 'image/png') {
      state.files = filesByType[type] as File[];
      await pngToPdf();
    } else if (type === 'image/webp') {
      state.files = filesByType[type] as File[];
      await webpToPdf();
    } else if (type === 'image/bmp') {
      state.files = filesByType[type] as File[];
      await bmpToPdf();
    } else if (type === 'image/tiff' || type === 'image/tif') {
      state.files = filesByType[type] as File[];
      await tiffToPdf();
    } else if (type === 'image/svg+xml') {
      state.files = filesByType[type] as File[];
      await svgToPdf();
    } else {
      const firstFile = filesByType[type][0];
      if (firstFile.name.toLowerCase().endsWith('.heic') ||
        firstFile.name.toLowerCase().endsWith('.heif')) {
        state.files = filesByType[type] as File[];
        await heicToPdf();
      } else {
        showLoader('Converting images to PDF...');
        try {

          const pdfDoc = await PDFLibDocument.create();

          for (const file of filesByType[type]) {
            const imageBitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageBitmap, 0, 0);

            const pngBlob = await new Promise<Blob>((resolve) =>
              canvas.toBlob(resolve, 'image/png')
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
            imageBitmap.close();
          }

          const pdfBytes = await pdfDoc.save();
          downloadFile(
            new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
            'from-images.pdf'
          );
        } catch (e) {
          console.error(e);
          showAlert('Error', 'Failed to convert images to PDF.');
        } finally {
          hideLoader();
        }
      }
    }

    state.files = originalFiles;
    return;
  }

  showLoader('Converting mixed image types to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();

    const imageList = document.getElementById('image-list');
    const sortedFiles = imageList
      ? Array.from(imageList.children)
        // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
        .map((li) => state.files.find((f) => f.name === li.dataset.fileName))
        .filter(Boolean)
      : state.files;

    const qualityInput = document.getElementById('image-pdf-quality') as HTMLInputElement;
    const quality = qualityInput ? Math.max(0.3, Math.min(1.0, parseFloat(qualityInput.value))) : 0.9;

    for (const file of sortedFiles) {
      const type = file.type || '';
      let image;

      try {
        const imageBitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);
        const jpegBlob = await new Promise<Blob>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality)
        );
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        image = await pdfDoc.embedJpg(jpegBytes);
        imageBitmap.close();

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      } catch (e) {
        console.warn(`Failed to process ${file.name}:`, e);
        // Continue with next file
      }
    }

    if (pdfDoc.getPageCount() === 0) {
      throw new Error(
        'No valid images could be processed. Please check your files.'
      );
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from-images.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', e.message || 'Failed to create PDF from images.');
  } finally {
    hideLoader();
  }
}
