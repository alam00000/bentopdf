import { showLoader, hideLoader, showAlert } from '../ui.js';
import { t } from '../i18n/i18n';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import {
  downloadFile,
  getPDFDocument,
  formatBytes,
  initializeQpdf,
} from '../utils/helpers.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { state } from '../state.js';
import {
  renderPagesProgressively,
  cleanupLazyRendering,
} from '../utils/render-utils.js';
import { initPagePreview } from '../utils/page-preview.js';
import { isCpdfAvailable } from '../utils/cpdf-helper.js';
import { showWasmRequiredDialog } from '../utils/wasm-provider.js';
import JSZip from 'jszip';
import { loadPdfDocument } from '../utils/load-pdf-document.js';
import type { QpdfInstanceExtended } from '@/types';
import '../utils/setup-pdf-worker.js';
import {
  parseRangeGroups,
  evenOddIndices,
  allPagesIndices,
  nTimesGroups,
  bookmarkSplitGroups,
  groupFilename,
  uniqueZipName,
  extractPagesWithQpdf,
} from '../utils/split-pdf-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  let visualSelectorRendered = false;
  let isSplitting = false;

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const fileDisplayArea = document.getElementById('file-display-area');
  const splitOptions = document.getElementById('split-options');
  const backBtn = document.getElementById('back-to-tools');

  // Split Mode Elements
  const splitModeSelect = document.getElementById(
    'split-mode'
  ) as HTMLSelectElement;
  const rangePanel = document.getElementById('range-panel');
  const visualPanel = document.getElementById('visual-select-panel');
  const evenOddPanel = document.getElementById('even-odd-panel');
  const outputModeWrapper = document.getElementById('output-mode-wrapper');
  const outputSeparateLabel = document.getElementById('output-separate-label');
  const allPagesPanel = document.getElementById('all-pages-panel');
  const bookmarksPanel = document.getElementById('bookmarks-panel');
  const nTimesPanel = document.getElementById('n-times-panel');
  const nTimesWarning = document.getElementById('n-times-warning');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const updateUI = async () => {
    if (state.files.length > 0) {
      const file = state.files[0];
      if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';
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
        metaSpan.textContent = `${formatBytes(file.size)} • ${t('common.loadingPageCount')}`; // Placeholder

        infoContainer.append(nameSpan, metaSpan);

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className =
          'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = () => {
          state.files = [];
          state.pdfDoc = null;
          updateUI();
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
        createIcons({ icons });

        // Load PDF Document
        try {
          const result = await loadPdfWithPasswordPrompt(file);
          if (!result) {
            state.files = [];
            updateUI();
            return;
          }
          const pageCount = result.pdf.numPages;
          result.pdf.destroy();
          state.files[0] = result.file;
          state.pdfDoc = await loadPdfDocument(result.bytes);
          metaSpan.textContent = `${formatBytes(file.size)} • ${pageCount} pages`;
        } catch (error) {
          console.error('Error loading PDF:', error);
          showAlert('Error', 'Failed to load PDF file.');
          state.files = [];
          updateUI();
          return;
        }
      }

      if (splitOptions) splitOptions.classList.remove('hidden');
    } else {
      if (fileDisplayArea) fileDisplayArea.innerHTML = '';
      if (splitOptions) splitOptions.classList.add('hidden');
      state.pdfDoc = null;
    }
  };

  const renderVisualSelector = async () => {
    if (visualSelectorRendered) return;

    const container = document.getElementById('page-selector-grid');
    if (!container) return;

    visualSelectorRendered = true;
    container.textContent = '';

    // Cleanup any previous lazy loading observers
    cleanupLazyRendering();

    showLoader('Rendering page previews...');

    try {
      if (!state.pdfDoc) {
        // If pdfDoc is not loaded yet (e.g. page refresh), try to load it from the first file
        if (state.files.length > 0) {
          const file = state.files[0];
          hideLoader();
          const result = await loadPdfWithPasswordPrompt(file);
          if (!result) {
            showLoader('Rendering page previews...');
            throw new Error('No PDF document loaded');
          }
          result.pdf.destroy();
          state.files[0] = result.file;
          state.pdfDoc = await loadPdfDocument(result.bytes);
          showLoader('Rendering page previews...');
        } else {
          throw new Error('No PDF document loaded');
        }
      }

      const pdfData = await state.pdfDoc.save();
      const pdf = await getPDFDocument({ data: pdfData }).promise;

      // Function to create wrapper element for each page
      const createWrapper = (canvas: HTMLCanvasElement, pageNumber: number) => {
        const wrapper = document.createElement('div');
        wrapper.className =
          'page-thumbnail-wrapper p-2 border-2 border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 bg-gray-700 transition-colors relative group flex flex-col items-center gap-1';
        wrapper.dataset.pageIndex = (pageNumber - 1).toString();
        wrapper.dataset.pageNumber = pageNumber.toString();

        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative';

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = 'rounded-md shadow-md max-w-full h-auto';

        const pageNumDiv = document.createElement('div');
        pageNumDiv.className =
          'absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg z-10 pointer-events-none';
        pageNumDiv.textContent = pageNumber.toString();

        imgContainer.append(img, pageNumDiv);
        wrapper.appendChild(imgContainer);

        const handleSelection = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();

          const isSelected = wrapper.classList.contains('selected');

          if (isSelected) {
            wrapper.classList.remove('selected', 'border-indigo-500');
            wrapper.classList.add('border-gray-600');
          } else {
            wrapper.classList.add('selected', 'border-indigo-500');
            wrapper.classList.remove('border-gray-600');
          }
        };

        wrapper.addEventListener('click', handleSelection);
        wrapper.addEventListener('touchend', handleSelection);

        wrapper.addEventListener('touchstart', (e) => {
          e.preventDefault();
        });

        return wrapper;
      };

      // Render pages progressively with lazy loading
      await renderPagesProgressively(pdf, container, createWrapper, {
        batchSize: 8,
        useLazyLoading: true,
        lazyLoadMargin: '400px',
        onProgress: (current, total) => {
          showLoader(`Rendering page previews: ${current}/${total}`);
        },
        onBatchComplete: () => {
          createIcons({ icons });
        },
      });

      initPagePreview(container, pdf);
    } catch (error) {
      console.error('Error rendering visual selector:', error);
      showAlert('Error', 'Failed to render page previews.');
      // Reset the flag on error so the user can try again.
      visualSelectorRendered = false;
    } finally {
      hideLoader();
    }
  };

  const resetState = () => {
    state.files = [];
    state.pdfDoc = null;

    // Reset visual selection
    document
      .querySelectorAll('.page-thumbnail-wrapper.selected')
      .forEach((el) => {
        el.classList.remove('selected', 'border-indigo-500');
        el.classList.add('border-transparent');
      });
    visualSelectorRendered = false;
    const container = document.getElementById('page-selector-grid');
    if (container) container.innerHTML = '';

    // Reset inputs
    const pageRangeInput = document.getElementById(
      'page-range'
    ) as HTMLInputElement;
    if (pageRangeInput) pageRangeInput.value = '';

    const nValueInput = document.getElementById(
      'split-n-value'
    ) as HTMLInputElement;
    if (nValueInput) nValueInput.value = '5';

    const combineRadio = document.getElementById(
      'output-combine'
    ) as HTMLInputElement;
    if (combineRadio) combineRadio.checked = true;

    // Reset radio buttons to default (range)
    const rangeRadio = document.querySelector(
      'input[name="split-mode"][value="range"]'
    ) as HTMLInputElement;
    if (rangeRadio) {
      rangeRadio.checked = true;
      rangeRadio.dispatchEvent(new Event('change'));
    }

    // Reset split mode select
    if (splitModeSelect) {
      splitModeSelect.value = 'range';
      splitModeSelect.dispatchEvent(new Event('change'));
    }

    updateUI();
  };

  const split = async () => {
    if (isSplitting) return;
    isSplitting = true;
    if (processBtn) (processBtn as HTMLButtonElement).disabled = true;

    const splitMode = splitModeSelect.value;
    const oneFilePerUnit =
      (
        document.querySelector(
          'input[name="split-output-mode"]:checked'
        ) as HTMLInputElement | null
      )?.value === 'separate';

    showLoader('Splitting PDF...');

    let qpdf: QpdfInstanceExtended | null = null;
    const inputPath = '/split-input.pdf';

    try {
      if (!state.pdfDoc) throw new Error('No PDF document loaded.');
      const srcDoc = state.pdfDoc;

      const totalPages = srcDoc.getPageCount();
      let indicesToExtract: number[] = [];
      let outputGroups: number[][] | null = null;

      let sourceBytes: Uint8Array | null = null;
      const getSourceBytes = async (): Promise<Uint8Array> => {
        if (sourceBytes) return sourceBytes;
        sourceBytes = new Uint8Array(await srcDoc.save());
        return sourceBytes;
      };

      const ensureQpdf = async (): Promise<QpdfInstanceExtended> => {
        if (qpdf) return qpdf;
        const instance = await initializeQpdf();
        instance.FS.writeFile(inputPath, await getSourceBytes());
        qpdf = instance;
        return instance;
      };

      const extractPages = async (indices: number[]): Promise<Uint8Array> => {
        const instance = await ensureQpdf();
        return extractPagesWithQpdf(instance, inputPath, indices);
      };

      switch (splitMode) {
        case 'range': {
          const pageRangeInput = (
            document.getElementById('page-range') as HTMLInputElement
          ).value;
          if (!pageRangeInput) throw new Error('Choose a valid page range.');

          const { groups: rangeGroups, indices: rangeIndices } =
            parseRangeGroups(pageRangeInput, totalPages);
          indicesToExtract.push(...rangeIndices);

          if (oneFilePerUnit) outputGroups = rangeGroups;
          break;
        }

        case 'even-odd': {
          const choiceElement = document.querySelector(
            'input[name="even-odd-choice"]:checked'
          ) as HTMLInputElement;
          if (!choiceElement)
            throw new Error('Please select even or odd pages.');
          const choice = choiceElement.value === 'even' ? 'even' : 'odd';
          indicesToExtract = evenOddIndices(choice, totalPages);
          break;
        }
        case 'all':
          indicesToExtract = allPagesIndices(totalPages);
          outputGroups = indicesToExtract.map((i) => [i]);
          break;
        case 'visual':
          indicesToExtract = Array.from(
            document.querySelectorAll('.page-thumbnail-wrapper.selected')
          ).map((el) => parseInt((el as HTMLElement).dataset.pageIndex || '0'));
          if (oneFilePerUnit)
            outputGroups = [...new Set(indicesToExtract)].map((i) => [i]);
          break;
        case 'bookmarks': {
          if (!isCpdfAvailable()) {
            showWasmRequiredDialog('cpdf');
            hideLoader();
            return;
          }
          const { getCpdf } = await import('../utils/cpdf-helper.js');
          const cpdf = await getCpdf();
          const pdf = cpdf.fromMemory(
            new Uint8Array(await getSourceBytes()),
            ''
          );

          cpdf.startGetBookmarkInfo(pdf);
          const bookmarkCount = cpdf.numberBookmarks();
          const bookmarkLevel = (
            document.getElementById('bookmark-level') as HTMLSelectElement
          )?.value;

          const splitPages: number[] = [];
          for (let i = 0; i < bookmarkCount; i++) {
            const level = cpdf.getBookmarkLevel(i);
            const page = cpdf.getBookmarkPage(pdf, i);

            if (bookmarkLevel === 'all' || level === parseInt(bookmarkLevel)) {
              if (page > 1 && !splitPages.includes(page - 1)) {
                splitPages.push(page - 1);
              }
            }
          }
          cpdf.endGetBookmarkInfo();
          cpdf.deletePdf(pdf);

          if (splitPages.length === 0) {
            throw new Error('No bookmarks found at the selected level.');
          }

          const zip = new JSZip();
          const bookmarkGroups = bookmarkSplitGroups(splitPages, totalPages);

          for (let i = 0; i < bookmarkGroups.length; i++) {
            const pdfBytes2 = await extractPages(bookmarkGroups[i]);
            zip.file(`split-${i + 1}.pdf`, pdfBytes2);
          }

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadFile(zipBlob, 'split-by-bookmarks.zip');
          hideLoader();
          showAlert('Success', 'PDF split successfully!', 'success', () => {
            resetState();
          });
          return;
        }

        case 'n-times': {
          const nValue = parseInt(
            (document.getElementById('split-n-value') as HTMLInputElement)
              ?.value || '5'
          );
          if (nValue < 1) throw new Error('N must be at least 1.');

          const zip2 = new JSZip();
          const chunks = nTimesGroups(nValue, totalPages);

          for (let i = 0; i < chunks.length; i++) {
            const pdfBytes3 = await extractPages(chunks[i]);
            zip2.file(`split-${i + 1}.pdf`, pdfBytes3);
          }

          const zipBlob2 = await zip2.generateAsync({ type: 'blob' });
          downloadFile(zipBlob2, 'split-n-times.zip');
          hideLoader();
          showAlert('Success', 'PDF split successfully!', 'success', () => {
            resetState();
          });
          return;
        }
      }

      const uniqueIndices = [...new Set(indicesToExtract)];
      if (
        uniqueIndices.length === 0 &&
        splitMode !== 'bookmarks' &&
        splitMode !== 'n-times'
      ) {
        throw new Error('No pages were selected for splitting.');
      }

      if (outputGroups && outputGroups.length > 0) {
        if (outputGroups.length === 1) {
          const pdfBytes = await extractPages(outputGroups[0]);
          downloadFile(
            new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
            groupFilename(outputGroups[0])
          );
        } else {
          showLoader('Creating ZIP file...');
          const zip = new JSZip();
          const usedNames = new Map<string, number>();
          for (const group of outputGroups) {
            const pdfBytes = await extractPages(group);
            zip.file(uniqueZipName(groupFilename(group), usedNames), pdfBytes);
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadFile(zipBlob, 'split-pages.zip');
        }
      } else {
        const pdfBytes = await extractPages(uniqueIndices);
        downloadFile(
          new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
          'split-document.pdf'
        );
      }

      if (splitMode === 'visual') {
        visualSelectorRendered = false;
      }

      showAlert('Success', 'PDF split successfully!', 'success', () => {
        resetState();
      });
    } catch (e: unknown) {
      console.error(e);
      showAlert(
        'Error',
        e instanceof Error
          ? e.message
          : 'Failed to split PDF. Please check your selection.'
      );
    } finally {
      if (qpdf) {
        try {
          qpdf.FS.unlink(inputPath);
        } catch (cleanupError) {
          console.warn('Failed to clean up qpdf input file:', cleanupError);
        }
      }
      isSplitting = false;
      if (processBtn) (processBtn as HTMLButtonElement).disabled = false;
      hideLoader();
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (files && files.length > 0) {
      // Split tool only supports one file at a time
      state.files = [files[0]];
      await updateUI();
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
      const files = e.dataTransfer?.files;
      if (files) {
        const pdfFiles = Array.from(files).filter(
          (f) =>
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
        );
        if (pdfFiles.length > 0) {
          // Take only the first PDF
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFiles[0]);
          handleFileSelect(dataTransfer.files);
        }
      }
    });

    // Clear value on click to allow re-selecting the same file
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (splitModeSelect) {
    splitModeSelect.addEventListener('change', (e) => {
      const mode = (e.target as HTMLSelectElement).value;

      if (mode !== 'visual') {
        visualSelectorRendered = false;
        const container = document.getElementById('page-selector-grid');
        if (container) container.innerHTML = '';
      }

      rangePanel?.classList.add('hidden');
      visualPanel?.classList.add('hidden');
      evenOddPanel?.classList.add('hidden');
      allPagesPanel?.classList.add('hidden');
      bookmarksPanel?.classList.add('hidden');
      nTimesPanel?.classList.add('hidden');
      outputModeWrapper?.classList.add('hidden');
      if (nTimesWarning) nTimesWarning.classList.add('hidden');

      if (mode === 'range') {
        rangePanel?.classList.remove('hidden');
        outputModeWrapper?.classList.remove('hidden');
        if (outputSeparateLabel)
          outputSeparateLabel.textContent = 'One PDF per range';
      } else if (mode === 'visual') {
        visualPanel?.classList.remove('hidden');
        outputModeWrapper?.classList.remove('hidden');
        if (outputSeparateLabel)
          outputSeparateLabel.textContent = 'One PDF per page';
        renderVisualSelector();
      } else if (mode === 'even-odd') {
        evenOddPanel?.classList.remove('hidden');
      } else if (mode === 'all') {
        allPagesPanel?.classList.remove('hidden');
      } else if (mode === 'bookmarks') {
        bookmarksPanel?.classList.remove('hidden');
      } else if (mode === 'n-times') {
        nTimesPanel?.classList.remove('hidden');

        const updateWarning = () => {
          if (!state.pdfDoc) return;
          const totalPages = state.pdfDoc.getPageCount();
          const nValue = parseInt(
            (document.getElementById('split-n-value') as HTMLInputElement)
              ?.value || '5'
          );
          const remainder = totalPages % nValue;
          if (remainder !== 0 && nTimesWarning) {
            nTimesWarning.classList.remove('hidden');
            const warningText = document.getElementById('n-times-warning-text');
            if (warningText) {
              warningText.textContent = `The PDF has ${totalPages} pages, which is not evenly divisible by ${nValue}. The last PDF will contain ${remainder} page(s).`;
            }
          } else if (nTimesWarning) {
            nTimesWarning.classList.add('hidden');
          }
        };

        updateWarning();
        document
          .getElementById('split-n-value')
          ?.addEventListener('input', updateWarning);
      }
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', split);
  }
});
