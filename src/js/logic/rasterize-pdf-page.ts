import { showLoader, hideLoader, showAlert } from '../ui.js';
import { t } from '../i18n/i18n';
import {
  downloadFile,
  readFileAsArrayBuffer,
  formatBytes,
  getPDFDocument,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import { loadPyMuPDF, isPyMuPDFAvailable } from '../utils/pymupdf-loader.js';
import type { PyMuPDFInstance } from '@/types';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';
import { deduplicateFileName } from '../utils/deduplicate-filename.js';
import { showWasmRequiredDialog } from '../utils/wasm-provider.js';

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const fileDisplayArea = document.getElementById('file-display-area');
  const rasterizeOptions = document.getElementById('rasterize-options');
  const fileControls = document.getElementById('file-controls');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const updateUI = async () => {
    if (!fileDisplayArea || !rasterizeOptions || !processBtn || !fileControls)
      return;

    if (state.files.length > 0) {
      fileDisplayArea.innerHTML = '';

      for (let index = 0; index < state.files.length; index++) {
        const file = state.files[index];
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
          state.files = state.files.filter((_, i) => i !== index);
          updateUI();
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);

        try {
          const arrayBuffer = await readFileAsArrayBuffer(file);
          const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
          metaSpan.textContent = `${formatBytes(file.size)} • ${pdfDoc.numPages} pages`;
        } catch (error) {
          console.error('Error loading PDF:', error);
          metaSpan.textContent = `${formatBytes(file.size)} • Could not load page count`;
        }
      }

      createIcons({ icons });
      fileControls.classList.remove('hidden');
      rasterizeOptions.classList.remove('hidden');
      (processBtn as HTMLButtonElement).disabled = false;
    } else {
      fileDisplayArea.innerHTML = '';
      fileControls.classList.add('hidden');
      rasterizeOptions.classList.add('hidden');
      (processBtn as HTMLButtonElement).disabled = true;
    }
  };

  const resetState = () => {
    state.files = [];
    state.pdfDoc = null;
    updateUI();
  };

  const rasterize = async () => {
    try {
      if (state.files.length === 0) {
        showAlert('No Files', 'Please select at least one PDF file.');
        return;
      }

      if (!isPyMuPDFAvailable()) {
        showWasmRequiredDialog('pymupdf');
        return;
      }

      showLoader('Loading engine...');
      const pymupdf = await loadPyMuPDF();

      // Get options from UI
      const dpi =
        parseInt(
          (document.getElementById('rasterize-dpi') as HTMLSelectElement).value
        ) || 150;
      const format = (
        document.getElementById('rasterize-format') as HTMLSelectElement
      ).value as 'png' | 'jpeg';
      const grayscale = (
        document.getElementById('rasterize-grayscale') as HTMLInputElement
      ).checked;

      hideLoader();
      state.files = await batchDecryptIfNeeded(state.files);
      showLoader('Rasterizing...');

      const total = state.files.length;
      let completed = 0;
      let failed = 0;

      if (total === 1) {
        const file = state.files[0];
        showLoader(`Rasterizing ${file.name}...`);

        const rasterizedBlob = await (pymupdf as PyMuPDFInstance).rasterizePdf(
          file,
          {
            dpi,
            format,
            grayscale,
            quality: 95,
          }
        );

        const outName = file.name.replace(/\.pdf$/i, '') + '_rasterized.pdf';
        downloadFile(rasterizedBlob, outName);

        hideLoader();
        showAlert(
          'Rasterization Complete',
          `Successfully rasterized PDF at ${dpi} DPI.`,
          'success',
          () => resetState()
        );
      } else {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const usedNames = new Set<string>();

        for (let fi = 0; fi < state.files.length; fi++) {
          try {
            const file = state.files[fi];
            showLoader(
              `Rasterizing ${file.name} (${completed + 1}/${total})...`
            );

            const rasterizedBlob = await (
              pymupdf as PyMuPDFInstance
            ).rasterizePdf(file, {
              dpi,
              format,
              grayscale,
              quality: 95,
            });

            const outName =
              file.name.replace(/\.pdf$/i, '') + '_rasterized.pdf';
            const zipEntryName = deduplicateFileName(outName, usedNames);
            zip.file(zipEntryName, rasterizedBlob);

            completed++;
          } catch (error) {
            console.error(
              `Failed to rasterize ${state.files[fi].name}:`,
              error
            );
            failed++;
          }
        }

        showLoader('Creating ZIP archive...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        downloadFile(zipBlob, 'rasterized-pdfs.zip');

        hideLoader();

        if (failed === 0) {
          showAlert(
            'Rasterization Complete',
            `Successfully rasterized ${completed} PDF(s) at ${dpi} DPI.`,
            'success',
            () => resetState()
          );
        } else {
          showAlert(
            'Rasterization Partial',
            `Rasterized ${completed} PDF(s), failed ${failed}.`,
            'warning',
            () => resetState()
          );
        }
      }
    } catch (e: unknown) {
      hideLoader();
      showAlert(
        'Error',
        `An error occurred during rasterization. Error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter(
        (f) =>
          f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFiles.length > 0) {
        state.files = [...state.files, ...pdfFiles];
        updateUI();
      }
    }
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

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', resetState);
  }

  if (processBtn) {
    processBtn.addEventListener('click', rasterize);
  }
});
