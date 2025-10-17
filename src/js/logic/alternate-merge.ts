import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument } from 'pdf-lib';
import Sortable from 'sortablejs';

const alternateMergeState = {
  pdfDocs: {},
};

export async function setupAlternateMergeTool() {
  const optionsDiv = document.getElementById('alternate-merge-options');
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;
  const fileList = document.getElementById('alternate-file-list');

  if (!optionsDiv || !processBtn || !fileList) return;

  optionsDiv.classList.remove('hidden');
  processBtn.disabled = false;
  processBtn.onclick = alternateMerge;

  fileList.innerHTML = '';
  alternateMergeState.pdfDocs = {};

  showLoader('Loading PDF documents...');
  try {
    for (const file of state.files) {
      const pdfBytes = await readFileAsArrayBuffer(file);
      alternateMergeState.pdfDocs[file.name] = await PDFDocument.load(
        pdfBytes as ArrayBuffer,
        {
          ignoreEncryption: true,
        }
      );
      const pageCount = alternateMergeState.pdfDocs[file.name].getPageCount();

      const li = document.createElement('li');
      li.className =
        'bg-gray-700 p-3 rounded-lg border border-gray-600 flex items-center justify-between';
      li.dataset.fileName = file.name;

      const infoDiv = document.createElement('div');
      infoDiv.className = 'flex items-center gap-2 truncate';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'truncate font-medium text-white';
      nameSpan.textContent = file.name;

      const pagesSpan = document.createElement('span');
      pagesSpan.className = 'text-sm text-gray-400 flex-shrink-0';
      pagesSpan.textContent = `(${pageCount} pages)`;

      infoDiv.append(nameSpan, pagesSpan);

      const dragHandle = document.createElement('div');
      dragHandle.className =
        'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded';
      dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

      li.append(infoDiv, dragHandle);
      fileList.appendChild(li);
    }

    Sortable.create(fileList, {
      handle: '.drag-handle',
      animation: 150,
    });
  } catch (error) {
    showAlert(
      'Error',
      'Failed to load one or more PDF files. They may be corrupted or password-protected.'
    );
    console.error(error);
  } finally {
    hideLoader();
  }
}

export async function alternateMerge() {
  if (Object.keys(alternateMergeState.pdfDocs).length < 2) {
    showAlert(
      'Not Enough Files',
      'Please upload at least two PDF files to alternate and mix.'
    );
    return;
  }

  showLoader('Alternating and mixing pages...');
  try {
    const newPdfDoc = await PDFDocument.create();
    const fileList = document.getElementById('alternate-file-list');
    const sortedFileNames = Array.from(fileList.children).map(
      (li) => (li as HTMLElement).dataset.fileName
    );

    const loadedDocs = sortedFileNames.map(
      (name) => alternateMergeState.pdfDocs[name]
    );
    const pageCounts = loadedDocs.map((doc) => doc.getPageCount());
    const maxPages = Math.max(...pageCounts);

    for (let i = 0; i < maxPages; i++) {
      for (const doc of loadedDocs) {
        if (i < doc.getPageCount()) {
          const [copiedPage] = await newPdfDoc.copyPages(doc, [i]);
          newPdfDoc.addPage(copiedPage);
        }
      }
    }

    const mergedPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' }),
      'alternated-mixed.pdf'
    );
    showAlert('Success', 'PDFs have been mixed successfully!');
  } catch (e) {
    console.error('Alternate Merge error:', e);
    showAlert('Error', 'An error occurred while mixing the PDFs.');
  } finally {
    hideLoader();
  }
}
