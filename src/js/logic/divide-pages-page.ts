import { DividePagesState } from '@/types';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  formatBytes,
  parsePageRanges,
} from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { loadPdfDocument } from '../utils/load-pdf-document.js';

import { trText, onPageReady } from '../i18n/i18n.js';

const pageState: DividePagesState = {
  file: null,
  pdfDoc: null,
  totalPages: 0,
};

function resetState() {
  pageState.file = null;
  pageState.pdfDoc = null;
  pageState.totalPages = 0;

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  const splitTypeSelect = document.getElementById(
    'split-type'
  ) as HTMLSelectElement;
  if (splitTypeSelect) splitTypeSelect.value = 'vertical';

  const pageRangeInput = document.getElementById(
    'page-range'
  ) as HTMLInputElement;
  if (pageRangeInput) pageRangeInput.value = '';
}

async function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (pageState.file) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col overflow-hidden';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = pageState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = trText("{{size}} • جارٍ التحميل...", {
      size: formatBytes(pageState.file.size),
    });

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = function () {
      resetState();
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    try {
      const result = await loadPdfWithPasswordPrompt(pageState.file);
      if (!result) {
        resetState();
        return;
      }
      result.pdf.destroy();
      pageState.file = result.file;
      showLoader("جارٍ تحميل PDF...");

      pageState.pdfDoc = await loadPdfDocument(result.bytes);
      pageState.totalPages = pageState.pdfDoc.getPageCount();
      hideLoader();

      metaSpan.textContent = trText("{{size}} • {{totalPages}} صفحة", {
        size: formatBytes(pageState.file.size),
        totalPages: pageState.totalPages,
      });

      if (toolOptions) toolOptions.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading PDF:', error);
      hideLoader();
      showAlert("خطأ", "تعذر تحميل ملف PDF.");
      resetState();
    }
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

async function dividePages() {
  if (!pageState.pdfDoc || !pageState.file) {
    showAlert("خطأ", "يرجى رفع ملف PDF أولًا.");
    return;
  }

  const pageRangeInput = document.getElementById(
    'page-range'
  ) as HTMLInputElement;
  const pageRangeValue = pageRangeInput?.value.trim().toLowerCase() || '';
  const splitTypeSelect = document.getElementById(
    'split-type'
  ) as HTMLSelectElement;
  const splitType = splitTypeSelect.value;

  let pagesToDivide: Set<number>;

  if (pageRangeValue === '' || pageRangeValue === 'all') {
    pagesToDivide = new Set(
      Array.from({ length: pageState.totalPages }, (_, i) => i + 1)
    );
  } else {
    const parsedIndices = parsePageRanges(pageRangeValue, pageState.totalPages);
    pagesToDivide = new Set(parsedIndices.map((i) => i + 1));

    if (pagesToDivide.size === 0) {
      showAlert(
        "نطاق غير صالح",
        "يرجى إدخال نطاق صفحات صالح (مثل 1-5, 8, 11-13)."
      );
      return;
    }
  }

  showLoader("جارٍ تقسيم صفحات PDF...");

  try {
    const newPdfDoc = await PDFLibDocument.create();
    const pages = pageState.pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const pageNum = i + 1;
      const originalPage = pages[i];
      const { width, height } = originalPage.getSize();

      showLoader(
        trText("جارٍ معالجة الصفحة {{pageNum}} من {{length}}...", {
          pageNum,
          length: pages.length,
        })
      );

      if (pagesToDivide.has(pageNum)) {
        const [page1] = await newPdfDoc.copyPages(pageState.pdfDoc, [i]);
        const [page2] = await newPdfDoc.copyPages(pageState.pdfDoc, [i]);

        switch (splitType) {
          case 'vertical':
            page1.setCropBox(0, 0, width / 2, height);
            page2.setCropBox(width / 2, 0, width / 2, height);
            break;
          case 'horizontal':
            page1.setCropBox(0, height / 2, width, height / 2);
            page2.setCropBox(0, 0, width, height / 2);
            break;
        }

        newPdfDoc.addPage(page1);
        newPdfDoc.addPage(page2);
      } else {
        const [copiedPage] = await newPdfDoc.copyPages(pageState.pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }
    }

    const newPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      pageState.file.name
    );

    showAlert(
      "تم بنجاح",
      "تم تقسيم الصفحات بنجاح!",
      'success',
      function () {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert("خطأ", "حدث خطأ أثناء تقسيم ملف PDF.");
  } finally {
    hideLoader();
  }
}

function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      pageState.file = file;
      updateUI();
    }
  }
}

onPageReady(function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', function (e) {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(function (f) {
          return (
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
          );
        });
        if (pdfFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFiles[0]);
          handleFileSelect(dataTransfer.files);
        }
      }
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', dividePages);
  }
});
