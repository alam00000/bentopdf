import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import Cropper from 'cropperjs';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

// --- Global State for the Cropper Tool ---
const cropperState = {
  pdfDoc: null,
  currentPageNum: 1,
  cropper: null,
  originalPdfBytes: null,
  cropperImageElement: null,
  pageCrops: {},
};

/**
 * Saves the current crop data to the state object.
 */
function saveCurrentCrop() {
  if (cropperState.cropper) {
    const currentCrop = cropperState.cropper.getData(true);
    const imageData = cropperState.cropper.getImageData();
    const cropPercentages = {
      x: currentCrop.x / imageData.naturalWidth,
      y: currentCrop.y / imageData.naturalHeight,
      width: currentCrop.width / imageData.naturalWidth,
      height: currentCrop.height / imageData.naturalHeight,
    };
    cropperState.pageCrops[cropperState.currentPageNum] = cropPercentages;
  }
}

/**
 * Renders a PDF page to the Cropper UI as an image.
 * @param {number} num The page number to render.
 */
async function displayPageAsImage(num: any) {
  showLoader(`Rendering Page ${num}...`);

  try {
    const page = await cropperState.pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 2.5 });

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;
    await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

    if (cropperState.cropper) {
      cropperState.cropper.destroy();
    }

    const image = document.createElement('img');
    image.src = tempCanvas.toDataURL('image/png');
    document.getElementById('cropper-container').innerHTML = '';
    document.getElementById('cropper-container').appendChild(image);

    image.onload = () => {
      cropperState.cropper = new Cropper(image, {
        viewMode: 1,
        background: false,
        autoCropArea: 0.8,
        responsive: true,
        rotatable: false,
        zoomable: false,
      });

      // Restore saved crop data for this page
      const savedCrop = cropperState.pageCrops[num];
      if (savedCrop) {
        const imageData = cropperState.cropper.getImageData();
        const cropData = {
          x: savedCrop.x * imageData.naturalWidth,
          y: savedCrop.y * imageData.naturalHeight,
          width: savedCrop.width * imageData.naturalWidth,
          height: savedCrop.height * imageData.naturalHeight,
        };
        cropperState.cropper.setData(cropData);
      }

      updatePageInfo();
      enableControls();
      hideLoader();
      showAlert('Ready', 'Please select an area to crop.');
    };
  } catch (error) {
    console.error('Error rendering page:', error);
    showAlert('Error', 'Failed to render page.');
    hideLoader();
  }
}

/**
 * Handles page navigation.
 * @param {number} offset -1 for previous, 1 for next.
 */
async function changePage(offset: any) {
  // Save the current page's crop before changing
  saveCurrentCrop();

  const newPageNum = cropperState.currentPageNum + offset;
  if (newPageNum > 0 && newPageNum <= cropperState.pdfDoc.numPages) {
    cropperState.currentPageNum = newPageNum;
    await displayPageAsImage(cropperState.currentPageNum);
  }
}

function updatePageInfo() {
  document.getElementById('page-info').textContent =
    `Page ${cropperState.currentPageNum} of ${cropperState.pdfDoc.numPages}`;
}

function enableControls() {
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('prev-page').disabled =
    cropperState.currentPageNum <= 1;
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('next-page').disabled =
    cropperState.currentPageNum >= cropperState.pdfDoc.numPages;
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('crop-button').disabled = false;
}

/**
 * Performs a non-destructive crop by updating the page's crop box.
 */
async function performMetadataCrop(pdfToModify: any, cropData: any) {
  for (const pageNum in cropData) {
    // @ts-expect-error TS(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const page = pdfToModify.getPages()[pageNum - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const rotation = page.getRotation().angle;
    const crop = cropData[pageNum];

    const visualPdfWidth = pageWidth * crop.width;
    const visualPdfHeight = pageHeight * crop.height;
    const visualPdfX = pageWidth * crop.x;
    const visualPdfY = pageHeight * crop.y;

    let finalX, finalY, finalWidth, finalHeight;
    switch (rotation) {
      case 90:
        finalX = visualPdfY;
        finalY = pageWidth - visualPdfX - visualPdfWidth;
        finalWidth = visualPdfHeight;
        finalHeight = visualPdfWidth;
        break;
      case 180:
        finalX = pageWidth - visualPdfX - visualPdfWidth;
        finalY = pageHeight - visualPdfY - visualPdfHeight;
        finalWidth = visualPdfWidth;
        finalHeight = visualPdfHeight;
        break;
      case 270:
        finalX = pageHeight - visualPdfY - visualPdfHeight;
        finalY = visualPdfX;
        finalWidth = visualPdfHeight;
        finalHeight = visualPdfWidth;
        break;
      default:
        finalX = visualPdfX;
        finalY = pageHeight - visualPdfY - visualPdfHeight;
        finalWidth = visualPdfWidth;
        finalHeight = visualPdfHeight;
        break;
    }
    page.setCropBox(finalX, finalY, finalWidth, finalHeight);
  }
}

/**
 * Performs a destructive crop by flattening the selected area to an image.
 */
async function performFlatteningCrop(cropData: any) {
  const newPdfDoc = await PDFLibDocument.create();

  // Load the original PDF with pdf-lib to copy un-cropped pages from
  const sourcePdfDocForCopying = await PDFLibDocument.load(
    cropperState.originalPdfBytes
  );
  const totalPages = cropperState.pdfDoc.numPages;

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    showLoader(`Processing page ${pageNum} of ${totalPages}...`);

    if (cropData[pageNum]) {
      const page = await cropperState.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.5 });

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      const crop = cropData[pageNum];
      const finalWidth = tempCanvas.width * crop.width;
      const finalHeight = tempCanvas.height * crop.height;
      finalCanvas.width = finalWidth;
      finalCanvas.height = finalHeight;

      finalCtx.drawImage(
        tempCanvas,
        tempCanvas.width * crop.x,
        tempCanvas.height * crop.y,
        finalWidth,
        finalHeight,
        0,
        0,
        finalWidth,
        finalHeight
      );

      const pngBytes = await new Promise((res) =>
        finalCanvas.toBlob((blob) => blob.arrayBuffer().then(res), 'image/png')
      );
      const embeddedImage = await newPdfDoc.embedPng(pngBytes as ArrayBuffer);
      const newPage = newPdfDoc.addPage([finalWidth, finalHeight]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: finalWidth,
        height: finalHeight,
      });
    } else {
      const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDocForCopying, [
        i,
      ]);
      newPdfDoc.addPage(copiedPage);
    }
  }
  return newPdfDoc;
}

export async function setupCropperTool() {
  if (state.files.length === 0) return;

  // Clear pageCrops on new file upload
  cropperState.pageCrops = {};

  const arrayBuffer = await readFileAsArrayBuffer(state.files[0]);
  cropperState.originalPdfBytes = arrayBuffer;
  const arrayBufferForPdfJs = (arrayBuffer as ArrayBuffer).slice(0);
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBufferForPdfJs });

    cropperState.pdfDoc = await loadingTask.promise;
    cropperState.currentPageNum = 1;

    await displayPageAsImage(cropperState.currentPageNum);

    document
      .getElementById('prev-page')
      .addEventListener('click', () => changePage(-1));
    document
      .getElementById('next-page')
      .addEventListener('click', () => changePage(1));

    document
      .getElementById('crop-button')
      .addEventListener('click', async () => {
        // Get the last known crop from the active page before processing
        saveCurrentCrop();

        const isDestructive = (
          document.getElementById('destructive-crop-toggle') as HTMLInputElement
        ).checked;
        const isApplyToAll = (
          document.getElementById('apply-to-all-toggle') as HTMLInputElement
        ).checked;

        let finalCropData = {};
        if (isApplyToAll) {
          const currentCrop =
            cropperState.pageCrops[cropperState.currentPageNum];
          if (!currentCrop) {
            showAlert('No Crop Area', 'Please select an area to crop first.');
            return;
          }
          // Apply the active page's crop to all pages
          for (let i = 1; i <= cropperState.pdfDoc.numPages; i++) {
            finalCropData[i] = currentCrop;
          }
        } else {
          // If not applying to all, only process pages with saved crops
          finalCropData = Object.keys(cropperState.pageCrops).reduce(
            (obj, key) => {
              obj[key] = cropperState.pageCrops[key];
              return obj;
            },
            {}
          );
        }

        if (Object.keys(finalCropData).length === 0) {
          showAlert(
            'No Crop Area',
            'Please select an area on at least one page to crop.'
          );
          return;
        }

        showLoader('Applying crop...');

        try {
          let finalPdfBytes;
          if (isDestructive) {
            const newPdfDoc = await performFlatteningCrop(finalCropData);
            finalPdfBytes = await newPdfDoc.save();
          } else {
            const pdfToModify = await PDFLibDocument.load(
              cropperState.originalPdfBytes
            );
            await performMetadataCrop(pdfToModify, finalCropData);
            finalPdfBytes = await pdfToModify.save();
          }

          const fileName = isDestructive
            ? 'flattened_crop.pdf'
            : 'standard_crop.pdf';
          downloadFile(
            new Blob([finalPdfBytes], { type: 'application/pdf' }),
            fileName
          );
          showAlert('Success', 'Crop complete! Your download has started.');
        } catch (e) {
          console.error(e);
          showAlert('Error', 'An error occurred during cropping.');
        } finally {
          hideLoader();
        }
      });
  } catch (error) {
    console.error('Error setting up cropper tool:', error);
    showAlert('Error', 'Failed to load PDF for cropping.');
  }
}
