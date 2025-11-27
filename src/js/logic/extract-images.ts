import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { hideLoader, showAlert, showLoader } from '../ui.js';
import JSZip from 'jszip';
import { getDocument, OPS } from 'pdfjs-dist';

async function extractImagesFromPDF(fileBuffer: ArrayBuffer, fileName: string) {
  const images: Array<{ name: string; data: Uint8Array; width: number; height: number }> = [];
  const loadingTask = getDocument({ data: fileBuffer });
  const pdf = await loadingTask.promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const ops = await page.getOperatorList();
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    await page.render({
      canvas: canvas,
      canvasContext: ctx!,
      viewport,
    }).promise;
    const objs = page.objs;
    if (!objs) {
      throw new Error(`[extract-images] PDF.js page.objs is empty.`);
    }
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (
        ops.fnArray[i] === OPS.paintImageXObject ||
        ops.fnArray[i] === OPS.paintInlineImageXObject ||
        ops.fnArray[i] === OPS.paintXObject
      ) {
        const imgName = ops.argsArray[i][0];
        showLoader(`Extracting images from ${fileName} - Page ${pageNum} - Image ${imgName}...`);
        let img;
        if (typeof objs.get === 'function') {
          img = objs.get(imgName);
        } else {
          img = objs[imgName];
        }
        if (!img) {
          console.warn(`[extract-images] No image object found: ${imgName} on Page ${pageNum}`);
          continue;
        }
        if (!img.data && img.bitmap instanceof ImageBitmap) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx?.drawImage(img.bitmap, 0, 0);
          const blob = await new Promise<Blob | null>(resolve => tempCanvas.toBlob(resolve, 'image/png'));
          if (blob) {
            images.push({
              name: `${fileName.replace(/\.pdf$/i, '')}_page${pageNum}_${imgName}.png`,
              data: new Uint8Array(await blob.arrayBuffer()),
              width: img.width,
              height: img.height
            });
            continue;
          } else {
            console.warn(`[extract-images] cannot extract ImageBitmap: ${imgName} on page ${pageNum}`, img);
            continue;
          }
        }
        if (!img.data) {
          console.warn(`[extract-images] image object without data: ${imgName} on page ${pageNum}`, img);
          continue;
        }
        if (typeof img.width !== 'number' || typeof img.height !== 'number') {
          console.warn(`[extract-images] image object without dimension: ${imgName} on page ${pageNum}`, img);
          continue;
        }
        const imageData = img.data instanceof Uint8Array ? img.data : new Uint8Array(img.data.buffer);
        images.push({
          name: `${fileName.replace(/\.pdf$/i, '')}_page${pageNum}_${imgName}.png`,
          data: imageData,
          width: img.width,
          height: img.height
        });
        // let ui breath
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
  return images;
}

export async function extractImages() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select one or more PDF files.');
    return;
  }

  document.getElementById('process-btn')?.classList.add('opacity-50', 'cursor-not-allowed');
  document.getElementById('process-btn')?.setAttribute('disabled', 'true');

  showLoader('Reading files ...');

  try {
    const fileBuffers: ArrayBuffer[] = [];
    const fileNames: string[] = [];

    for (const file of state.files) {
      const buffer = await file.arrayBuffer();
      fileBuffers.push(buffer);
      fileNames.push(file.name);
    }

    showLoader(`Extracting images from ${state.files.length} file(s)...`);

    let allImages: Array<{ name: string; data: Uint8Array; width: number; height: number }> = [];
    for (let i = 0; i < fileBuffers.length; i++) {
      const images = await extractImagesFromPDF(fileBuffers[i], fileNames[i]);
      allImages = allImages.concat(images);
    }

    if (allImages.length === 0) {
      showAlert('No Images', 'The PDF file(s) do not contain any images to extract.');
      state.files = [];
      state.pdfDoc = null;
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';
      }
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      document.getElementById('process-btn')?.classList.remove('opacity-50', 'cursor-not-allowed');
      document.getElementById('process-btn')?.removeAttribute('disabled');
      return;
    }
    const zip = new JSZip();
    allImages.forEach(img => {
      zip.file(img.name, img.data);
    });
    zip.generateAsync({ type: 'blob' }).then(blob => {
      downloadFile(blob, 'extracted-images.zip');
    });
    showAlert('Images Extracted', `${allImages.length} image(s) extracted and downloaded as ZIP.`);
    document.getElementById('process-btn')?.classList.remove('opacity-50', 'cursor-not-allowed');
    document.getElementById('process-btn')?.removeAttribute('disabled');
  } catch (error) {
    console.error('Error extracting images:', error);
    showAlert('Error', error instanceof Error ? error.message : 'error occurred during image extraction.');
    document
      .getElementById('process-btn')
      ?.classList.remove('opacity-50', 'cursor-not-allowed');
    document.getElementById('process-btn')?.removeAttribute('disabled');
  } finally {
    hideLoader();
  }
}
