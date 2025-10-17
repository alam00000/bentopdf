import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

// Track if visual selector has been rendered to avoid duplicates
let visualSelectorRendered = false;

async function renderVisualSelector() {
  if (visualSelectorRendered) return;

  const container = document.getElementById('page-selector-grid');
  if (!container) return;

  visualSelectorRendered = true;

  container.textContent = '';

  showLoader('Rendering page previews...');
  try {
    const pdfData = await state.pdfDoc.save();
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      }).promise;

      const wrapper = document.createElement('div');
      wrapper.className =
        'page-thumbnail-wrapper p-1 border-2 border-transparent rounded-lg cursor-pointer hover:border-indigo-500';
      // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
      wrapper.dataset.pageIndex = i - 1;

      const img = document.createElement('img');
      img.src = canvas.toDataURL();
      img.className = 'rounded-md w-full h-auto';
      const p = document.createElement('p');
      p.className = 'text-center text-xs mt-1 text-gray-300';
      p.textContent = `Page ${i}`;
      wrapper.append(img, p);

      const handleSelection = (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        const isSelected = wrapper.classList.contains('selected');

        if (isSelected) {
          wrapper.classList.remove('selected', 'border-indigo-500');
          wrapper.classList.add('border-transparent');
        } else {
          wrapper.classList.add('selected', 'border-indigo-500');
          wrapper.classList.remove('border-transparent');
        }
      };

      wrapper.addEventListener('click', handleSelection);
      wrapper.addEventListener('touchend', handleSelection);

      wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
      });
      container.appendChild(wrapper);
    }
  } catch (error) {
    console.error('Error rendering visual selector:', error);
    showAlert('Error', 'Failed to render page previews.');
    // 4. ADDED: Reset the flag on error so the user can try again.
    visualSelectorRendered = false;
  } finally {
    hideLoader();
  }
}

export function setupSplitTool() {
  const splitModeSelect = document.getElementById('split-mode');
  const rangePanel = document.getElementById('range-panel');
  const visualPanel = document.getElementById('visual-select-panel');
  const evenOddPanel = document.getElementById('even-odd-panel');
  const zipOptionWrapper = document.getElementById('zip-option-wrapper');
  const allPagesPanel = document.getElementById('all-pages-panel');

  if (!splitModeSelect) return;

  splitModeSelect.addEventListener('change', (e) => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'EventTarg... Remove this comment to see the full error message
    const mode = e.target.value;

    if (mode !== 'visual') {
      visualSelectorRendered = false;
      const container = document.getElementById('page-selector-grid');
      if (container) container.innerHTML = '';
    }

    rangePanel.classList.add('hidden');
    visualPanel.classList.add('hidden');
    evenOddPanel.classList.add('hidden');
    allPagesPanel.classList.add('hidden');
    zipOptionWrapper.classList.add('hidden');

    if (mode === 'range') {
      rangePanel.classList.remove('hidden');
      zipOptionWrapper.classList.remove('hidden');
    } else if (mode === 'visual') {
      visualPanel.classList.remove('hidden');
      zipOptionWrapper.classList.remove('hidden');
      renderVisualSelector();
    } else if (mode === 'even-odd') {
      evenOddPanel.classList.remove('hidden');
    } else if (mode === 'all') {
      allPagesPanel.classList.remove('hidden');
    }
  });
}

export async function split() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const splitMode = document.getElementById('split-mode').value;
  const downloadAsZip =
    (document.getElementById('download-as-zip') as HTMLInputElement)?.checked ||
    false;

  showLoader('Splitting PDF...');

  try {
    const totalPages = state.pdfDoc.getPageCount();
    let indicesToExtract: any = [];

    switch (splitMode) {
      case 'range':
        // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
        const pageRangeInput = document.getElementById('page-range').value;
        if (!pageRangeInput) throw new Error('Please enter a page range.');
        const ranges = pageRangeInput.split(',');
        for (const range of ranges) {
          const trimmedRange = range.trim();
          if (trimmedRange.includes('-')) {
            const [start, end] = trimmedRange.split('-').map(Number);
            if (
              isNaN(start) ||
              isNaN(end) ||
              start < 1 ||
              end > totalPages ||
              start > end
            )
              continue;
            for (let i = start; i <= end; i++) indicesToExtract.push(i - 1);
          } else {
            const pageNum = Number(trimmedRange);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
            indicesToExtract.push(pageNum - 1);
          }
        }
        break;

      case 'even-odd':
        const choiceElement = document.querySelector(
          'input[name="even-odd-choice"]:checked'
        );
        if (!choiceElement) throw new Error('Please select even or odd pages.');
        // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'Element'.
        const choice = choiceElement.value;
        for (let i = 0; i < totalPages; i++) {
          if (choice === 'even' && (i + 1) % 2 === 0) indicesToExtract.push(i);
          if (choice === 'odd' && (i + 1) % 2 !== 0) indicesToExtract.push(i);
        }
        break;
      case 'all':
        indicesToExtract = Array.from({ length: totalPages }, (_, i) => i);
        break;
      case 'visual':
        indicesToExtract = Array.from(
          document.querySelectorAll('.page-thumbnail-wrapper.selected')
        )
          // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
          .map((el) => parseInt(el.dataset.pageIndex));
        break;
    }

    const uniqueIndices = [...new Set(indicesToExtract)];
    if (uniqueIndices.length === 0) {
      throw new Error('No pages were selected for splitting.');
    }

    if (
      splitMode === 'all' ||
      (['range', 'visual'].includes(splitMode) && downloadAsZip)
    ) {
      showLoader('Creating ZIP file...');
      const zip = new JSZip();
      for (const index of uniqueIndices) {
        const newPdf = await PDFLibDocument.create();
        const [copiedPage] = await newPdf.copyPages(state.pdfDoc, [
          index as number,
        ]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        // @ts-expect-error TS(2365) FIXME: Operator '+' cannot be applied to types 'unknown' ... Remove this comment to see the full error message
        zip.file(`page-${index + 1}.pdf`, pdfBytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'split-pages.zip');
    } else {
      const newPdf = await PDFLibDocument.create();
      const copiedPages = await newPdf.copyPages(
        state.pdfDoc,
        uniqueIndices as number[]
      );
      copiedPages.forEach((page: any) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      downloadFile(
        new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
        'split-document.pdf'
      );
    }

    if (splitMode === 'visual') {
      visualSelectorRendered = false;
    }
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      e.message || 'Failed to split PDF. Please check your selection.'
    );
  } finally {
    hideLoader();
  }
}
