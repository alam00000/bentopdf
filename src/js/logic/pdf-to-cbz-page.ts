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
import {
  generateComicInfoXml,
  generateMetadataOpf,
  generateComicBookInfoJson,
} from '../utils/comic-info.js';
import type { CbzOptions, ComicMetadata } from '@/types';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

let files: File[] = [];

function getOptions(): CbzOptions {
  const formatInput = document.getElementById(
    'cbz-format'
  ) as HTMLSelectElement;
  const qualityInput = document.getElementById(
    'cbz-quality'
  ) as HTMLInputElement;
  const scaleInput = document.getElementById('cbz-scale') as HTMLInputElement;
  const grayscaleInput = document.getElementById(
    'cbz-grayscale'
  ) as HTMLInputElement;
  const mangaInput = document.getElementById('cbz-manga') as HTMLInputElement;
  const metadataInput = document.getElementById(
    'cbz-metadata'
  ) as HTMLInputElement;
  const titleInput = document.getElementById('cbz-title') as HTMLInputElement;
  const seriesInput = document.getElementById('cbz-series') as HTMLInputElement;
  const numberInput = document.getElementById('cbz-number') as HTMLInputElement;
  const volumeInput = document.getElementById('cbz-volume') as HTMLInputElement;
  const authorInput = document.getElementById('cbz-author') as HTMLInputElement;
  const publisherInput = document.getElementById(
    'cbz-publisher'
  ) as HTMLInputElement;
  const tagsInput = document.getElementById('cbz-tags') as HTMLInputElement;
  const yearInput = document.getElementById('cbz-year') as HTMLInputElement;
  const ratingInput = document.getElementById('cbz-rating') as HTMLInputElement;

  return {
    imageFormat: (formatInput?.value as CbzOptions['imageFormat']) || 'jpeg',
    quality: qualityInput ? parseInt(qualityInput.value, 10) / 100 : 0.85,
    scale: scaleInput ? parseFloat(scaleInput.value) : 2.0,
    grayscale: grayscaleInput?.checked ?? false,
    manga: mangaInput?.checked ?? false,
    includeMetadata: metadataInput?.checked ?? true,
    title: titleInput?.value?.trim() ?? '',
    series: seriesInput?.value?.trim() ?? '',
    number: numberInput?.value?.trim() ?? '',
    volume: volumeInput?.value?.trim() ?? '',
    author: authorInput?.value?.trim() ?? '',
    publisher: publisherInput?.value?.trim() ?? '',
    tags: tagsInput?.value?.trim() ?? '',
    year: yearInput?.value?.trim() ?? '',
    rating: ratingInput?.value?.trim() ?? '',
  };
}

function getMimeType(format: CbzOptions['imageFormat']): string {
  const mimeTypes: Record<CbzOptions['imageFormat'], string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return mimeTypes[format];
}

function getExtension(format: CbzOptions['imageFormat']): string {
  const extensions: Record<CbzOptions['imageFormat'], string> = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
  };
  return extensions[format];
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
        .then((buffer) => getPDFDocument(buffer).promise)
        .then((pdf) => {
          metaSpan.textContent = `${formatBytes(file.size)} • ${pdf.numPages} ${pdf.numPages !== 1 ? t('common.pages') : t('common.page')}`;
        })
        .catch(() => {
          metaSpan.textContent = formatBytes(file.size);
        });
    });

    createIcons({ icons });

    const titleInput = document.getElementById('cbz-title') as HTMLInputElement;
    if (titleInput && !titleInput.value) {
      titleInput.value = getCleanPdfFilename(files[0].name);
    }
  } else {
    optionsPanel.classList.add('hidden');
  }
};

const resetState = () => {
  files = [];
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  const textInputIds = [
    'cbz-title',
    'cbz-series',
    'cbz-number',
    'cbz-volume',
    'cbz-author',
    'cbz-publisher',
    'cbz-tags',
    'cbz-year',
    'cbz-rating',
  ];
  for (const id of textInputIds) {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) input.value = '';
  }

  updateUI();
};

async function renderPage(
  page: PDFPageProxy,
  options: CbzOptions
): Promise<Blob | null> {
  const viewport = page.getViewport({ scale: options.scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to acquire 2D canvas context');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas,
  }).promise;

  if (options.grayscale) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    context.putImageData(imageData, 0, 0);
  }

  const mimeType = getMimeType(options.imageFormat);
  const quality = options.imageFormat === 'png' ? undefined : options.quality;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  );
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}

async function convert() {
  if (files.length === 0) {
    showAlert(
      t('tools:pdfToCbz.alert.noFile'),
      t('tools:pdfToCbz.alert.noFileExplanation')
    );
    return;
  }

  showLoader(t('tools:pdfToCbz.converting'));

  try {
    const options = getOptions();
    hideLoader();
    const result = await loadPdfWithPasswordPrompt(files[0], files, 0);
    if (!result) return;
    showLoader(t('tools:pdfToCbz.converting'));
    const { pdf } = result;

    if (pdf.numPages === 0) {
      throw new Error('PDF has no pages');
    }

    const zip = new JSZip();
    const ext = getExtension(options.imageFormat);
    const padLength = String(pdf.numPages).length;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const blob = await renderPage(page, options);
      if (blob) {
        const pageNum = String(i).padStart(padLength, '0');
        zip.file(`${pageNum}.${ext}`, blob);
      }
    }

    let zipComment = '';

    if (options.includeMetadata) {
      const meta: ComicMetadata = {
        title: options.title || getCleanPdfFilename(files[0].name),
        series: options.series || undefined,
        number: options.number || undefined,
        volume: options.volume || undefined,
        writer: options.author || undefined,
        publisher: options.publisher || undefined,
        genre: options.tags || undefined,
        year: options.year || undefined,
        communityRating: options.rating || undefined,
        pageCount: pdf.numPages,
        manga: options.manga,
        blackAndWhite: options.grayscale,
      };

      zip.file('ComicInfo.xml', generateComicInfoXml(meta));
      zip.file('metadata.opf', generateMetadataOpf(meta));
      zipComment = generateComicBookInfoJson(meta);
    }

    const cbzBlob = await zip.generateAsync({
      type: 'blob',
      comment: zipComment || undefined,
    });
    downloadFile(cbzBlob, getCleanPdfFilename(files[0].name) + '.cbz');

    showAlert(
      t('common.success'),
      t('tools:pdfToCbz.alert.conversionSuccess'),
      'success',
      () => resetState()
    );
  } catch (e) {
    console.error(e);
    showAlert(t('common.error'), t('tools:pdfToCbz.alert.conversionError'));
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const qualitySlider = document.getElementById(
    'cbz-quality'
  ) as HTMLInputElement;
  const qualityValue = document.getElementById('cbz-quality-value');
  const scaleSlider = document.getElementById('cbz-scale') as HTMLInputElement;
  const scaleValue = document.getElementById('cbz-scale-value');
  const formatSelect = document.getElementById(
    'cbz-format'
  ) as HTMLSelectElement;
  const qualitySection = document.getElementById('quality-section');
  const metadataCheckbox = document.getElementById(
    'cbz-metadata'
  ) as HTMLInputElement;
  const metadataSection = document.getElementById('metadata-section');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (qualitySlider && qualityValue) {
    qualitySlider.addEventListener('input', () => {
      qualityValue.textContent = `${qualitySlider.value}%`;
    });
  }

  if (scaleSlider && scaleValue) {
    scaleSlider.addEventListener('input', () => {
      scaleValue.textContent = `${parseFloat(scaleSlider.value).toFixed(1)}x`;
    });
  }

  if (formatSelect && qualitySection) {
    formatSelect.addEventListener('change', () => {
      if (formatSelect.value === 'png') {
        qualitySection.classList.add('hidden');
      } else {
        qualitySection.classList.remove('hidden');
      }
    });
  }

  if (metadataCheckbox && metadataSection) {
    metadataCheckbox.addEventListener('change', () => {
      if (metadataCheckbox.checked) {
        metadataSection.classList.remove('hidden');
      } else {
        metadataSection.classList.add('hidden');
      }
    });
  }

  if (formatSelect?.value === 'png' && qualitySection) {
    qualitySection.classList.add('hidden');
  }
  if (metadataCheckbox && !metadataCheckbox.checked && metadataSection) {
    metadataSection.classList.add('hidden');
  }

  function setInputValidity(
    input: HTMLInputElement,
    valid: boolean,
    errorMsg: string
  ): void {
    const errorId = `${input.id}-error`;
    let errorEl = document.getElementById(errorId);

    if (valid) {
      input.classList.remove('border-red-500', 'focus:ring-red-500');
      input.classList.add('border-gray-600', 'focus:ring-indigo-500');
      if (errorEl) errorEl.remove();
    } else {
      input.classList.remove('border-gray-600', 'focus:ring-indigo-500');
      input.classList.add('border-red-500', 'focus:ring-red-500');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = errorId;
        errorEl.className = 'text-xs text-red-400 mt-1';
        input.parentElement?.appendChild(errorEl);
      }
      errorEl.textContent = errorMsg;
    }
  }

  const yearInput = document.getElementById('cbz-year') as HTMLInputElement;
  const ratingInput = document.getElementById('cbz-rating') as HTMLInputElement;
  const numberInput = document.getElementById('cbz-number') as HTMLInputElement;
  const volumeInput = document.getElementById('cbz-volume') as HTMLInputElement;

  if (yearInput) {
    yearInput.addEventListener('input', () => {
      const val = yearInput.value.trim();
      if (val === '') {
        setInputValidity(yearInput, true, '');
        return;
      }
      const year = parseInt(val, 10);
      setInputValidity(
        yearInput,
        !isNaN(year) && year >= 1900 && year <= 2100,
        'Year must be between 1900 and 2100'
      );
    });
  }

  if (ratingInput) {
    ratingInput.addEventListener('input', () => {
      const val = ratingInput.value.trim();
      if (val === '') {
        setInputValidity(ratingInput, true, '');
        return;
      }
      const rating = parseFloat(val);
      setInputValidity(
        ratingInput,
        !isNaN(rating) && rating >= 0 && rating <= 5,
        'Rating must be between 0 and 5'
      );
    });
  }

  if (numberInput) {
    numberInput.addEventListener('input', () => {
      const val = numberInput.value.trim();
      if (val === '') {
        setInputValidity(numberInput, true, '');
        return;
      }
      setInputValidity(
        numberInput,
        !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
        'Must be a positive number'
      );
    });
  }

  if (volumeInput) {
    volumeInput.addEventListener('input', () => {
      const val = volumeInput.value.trim();
      if (val === '') {
        setInputValidity(volumeInput, true, '');
        return;
      }
      const vol = parseInt(val, 10);
      setInputValidity(
        volumeInput,
        !isNaN(vol) && vol >= 1,
        'Must be a positive integer'
      );
    });
  }

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const validFiles = Array.from(newFiles).filter(
      (file) => file.type === 'application/pdf'
    );

    if (validFiles.length === 0) {
      showAlert(
        t('tools:pdfToCbz.alert.invalidFile'),
        t('tools:pdfToCbz.alert.invalidFileExplanation')
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
