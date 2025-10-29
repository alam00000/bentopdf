import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api.js';

let analysisCache = [];

async function isPageBlank(page: PDFPageProxy, threshold: number) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const viewport = page.getViewport({ scale: 0.2 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport, canvas: canvas })
    .promise;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const totalPixels = data.length / 4;
  let nonWhitePixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 245 || data[i + 1] < 245 || data[i + 2] < 245) {
      nonWhitePixels++;
    }
  }

  const blankness = 1 - nonWhitePixels / totalPixels;
  return blankness >= threshold / 100;
}

async function analyzePages() {
  if (!state.pdfDoc) return;
  showLoader(String(t('alerts.analyzingForBlankPages')));

  const pdfBytes = await state.pdfDoc.save();
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

  analysisCache = [];
  const promises = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    promises.push(
      pdf.getPage(i).then((page) =>
        isPageBlank(page, 0).then((isActuallyBlank) => ({
          pageNum: i,
          isInitiallyBlank: isActuallyBlank,
          pageRef: page,
        }))
      )
    );
  }

  analysisCache = await Promise.all(promises);
  hideLoader();
  updateAnalysisUI();
}

async function updateAnalysisUI() {
  const sensitivity = parseInt(
    (document.getElementById('sensitivity-slider') as HTMLInputElement).value
  );
  (
    document.getElementById('sensitivity-value') as HTMLSpanElement
  ).textContent = sensitivity.toString();

  const previewContainer = document.getElementById('analysis-preview');
  const analysisText = document.getElementById('analysis-text');
  const thumbnailsContainer = document.getElementById(
    'removed-pages-thumbnails'
  );

  thumbnailsContainer.innerHTML = '';

  const pagesToRemove = [];

  for (const pageData of analysisCache) {
    const isConsideredBlank = await isPageBlank(pageData.pageRef, sensitivity);
    if (isConsideredBlank) {
      pagesToRemove.push(pageData.pageNum);
    }
  }

  if (pagesToRemove.length > 0) {
    analysisText.textContent = String(
      t('alerts.foundBlankPages', {
        count: pagesToRemove.length,
        pages: pagesToRemove.join(', '),
      })
    );
    previewContainer.classList.remove('hidden');

    for (const pageNum of pagesToRemove) {
      const pageData = analysisCache[pageNum - 1];
      const viewport = pageData.pageRef.getViewport({ scale: 0.1 });
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = viewport.width;
      thumbCanvas.height = viewport.height;
      await pageData.pageRef.render({
        canvasContext: thumbCanvas.getContext('2d'),
        viewport,
      }).promise;

      const img = document.createElement('img');
      img.src = thumbCanvas.toDataURL();
      img.className = 'rounded border border-gray-600';
      img.title = `Page ${pageNum}`;
      thumbnailsContainer.appendChild(img);
    }
  } else {
    analysisText.textContent = String(t('alerts.noBlankPagesAtSensitivity'));
    previewContainer.classList.remove('hidden');
  }
}

export async function setupRemoveBlankPagesTool() {
  await analyzePages();
  document
    .getElementById('sensitivity-slider')
    .addEventListener('input', updateAnalysisUI);
}

export async function removeBlankPages() {
  showLoader(String(t('alerts.removingBlankPages')));
  try {
    const sensitivity = parseInt(
      (document.getElementById('sensitivity-slider') as HTMLInputElement).value
    );
    const indicesToKeep = [];

    for (const pageData of analysisCache) {
      const isConsideredBlank = await isPageBlank(
        pageData.pageRef,
        sensitivity
      );
      if (!isConsideredBlank) {
        indicesToKeep.push(pageData.pageNum - 1);
      }
    }

    if (indicesToKeep.length === 0) {
      hideLoader();
      showAlert(
        String(t('alerts.noContentFound')),
        String(t('alerts.allPagesBlank'))
      );
      return;
    }

    if (indicesToKeep.length === state.pdfDoc.getPageCount()) {
      hideLoader();
      showAlert(
        String(t('alerts.noPagesRemoved')),
        String(t('alerts.noPagesIdentifiedAsBlank'))
      );
      return;
    }

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(state.pdfDoc, indicesToKeep);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'non-blank.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(String(t('alerts.error')), String(t('alerts.couldNotRemoveBlankPages')));
  } finally {
    hideLoader();
  }
}
