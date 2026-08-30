import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { formatBytes, downloadFile } from '../utils/helpers.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { loadPdfDocument } from '../utils/load-pdf-document.js';
import { t } from '../i18n/index.js';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

interface DuplexState {
  file: File | null;
  pdfDoc: PDFDocument | null;
  totalPages: number;
}

const duplexState: DuplexState = {
  file: null,
  pdfDoc: null,
  totalPages: 0,
};

const translate = (
  key: string,
  fallback: string,
  options?: Record<string, unknown>
) => {
  const translation = t(key, options);
  return translation && translation !== key ? translation : fallback;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

/**
 * Wires duplex-collate page event handlers and initial UI behavior.
 */
function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const autoSplitBtn = document.getElementById('auto-split-btn');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFile(droppedFiles[0]);
      }
    });
  }

  processBtn?.addEventListener('click', processDuplexCollate);

  autoSplitBtn?.addEventListener('click', () => {
    const splitInput = document.getElementById(
      'split-page'
    ) as HTMLInputElement | null;
    if (!splitInput || duplexState.totalPages < 2) return;
    splitInput.value = Math.ceil(duplexState.totalPages / 2).toString();
    updatePreviewSummary();
  });

  document
    .getElementById('split-page')
    ?.addEventListener('input', updatePreviewSummary);
  document
    .getElementById('back-order')
    ?.addEventListener('change', updatePreviewSummary);
  document
    .getElementById('export-grouped')
    ?.addEventListener('change', toggleGroupedOptions);

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

/**
 * Handles file input selection events and forwards the chosen file for parsing.
 */
function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFile(input.files[0]);
  }
}

/**
 * Loads and validates the uploaded PDF, then prepares UI state for duplex collation.
 */
async function handleFile(file: File) {
  if (
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    showAlert(
      translate('tools:duplexCollate.invalidFileTitle', 'Invalid File'),
      translate(
        'tools:duplexCollate.invalidFileMessage',
        'Please select a PDF file.'
      )
    );
    return;
  }

  showLoader(translate('tools:duplexCollate.loadingPdf', 'Loading PDF...'));

  try {
    const result = await loadPdfWithPasswordPrompt(file);
    if (!result) {
      hideLoader();
      return;
    }

    result.pdf.destroy();
    duplexState.file = result.file;
    duplexState.pdfDoc = await loadPdfDocument(result.bytes);
    duplexState.totalPages = duplexState.pdfDoc.getPageCount();

    updateFileDisplay();
    showOptions();
    showOddPageWarning();
    applyDefaultSplitPoint();
    updatePreviewSummary();
    hideLoader();
  } catch (error) {
    console.error('Error loading PDF:', error);
    hideLoader();
    showAlert(
      translate('common.error', 'Error'),
      translate(
        'tools:duplexCollate.loadErrorMessage',
        'Failed to load PDF file.'
      )
    );
  }
}

/**
 * Removes the .pdf extension from a filename.
 */
function stripPdfExtension(name: string): string {
  return name.replace(/\.pdf$/i, '');
}

/**
 * Resolves a safe base filename for generated outputs.
 */
function getBaseFilename(): string {
  return stripPdfExtension(duplexState.file?.name || 'document');
}

/**
 * Renders the selected file metadata and remove action in the file list area.
 */
function updateFileDisplay() {
  const fileDisplayArea = document.getElementById('file-display-area');
  if (!fileDisplayArea || !duplexState.file) return;

  fileDisplayArea.innerHTML = '';

  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'flex flex-col flex-1 min-w-0';

  const nameSpan = document.createElement('div');
  nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
  nameSpan.textContent = duplexState.file.name;

  const metaSpan = document.createElement('div');
  metaSpan.className = 'text-xs text-gray-400';
  metaSpan.textContent = translate(
    'tools:duplexCollate.fileMeta',
    `${formatBytes(duplexState.file.size)} - ${duplexState.totalPages} pages`,
    {
      size: formatBytes(duplexState.file.size),
      count: duplexState.totalPages,
    }
  );

  infoContainer.append(nameSpan, metaSpan);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = resetState;

  fileDiv.append(infoContainer, removeBtn);
  fileDisplayArea.appendChild(fileDiv);
  createIcons({ icons });
}

/**
 * Reveals duplex options and updates the total page counter.
 */
function showOptions() {
  const options = document.getElementById('duplex-options');
  const totalPagesEl = document.getElementById('total-pages');

  options?.classList.remove('hidden');
  if (totalPagesEl) {
    totalPagesEl.textContent = duplexState.totalPages.toString();
  }
}

/**
 * Shows a warning when the uploaded document has an odd page count.
 */
function showOddPageWarning() {
  const banner = document.getElementById('odd-page-banner');
  if (!banner) return;
  if (duplexState.totalPages % 2 !== 0) {
    banner.classList.remove('hidden');
    banner.textContent = translate(
      'tools:duplexCollate.oddPageWarning',
      `Odd page count (${duplexState.totalPages}). A duplex scan should have an even number of pages; you may have a missing or extra page.`,
      {
        count: duplexState.totalPages,
      }
    );
  } else {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

/**
 * Sets the split input to the midpoint of the uploaded document.
 */
function applyDefaultSplitPoint() {
  const splitInput = document.getElementById(
    'split-page'
  ) as HTMLInputElement | null;
  if (!splitInput) return;
  splitInput.value = Math.ceil(duplexState.totalPages / 2).toString();
}

/**
 * Toggles grouped-export inputs based on the grouped export checkbox.
 */
function toggleGroupedOptions() {
  const grouped = document.getElementById(
    'export-grouped'
  ) as HTMLInputElement | null;
  const groupPanel = document.getElementById('grouped-options');

  if (!grouped || !groupPanel) return;
  if (grouped.checked) {
    groupPanel.classList.remove('hidden');
  } else {
    groupPanel.classList.add('hidden');
  }
}

/**
 * Returns a clamped split point derived from the current UI input.
 */
function getSplitPoint(): number {
  const splitInput = document.getElementById(
    'split-page'
  ) as HTMLInputElement | null;
  const fallback = Math.ceil(duplexState.totalPages / 2);
  if (!splitInput) return fallback;

  const parsed = Number.parseInt(splitInput.value, 10);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.max(1, Math.min(parsed, Math.max(duplexState.totalPages - 1, 1)));
}

/**
 * Returns the selected back-page ordering strategy.
 */
function getBackOrder(): 'reverse' | 'keep' {
  const backOrder = document.getElementById(
    'back-order'
  ) as HTMLSelectElement | null;
  return backOrder?.value === 'keep' ? 'keep' : 'reverse';
}

/**
 * Builds the final page index order by interleaving front and back page blocks.
 */
export function buildDuplexOrder(
  totalPages: number,
  splitPoint: number,
  backOrder: 'reverse' | 'keep'
) {
  const fronts = Array.from({ length: splitPoint }, (_, i) => i);
  const backs = Array.from(
    { length: totalPages - splitPoint },
    (_, i) => splitPoint + i
  );

  if (backOrder === 'reverse') {
    backs.reverse();
  }

  const order: number[] = [];
  const pairCount = Math.max(fronts.length, backs.length);

  for (let i = 0; i < pairCount; i++) {
    if (fronts[i] !== undefined) order.push(fronts[i]);
    if (backs[i] !== undefined) order.push(backs[i]);
  }

  return {
    order,
    frontCount: fronts.length,
    backCount: backs.length,
  };
}

/**
 * Refreshes the preview summary and warnings for the current collation settings.
 */
function updatePreviewSummary() {
  const summary = document.getElementById('duplex-preview-summary');
  const warning = document.getElementById('duplex-warning');
  if (!summary || !warning || duplexState.totalPages === 0) return;

  const splitPoint = getSplitPoint();
  const backOrder = getBackOrder();
  const { order, frontCount, backCount } = buildDuplexOrder(
    duplexState.totalPages,
    splitPoint,
    backOrder
  );

  summary.textContent = translate(
    'tools:duplexCollate.previewSummary',
    `Front block: ${frontCount} page(s), back block: ${backCount} page(s). Output: ${order.length} page(s), in front/back sequence.`,
    {
      frontCount,
      backCount,
      outputCount: order.length,
    }
  );

  if (frontCount !== backCount) {
    warning.classList.remove('hidden');
    warning.textContent = translate(
      'tools:duplexCollate.previewMismatchWarning',
      `Front and back block lengths differ (${frontCount} front vs ${backCount} back). The ${Math.abs(frontCount - backCount)} extra page(s) on the longer side will be appended unpaired at the end.`,
      {
        frontCount,
        backCount,
        extraCount: Math.abs(frontCount - backCount),
      }
    );
  } else {
    warning.classList.add('hidden');
    warning.textContent = '';
  }
}

/**
 * Shows an in-page confirmation dialog and resolves with the user's choice.
 */
function showConfirm(message: string): Promise<boolean> {
  const modal = document.getElementById('confirm-modal');
  const messageEl = document.getElementById('confirm-message');
  const cancelBtn = document.getElementById('confirm-cancel');
  const proceedBtn = document.getElementById('confirm-proceed');

  if (!modal || !messageEl || !cancelBtn || !proceedBtn) {
    return Promise.resolve(window.confirm(message));
  }

  messageEl.textContent = message;
  modal.classList.remove('hidden');

  const previousActive = document.activeElement as HTMLElement | null;

  return new Promise<boolean>((resolve) => {
    const close = (result: boolean) => {
      modal.classList.add('hidden');
      cancelBtn.removeEventListener('click', onCancel);
      proceedBtn.removeEventListener('click', onProceed);
      modal.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeydown);
      previousActive?.focus();
      resolve(result);
    };

    const onCancel = () => close(false);
    const onProceed = () => close(true);
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === modal) close(false);
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };

    cancelBtn.addEventListener('click', onCancel);
    proceedBtn.addEventListener('click', onProceed);
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeydown);
    cancelBtn.focus();
  });
}

/**
 * Creates a new PDF containing the source pages referenced by index.
 */
async function createPdfFromIndices(
  sourceDoc: PDFDocument,
  indices: number[]
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(sourceDoc, indices);
  copiedPages.forEach((page) => outDoc.addPage(page));
  return new Uint8Array(await outDoc.save());
}

/**
 * Converts Uint8Array output into an ArrayBuffer suitable for Blob construction.
 */
function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = bytes;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  const copy = new Uint8Array(byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/**
 * Runs duplex collation and downloads either a single file or grouped ZIP output.
 */
async function processDuplexCollate() {
  if (!duplexState.file || !duplexState.pdfDoc || duplexState.totalPages < 2) {
    showAlert(
      translate('tools:duplexCollate.missingFileTitle', 'Missing File'),
      translate(
        'tools:duplexCollate.missingFileMessage',
        'Please upload a PDF with at least 2 pages before processing.'
      )
    );
    return;
  }

  const splitPoint = getSplitPoint();
  if (splitPoint <= 0 || splitPoint >= duplexState.totalPages) {
    showAlert(
      translate('tools:duplexCollate.invalidSplitTitle', 'Invalid Split Point'),
      translate(
        'tools:duplexCollate.invalidSplitMessage',
        `Split point must be between page 1 and page ${duplexState.totalPages - 1}.`,
        {
          maxSplit: duplexState.totalPages - 1,
        }
      )
    );
    return;
  }

  const backOrder = getBackOrder();

  // Warn explicitly if the blocks will be unequal (likely a scan error)
  const { frontCount, backCount } = buildDuplexOrder(
    duplexState.totalPages,
    splitPoint,
    backOrder
  );
  if (frontCount !== backCount) {
    const proceed = await showConfirm(
      translate(
        'tools:duplexCollate.unevenConfirmMessage',
        `The front block has ${frontCount} page(s) and the back block has ${backCount} page(s).\nThis usually means a page was scanned twice or is missing.\n\nThe ${Math.abs(frontCount - backCount)} unpaired page(s) will be appended at the end.\n\nContinue anyway?`,
        {
          frontCount,
          backCount,
          extraCount: Math.abs(frontCount - backCount),
        }
      )
    );
    if (!proceed) return;
  }

  const groupedCheckbox = document.getElementById(
    'export-grouped'
  ) as HTMLInputElement | null;
  const pagesPerDocInput = document.getElementById(
    'pages-per-document'
  ) as HTMLInputElement | null;

  const exportGrouped = groupedCheckbox?.checked === true;
  const pagesPerDocument = Number.parseInt(pagesPerDocInput?.value || '0', 10);

  if (
    exportGrouped &&
    (!Number.isFinite(pagesPerDocument) || pagesPerDocument < 1)
  ) {
    showAlert(
      translate('tools:duplexCollate.invalidGroupTitle', 'Invalid Group Size'),
      translate(
        'tools:duplexCollate.invalidGroupMessage',
        'Please enter a valid number of pages per original document.'
      )
    );
    return;
  }

  showLoader(
    translate('tools:duplexCollate.collatingLoader', 'Collating duplex scan...')
  );

  try {
    const { order } = buildDuplexOrder(
      duplexState.totalPages,
      splitPoint,
      backOrder
    );
    const baseName = getBaseFilename();

    if (!exportGrouped) {
      const bytes = await createPdfFromIndices(duplexState.pdfDoc, order);
      const blob = new Blob([bytesToArrayBuffer(bytes)], {
        type: 'application/pdf',
      });
      downloadFile(blob, `${baseName}_collated.pdf`);
      hideLoader();
      showAlert(
        translate('common.success', 'Success'),
        translate(
          'tools:duplexCollate.successMessage',
          'Collated PDF generated successfully.'
        ),
        'success'
      );
      return;
    }

    const documents: Array<{ name: string; bytes: Uint8Array }> = [];
    for (let start = 0; start < order.length; start += pagesPerDocument) {
      const chunk = order.slice(start, start + pagesPerDocument);
      if (chunk.length === 0) continue;
      const chunkBytes = await createPdfFromIndices(duplexState.pdfDoc, chunk);
      documents.push({
        name: `${baseName}_doc_${documents.length + 1}.pdf`,
        bytes: chunkBytes,
      });
    }

    const fileCount = documents.length;

    if (fileCount === 0) {
      hideLoader();
      showAlert(
        translate('common.error', 'Error'),
        translate(
          'tools:duplexCollate.processErrorMessage',
          'Failed to collate PDF.'
        )
      );
      return;
    }

    if (fileCount === 1) {
      const blob = new Blob([bytesToArrayBuffer(documents[0].bytes)], {
        type: 'application/pdf',
      });
      downloadFile(blob, documents[0].name);
    } else {
      const zip = new JSZip();
      for (const { name, bytes } of documents) {
        zip.file(name, bytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, `${baseName}_collated_grouped.zip`);
    }

    hideLoader();
    showAlert(
      translate('common.success', 'Success'),
      translate(
        'tools:duplexCollate.successGroupedMessage',
        `Collation complete. Generated ${fileCount} grouped file(s).`,
        {
          fileCount,
        }
      ),
      'success'
    );
  } catch (error) {
    console.error('Duplex collate error:', error);
    hideLoader();
    showAlert(
      translate('common.error', 'Error'),
      translate(
        'tools:duplexCollate.processErrorMessage',
        'Failed to collate PDF.'
      )
    );
  }
}

/**
 * Clears selected file data and restores the page UI to its initial state.
 */
function resetState() {
  duplexState.file = null;
  duplexState.pdfDoc = null;
  duplexState.totalPages = 0;

  const options = document.getElementById('duplex-options');
  const fileDisplayArea = document.getElementById('file-display-area');
  const oddBanner = document.getElementById('odd-page-banner');
  if (oddBanner) {
    oddBanner.classList.add('hidden');
    oddBanner.textContent = '';
  }
  const splitInput = document.getElementById(
    'split-page'
  ) as HTMLInputElement | null;
  const groupedCheckbox = document.getElementById(
    'export-grouped'
  ) as HTMLInputElement | null;
  const pagesPerDocInput = document.getElementById(
    'pages-per-document'
  ) as HTMLInputElement | null;
  const warning = document.getElementById('duplex-warning');
  const summary = document.getElementById('duplex-preview-summary');

  options?.classList.add('hidden');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';
  if (splitInput) splitInput.value = '';
  if (groupedCheckbox) groupedCheckbox.checked = false;
  if (pagesPerDocInput) pagesPerDocInput.value = '2';
  if (warning) {
    warning.classList.add('hidden');
    warning.textContent = '';
  }
  if (summary) summary.textContent = '';
  toggleGroupedOptions();
}
