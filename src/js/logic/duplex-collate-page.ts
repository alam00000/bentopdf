import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { formatBytes, downloadFile } from '../utils/helpers.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { loadPdfDocument } from '../utils/load-pdf-document.js';
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

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

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFile(input.files[0]);
  }
}

async function handleFile(file: File) {
  if (
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    showAlert('Invalid File', 'Please select a PDF file.');
    return;
  }

  showLoader('Loading PDF...');

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
    showAlert('Error', 'Failed to load PDF file.');
  }
}

function stripPdfExtension(name: string): string {
  return name.replace(/\.pdf$/i, '');
}

function getBaseFilename(): string {
  return stripPdfExtension(duplexState.file?.name || 'document');
}

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
  metaSpan.textContent = `${formatBytes(duplexState.file.size)} • ${duplexState.totalPages} pages`;

  infoContainer.append(nameSpan, metaSpan);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = resetState;

  fileDiv.append(infoContainer, removeBtn);
  fileDisplayArea.appendChild(fileDiv);
  createIcons({ icons });
}

function showOptions() {
  const options = document.getElementById('duplex-options');
  const totalPagesEl = document.getElementById('total-pages');

  options?.classList.remove('hidden');
  if (totalPagesEl) {
    totalPagesEl.textContent = duplexState.totalPages.toString();
  }
}

function showOddPageWarning() {
  const banner = document.getElementById('odd-page-banner');
  if (!banner) return;
  if (duplexState.totalPages % 2 !== 0) {
    banner.classList.remove('hidden');
    banner.textContent = `⚠ Odd page count (${duplexState.totalPages}). A duplex scan should have an even number of pages — you may have a missing or extra page.`;
  } else {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

function applyDefaultSplitPoint() {
  const splitInput = document.getElementById(
    'split-page'
  ) as HTMLInputElement | null;
  if (!splitInput) return;
  splitInput.value = Math.ceil(duplexState.totalPages / 2).toString();
}

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

function getBackOrder(): 'reverse' | 'keep' {
  const backOrder = document.getElementById(
    'back-order'
  ) as HTMLSelectElement | null;
  return backOrder?.value === 'keep' ? 'keep' : 'reverse';
}

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

  summary.textContent =
    `Front block: ${frontCount} page(s), back block: ${backCount} page(s). ` +
    `Output: ${order.length} page(s), in front/back sequence.`;

  if (frontCount !== backCount) {
    warning.classList.remove('hidden');
    warning.textContent =
      `Front and back block lengths differ (${frontCount} front vs ${backCount} back). ` +
      `The ${Math.abs(frontCount - backCount)} extra page(s) on the longer side will be appended unpaired at the end.`;
  } else {
    warning.classList.add('hidden');
    warning.textContent = '';
  }
}

async function createPdfFromIndices(
  sourceDoc: PDFDocument,
  indices: number[]
): Promise<Uint8Array> {
  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(sourceDoc, indices);
  copiedPages.forEach((page) => outDoc.addPage(page));
  return new Uint8Array(await outDoc.save());
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const { buffer, byteOffset, byteLength } = bytes;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  const copy = new Uint8Array(byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function processDuplexCollate() {
  if (!duplexState.file || !duplexState.pdfDoc || duplexState.totalPages < 2) {
    showAlert(
      'Missing File',
      'Please upload a PDF with at least 2 pages before processing.'
    );
    return;
  }

  const splitPoint = getSplitPoint();
  if (splitPoint <= 0 || splitPoint >= duplexState.totalPages) {
    showAlert(
      'Invalid Split Point',
      `Split point must be between page 1 and page ${duplexState.totalPages - 1}.`
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
    const proceed = window.confirm(
      `The front block has ${frontCount} page(s) and the back block has ${backCount} page(s).\n` +
        `This usually means a page was scanned twice or is missing.\n\n` +
        `The ${Math.abs(frontCount - backCount)} unpaired page(s) will be appended at the end.\n\n` +
        `Continue anyway?`
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
      'Invalid Group Size',
      'Please enter a valid number of pages per original document.'
    );
    return;
  }

  showLoader('Collating duplex scan...');

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
      showAlert('Success', 'Collated PDF generated successfully.', 'success');
      return;
    }

    const zip = new JSZip();
    let fileCount = 0;
    for (let start = 0; start < order.length; start += pagesPerDocument) {
      const chunk = order.slice(start, start + pagesPerDocument);
      if (chunk.length === 0) continue;
      const chunkBytes = await createPdfFromIndices(duplexState.pdfDoc, chunk);
      fileCount += 1;
      zip.file(`${baseName}_doc_${fileCount}.pdf`, chunkBytes);
    }

    if (fileCount === 1) {
      const firstChunk = order.slice(0, pagesPerDocument);
      const bytes = await createPdfFromIndices(duplexState.pdfDoc, firstChunk);
      const blob = new Blob([bytesToArrayBuffer(bytes)], {
        type: 'application/pdf',
      });
      downloadFile(blob, `${baseName}_doc_1.pdf`);
    } else {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, `${baseName}_collated_grouped.zip`);
    }

    hideLoader();
    showAlert(
      'Success',
      `Collation complete. Generated ${fileCount} grouped file(s).`,
      'success'
    );
  } catch (error) {
    console.error('Duplex collate error:', error);
    hideLoader();
    showAlert('Error', 'Failed to collate PDF.');
  }
}

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
