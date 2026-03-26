import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  formatBytes,
  readFileAsArrayBuffer,
  getPDFDocument,
  getCleanPdfFilename,
} from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';
import { t } from '../i18n/i18n';
import type Vips from 'wasm-vips';
import wasmUrl from 'wasm-vips/vips.wasm?url';
import type { TiffOptions } from '@/types';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

let files: File[] = [];
let vipsInstance: typeof Vips | null = null;

async function getVips(): Promise<typeof Vips> {
  if (vipsInstance) return vipsInstance;
  const VipsInit = (await import('wasm-vips')).default;
  vipsInstance = await VipsInit({
    dynamicLibraries: [],
    locateFile: (fileName: string) => {
      if (fileName.endsWith('.wasm')) {
        return wasmUrl;
      }
      return fileName;
    },
  });
  return vipsInstance;
}

function getOptions(): TiffOptions {
  const dpiInput = document.getElementById('tiff-dpi') as HTMLInputElement;
  const compressionInput = document.getElementById(
    'tiff-compression'
  ) as HTMLSelectElement;
  const colorModeInput = document.getElementById(
    'tiff-color-mode'
  ) as HTMLSelectElement;
  const multiPageInput = document.getElementById(
    'tiff-multipage'
  ) as HTMLInputElement;

  return {
    dpi: dpiInput ? parseInt(dpiInput.value, 10) : 300,
    compression: compressionInput ? compressionInput.value : 'lzw',
    colorMode: colorModeInput ? colorModeInput.value : 'rgb',
    multiPage: multiPageInput ? multiPageInput.checked : false,
  };
}

const updateUI = () => {
  const fileDisplayArea = document.getElementById('file-display-area');
  const optionsPanel = document.getElementById('options-panel');
  const dropZone = document.getElementById('drop-zone');

  if (!fileDisplayArea || !optionsPanel || !dropZone) return;

  fileDisplayArea.innerHTML = '';

  if (files.length > 0) {
    optionsPanel.classList.remove('hidden');

    files.forEach((file) => {
      const fileDiv = document.createElement('div');
      fileDiv.className =
        'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

      const infoContainer = document.createElement('div');
      infoContainer.className = 'flex flex-col overflow-hidden';

      const nameSpan = document.createElement('div');
      nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
      nameSpan.textContent = file.name;

      const metaSpan = document.createElement('div');
      metaSpan.className = 'text-xs text-gray-400';
      metaSpan.textContent = `${formatBytes(file.size)} • ${t('common.loadingPageCount')}`;

      infoContainer.append(nameSpan, metaSpan);

      const removeBtn = document.createElement('button');
      removeBtn.className =
        'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
      removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      removeBtn.onclick = () => {
        files = [];
        updateUI();
      };

      fileDiv.append(infoContainer, removeBtn);
      fileDisplayArea.appendChild(fileDiv);

      readFileAsArrayBuffer(file)
        .then((buffer) => {
          return getPDFDocument(buffer).promise;
        })
        .then((pdf) => {
          metaSpan.textContent = `${formatBytes(file.size)} • ${pdf.numPages} ${pdf.numPages !== 1 ? t('common.pages') : t('common.page')}`;
        })
        .catch((e) => {
          console.warn('Error loading PDF page count:', e);
          metaSpan.textContent = formatBytes(file.size);
        });
    });

    createIcons({ icons });
  } else {
    optionsPanel.classList.add('hidden');
  }
};

const resetState = () => {
  files = [];
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
  updateUI();
};

async function renderPageToRgba(
  page: PDFPageProxy,
  dpi: number
): Promise<{ rgba: Uint8ClampedArray; width: number; height: number }> {
  const scale = dpi / 72;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas,
  }).promise;

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return { rgba: imageData.data, width: canvas.width, height: canvas.height };
}

function encodePageToTiff(
  vips: typeof Vips,
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options: TiffOptions
): Uint8Array {
  let image = vips.Image.newFromMemory(
    new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength),
    width,
    height,
    4,
    vips.BandFormat.uchar
  );

  image = image.copy();
  const pixelsPerMm = options.dpi / 25.4;
  image.setDouble('xres', pixelsPerMm);
  image.setDouble('yres', pixelsPerMm);

  if (options.colorMode === 'greyscale' || options.colorMode === 'bw') {
    if (image.bands === 4) {
      image = image.flatten({ background: [255, 255, 255] });
    }
    image = image.colourspace(vips.Interpretation.b_w);
  } else {
    if (image.bands === 4) {
      image = image.flatten({ background: [255, 255, 255] });
    }
  }

  const tiffOptions: Parameters<typeof image.tiffsaveBuffer>[0] = {
    compression: options.compression as Vips.Enum,
    resunit: vips.ForeignTiffResunit.inch,
    xres: options.dpi / 25.4,
    yres: options.dpi / 25.4,
    predictor:
      options.compression === 'lzw' || options.compression === 'deflate'
        ? vips.ForeignTiffPredictor.horizontal
        : vips.ForeignTiffPredictor.none,
  };

  if (options.colorMode === 'bw') {
    tiffOptions.bitdepth = 1;
  }

  if (options.compression === 'jpeg') {
    tiffOptions.Q = 85;
  }

  const buffer = image.tiffsaveBuffer(tiffOptions);
  image.delete();
  return buffer;
}

async function convert() {
  if (files.length === 0) {
    showAlert(
      t('tools:pdfToTiff.alert.noFile'),
      t('tools:pdfToTiff.alert.noFileExplanation')
    );
    return;
  }
  showLoader(t('tools:pdfToTiff.loadingVips'));

  let vips: typeof Vips;
  try {
    vips = await getVips();
  } catch (e) {
    console.error('Failed to load wasm-vips:', e);
    hideLoader();
    showAlert(
      'Error',
      'Failed to load the image processor. Please ensure your browser supports SharedArrayBuffer (requires HTTPS or localhost).'
    );
    return;
  }

  showLoader(t('tools:pdfToTiff.converting'));

  try {
    const options = getOptions();
    hideLoader();
    const result = await loadPdfWithPasswordPrompt(files[0], files, 0);
    if (!result) return;
    showLoader(t('tools:pdfToTiff.converting'));
    const { pdf } = result;

    if (options.multiPage && pdf.numPages > 1) {
      const pages: Vips.Image[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { rgba, width, height } = await renderPageToRgba(
          page,
          options.dpi
        );

        let img = vips.Image.newFromMemory(
          new Uint8Array(rgba.buffer, rgba.byteOffset, rgba.byteLength),
          width,
          height,
          4,
          vips.BandFormat.uchar
        );

        if (options.colorMode === 'greyscale' || options.colorMode === 'bw') {
          if (img.bands === 4) {
            img = img.flatten({ background: [255, 255, 255] });
          }
          img = img.colourspace(vips.Interpretation.b_w);
        } else {
          if (img.bands === 4) {
            img = img.flatten({ background: [255, 255, 255] });
          }
        }

        pages.push(img);
      }

      const firstPage = pages[0];
      let joined = firstPage;
      if (pages.length > 1) {
        joined = vips.Image.arrayjoin(pages, { across: 1 });
      }

      const tiffOptions: Parameters<typeof joined.tiffsaveBuffer>[0] = {
        compression: options.compression as Vips.Enum,
        resunit: vips.ForeignTiffResunit.inch,
        xres: options.dpi / 25.4,
        yres: options.dpi / 25.4,
        page_height: firstPage.height,
        predictor:
          options.compression === 'lzw' || options.compression === 'deflate'
            ? vips.ForeignTiffPredictor.horizontal
            : vips.ForeignTiffPredictor.none,
      };

      if (options.colorMode === 'bw') {
        tiffOptions.bitdepth = 1;
      }

      if (options.compression === 'jpeg') {
        tiffOptions.Q = 85;
      }

      const buffer = joined.tiffsaveBuffer(tiffOptions);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'image/tiff' });
      downloadFile(blob, getCleanPdfFilename(files[0].name) + '.tiff');

      joined.delete();
      for (const p of pages) {
        if (!p.isDeleted()) p.delete();
      }
    } else if (pdf.numPages === 1) {
      const page = await pdf.getPage(1);
      const { rgba, width, height } = await renderPageToRgba(page, options.dpi);
      const buffer = encodePageToTiff(vips, rgba, width, height, options);
      const blob = new Blob([new Uint8Array(buffer)], { type: 'image/tiff' });
      downloadFile(blob, getCleanPdfFilename(files[0].name) + '.tiff');
    } else {
      const zip = new JSZip();
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const { rgba, width, height } = await renderPageToRgba(
          page,
          options.dpi
        );
        const buffer = encodePageToTiff(vips, rgba, width, height, options);
        zip.file(`page_${i}.tiff`, new Uint8Array(buffer));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, getCleanPdfFilename(files[0].name) + '_tiffs.zip');
    }

    showAlert(
      t('common.success'),
      t('tools:pdfToTiff.alert.conversionSuccess'),
      'success',
      () => {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert(t('common.error'), t('tools:pdfToTiff.alert.conversionError'));
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const dpiSlider = document.getElementById('tiff-dpi') as HTMLInputElement;
  const dpiValue = document.getElementById('tiff-dpi-value');
  const compressionSelect = document.getElementById(
    'tiff-compression'
  ) as HTMLSelectElement;
  const colorModeSelect = document.getElementById(
    'tiff-color-mode'
  ) as HTMLSelectElement;

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (dpiSlider && dpiValue) {
    dpiSlider.addEventListener('input', () => {
      dpiValue.textContent = dpiSlider.value;
    });
  }

  if (compressionSelect && colorModeSelect) {
    compressionSelect.addEventListener('change', () => {
      if (compressionSelect.value === 'ccittfax4') {
        colorModeSelect.value = 'bw';
      }
    });
  }

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const validFiles = Array.from(newFiles).filter(
      (file) => file.type === 'application/pdf'
    );

    if (validFiles.length === 0) {
      showAlert(
        t('tools:pdfToTiff.alert.invalidFile'),
        t('tools:pdfToTiff.alert.invalidFileExplanation')
      );
      return;
    }

    files = [validFiles[0]];
    updateUI();
  };

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      handleFileSelect(e.dataTransfer?.files ?? null);
    });

    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', convert);
  }
});
