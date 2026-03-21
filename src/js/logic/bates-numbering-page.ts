import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, hexToRgb, formatBytes } from '../utils/helpers.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import Sortable from 'sortablejs';
import { FileEntry, Position, StylePreset } from '@/types';

const FONT_MAP: Record<string, keyof typeof StandardFonts> = {
  Helvetica: 'Helvetica',
  TimesRoman: 'TimesRoman',
  Courier: 'Courier',
};

const STYLE_PRESETS: Record<string, StylePreset> = {
  'full-6': {
    template: 'Exhibit [FILE] Case XYZ [BATES] Page [PAGE]',
    padding: 6,
  },
  'full-5': {
    template: 'Exhibit [FILE] Case XYZ [BATES] Page [PAGE]',
    padding: 5,
  },
  'full-4': {
    template: 'Exhibit [FILE] Case XYZ [BATES] Page [PAGE]',
    padding: 4,
  },
  'full-3': {
    template: 'Exhibit [FILE] Case XYZ [BATES] Page [PAGE]',
    padding: 3,
  },
  'full-0': {
    template: 'Exhibit [FILE] Case XYZ [BATES] Page [PAGE]',
    padding: 0,
  },
  'no-page-6': { template: 'Exhibit [FILE] Case XYZ [BATES]', padding: 6 },
  'no-page-5': { template: 'Exhibit [FILE] Case XYZ [BATES]', padding: 5 },
  'no-page-4': { template: 'Exhibit [FILE] Case XYZ [BATES]', padding: 4 },
  'no-page-3': { template: 'Exhibit [FILE] Case XYZ [BATES]', padding: 3 },
  'no-page-0': { template: 'Exhibit [FILE] Case XYZ [BATES]', padding: 0 },
  'case-6': { template: 'Case XYZ [BATES]', padding: 6 },
  'case-5': { template: 'Case XYZ [BATES]', padding: 5 },
  'case-4': { template: 'Case XYZ [BATES]', padding: 4 },
  'case-3': { template: 'Case XYZ [BATES]', padding: 3 },
  'case-0': { template: 'Case XYZ [BATES]', padding: 0 },
  'bates-6': { template: '[BATES]', padding: 6 },
  'bates-5': { template: '[BATES]', padding: 5 },
  'bates-4': { template: '[BATES]', padding: 4 },
  'bates-3': { template: '[BATES]', padding: 3 },
  'bates-0': { template: '[BATES]', padding: 0 },
};

const files: FileEntry[] = [];

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const backBtn = document.getElementById('back-to-tools');
  const processBtn = document.getElementById('process-btn');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const stylePreset = document.getElementById(
    'style-preset'
  ) as HTMLSelectElement;
  const templateInput = document.getElementById(
    'bates-template'
  ) as HTMLInputElement;

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) {
        handleFiles(fileInput.files);
        fileInput.value = '';
      }
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', applyBatesNumbers);
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => fileInput?.click());
  }

  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', resetState);
  }

  if (stylePreset) {
    stylePreset.addEventListener('change', () => {
      const value = stylePreset.value;
      const isCustom = value === 'custom';
      const paddingGroup = document.getElementById('padding-group');
      if (!isCustom && STYLE_PRESETS[value]) {
        templateInput.value = STYLE_PRESETS[value].template;
        if (paddingGroup) paddingGroup.classList.add('hidden');
      } else {
        if (paddingGroup) paddingGroup.classList.remove('hidden');
      }
      templateInput.readOnly = !isCustom;
      updatePreview();
    });
  }

  if (templateInput) {
    templateInput.addEventListener('input', () => {
      const preset = stylePreset;
      if (preset && preset.value !== 'custom') {
        preset.value = 'custom';
        templateInput.readOnly = false;
        document.getElementById('padding-group')?.classList.remove('hidden');
      }
      updatePreview();
    });
  }

  document
    .getElementById('bates-padding')
    ?.addEventListener('change', updatePreview);
  document
    .getElementById('bates-start')
    ?.addEventListener('input', updatePreview);
  document
    .getElementById('file-start')
    ?.addEventListener('input', updatePreview);

  initSortable();
}

function initSortable() {
  const fileList = document.getElementById('file-list');
  if (!fileList) return;
  Sortable.create(fileList, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: (evt) => {
      if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
        const [moved] = files.splice(evt.oldIndex, 1);
        files.splice(evt.newIndex, 0, moved);
        updatePreview();
      }
    },
  });
}

async function handleFiles(fileList: FileList) {
  showLoader('Loading PDFs...');
  try {
    for (const file of Array.from(fileList)) {
      if (file.type !== 'application/pdf') continue;
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      files.push({ file, pageCount: pdfDoc.getPageCount() });
    }

    if (files.length === 0) {
      showAlert('Invalid File', 'Please upload valid PDF files.');
      return;
    }

    renderFileList();
    document.getElementById('options-panel')?.classList.remove('hidden');
    document.getElementById('file-controls')?.classList.remove('hidden');
    updatePreview();
  } catch (error) {
    console.error(error);
    showAlert('Error', 'Failed to load one or more PDF files.');
  } finally {
    hideLoader();
  }
}

function renderFileList() {
  const fileListEl = document.getElementById('file-list');
  if (!fileListEl) return;

  fileListEl.innerHTML = '';
  let totalPages = 0;

  files.forEach((entry, index) => {
    totalPages += entry.pageCount;

    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const leftSection = document.createElement('div');
    leftSection.className = 'flex items-center gap-3 flex-1 min-w-0';

    const dragHandle = document.createElement('i');
    dragHandle.setAttribute('data-lucide', 'grip-vertical');
    dragHandle.className =
      'drag-handle w-4 h-4 text-gray-400 cursor-grab flex-shrink-0';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm';
    nameSpan.textContent = entry.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(entry.file.size)} \u2022 ${entry.pageCount} pages`;

    infoContainer.append(nameSpan, metaSpan);
    leftSection.append(dragHandle, infoContainer);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => {
      files.splice(index, 1);
      renderFileList();
      updatePreview();
      if (files.length === 0) resetState();
    };

    fileDiv.append(leftSection, removeBtn);
    fileListEl.appendChild(fileDiv);
  });

  createIcons({ icons });

  const summary = document.createElement('div');
  summary.className = 'text-xs text-gray-400 mt-1';
  summary.textContent = `${files.length} file${files.length !== 1 ? 's' : ''} \u2022 ${totalPages} total pages`;
  fileListEl.appendChild(summary);
}

function formatBatesText(
  template: string,
  batesNum: number,
  pageNum: number,
  fileNum: number,
  fileName: string,
  padding: number
): string {
  const batesStr =
    padding > 0 ? String(batesNum).padStart(padding, '0') : String(batesNum);
  return template
    .replace(/\[BATES\]/g, batesStr)
    .replace(/\[PAGE\]/g, String(pageNum))
    .replace(/\[FILE\]/g, String(fileNum))
    .replace(/\[FILENAME\]/g, fileName);
}

function getActivePadding(): number {
  const presetValue = (
    document.getElementById('style-preset') as HTMLSelectElement
  ).value;
  if (presetValue !== 'custom' && STYLE_PRESETS[presetValue]) {
    return STYLE_PRESETS[presetValue].padding;
  }
  return (
    parseInt(
      (document.getElementById('bates-padding') as HTMLSelectElement).value
    ) || 0
  );
}

function updatePreview() {
  const previewEl = document.getElementById('preview-content');
  if (!previewEl) return;

  const template = (
    document.getElementById('bates-template') as HTMLInputElement
  ).value;
  const padding = getActivePadding();
  const batesStart =
    parseInt(
      (document.getElementById('bates-start') as HTMLInputElement).value
    ) || 1;
  const fileStart =
    parseInt(
      (document.getElementById('file-start') as HTMLInputElement).value
    ) || 1;

  const lines: string[] = [];

  if (files.length === 0) {
    lines.push(
      formatBatesText(template, batesStart, 1, fileStart, 'document', padding)
    );
    lines.push(
      formatBatesText(
        template,
        batesStart + 1,
        2,
        fileStart,
        'document',
        padding
      )
    );
  } else {
    let batesCounter = batesStart;
    let fileCounter = fileStart;
    for (const entry of files) {
      const name = entry.file.name.replace(/\.pdf$/i, '');
      lines.push(
        `File ${fileCounter}, Page 1: ${formatBatesText(template, batesCounter, 1, fileCounter, name, padding)}`
      );
      if (entry.pageCount > 1) {
        lines.push(
          `File ${fileCounter}, Page 2: ${formatBatesText(template, batesCounter + 1, 2, fileCounter, name, padding)}`
        );
      }
      batesCounter += entry.pageCount;
      fileCounter++;
    }
    const lastEntry = files[files.length - 1];
    const lastName = lastEntry.file.name.replace(/\.pdf$/i, '');
    const lastBates = batesCounter - 1;
    lines.push('...');
    lines.push(
      `File ${fileStart + files.length - 1}, Page ${lastEntry.pageCount}: ${formatBatesText(template, lastBates, lastEntry.pageCount, fileStart + files.length - 1, lastName, padding)}`
    );
  }

  previewEl.textContent = lines.join('\n');
}

function calculatePosition(
  pageWidth: number,
  pageHeight: number,
  xOffset: number,
  yOffset: number,
  textWidth: number,
  fontSize: number,
  position: Position
): { x: number; y: number } {
  const minMargin = 8;
  const maxMargin = 40;
  const marginPct = 0.04;

  const hMargin = Math.max(
    minMargin,
    Math.min(maxMargin, pageWidth * marginPct)
  );
  const vMargin = Math.max(
    minMargin,
    Math.min(maxMargin, pageHeight * marginPct)
  );
  const safeH = Math.max(hMargin, textWidth / 2 + 3);
  const safeV = Math.max(vMargin, fontSize + 3);

  let x = 0,
    y = 0;

  switch (position) {
    case 'bottom-center':
      x =
        Math.max(
          safeH,
          Math.min(pageWidth - safeH - textWidth, (pageWidth - textWidth) / 2)
        ) + xOffset;
      y = safeV + yOffset;
      break;
    case 'bottom-left':
      x = safeH + xOffset;
      y = safeV + yOffset;
      break;
    case 'bottom-right':
      x = Math.max(safeH, pageWidth - safeH - textWidth) + xOffset;
      y = safeV + yOffset;
      break;
    case 'top-center':
      x =
        Math.max(
          safeH,
          Math.min(pageWidth - safeH - textWidth, (pageWidth - textWidth) / 2)
        ) + xOffset;
      y = pageHeight - safeV - fontSize + yOffset;
      break;
    case 'top-left':
      x = safeH + xOffset;
      y = pageHeight - safeV - fontSize + yOffset;
      break;
    case 'top-right':
      x = Math.max(safeH, pageWidth - safeH - textWidth) + xOffset;
      y = pageHeight - safeV - fontSize + yOffset;
      break;
  }

  x = Math.max(xOffset + 3, Math.min(xOffset + pageWidth - textWidth - 3, x));
  y = Math.max(yOffset + 3, Math.min(yOffset + pageHeight - fontSize - 3, y));

  return { x, y };
}

function resetState() {
  files.length = 0;
  const fileListEl = document.getElementById('file-list');
  if (fileListEl) fileListEl.innerHTML = '';
  document.getElementById('options-panel')?.classList.add('hidden');
  document.getElementById('file-controls')?.classList.add('hidden');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

async function applyBatesNumbers() {
  if (files.length === 0) {
    showAlert('Error', 'Please upload at least one PDF file.');
    return;
  }

  showLoader('Applying Bates numbers...');
  try {
    const template = (
      document.getElementById('bates-template') as HTMLInputElement
    ).value;
    const padding = getActivePadding();
    const batesStart =
      parseInt(
        (document.getElementById('bates-start') as HTMLInputElement).value
      ) || 1;
    const fileStart =
      parseInt(
        (document.getElementById('file-start') as HTMLInputElement).value
      ) || 1;
    const position = (document.getElementById('position') as HTMLSelectElement)
      .value as Position;
    const fontKey = (
      document.getElementById('font-family') as HTMLSelectElement
    ).value;
    const fontSize =
      parseInt(
        (document.getElementById('font-size') as HTMLInputElement).value
      ) || 10;
    const colorHex = (document.getElementById('text-color') as HTMLInputElement)
      .value;
    const textColor = hexToRgb(colorHex);

    const fontName = FONT_MAP[fontKey] || 'Helvetica';
    const results: { name: string; bytes: Uint8Array }[] = [];
    let batesCounter = batesStart;
    let fileCounter = fileStart;

    for (const entry of files) {
      const arrayBuffer = await entry.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts[fontName]);
      const pages = pdfDoc.getPages();
      const fileName = entry.file.name.replace(/\.pdf$/i, '');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const bounds = page.getCropBox() || page.getMediaBox();
        const text = formatBatesText(
          template,
          batesCounter,
          i + 1,
          fileCounter,
          fileName,
          padding
        );
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        const { x, y } = calculatePosition(
          bounds.width,
          bounds.height,
          bounds.x || 0,
          bounds.y || 0,
          textWidth,
          fontSize,
          position
        );

        page.drawText(text, {
          x,
          y,
          font,
          size: fontSize,
          color: rgb(textColor.r, textColor.g, textColor.b),
        });

        batesCounter++;
      }

      fileCounter++;
      const pdfBytes = await pdfDoc.save();
      results.push({
        name: `bates_${entry.file.name}`,
        bytes: new Uint8Array(pdfBytes),
      });
    }

    if (results.length === 1) {
      downloadFile(
        new Blob([new Uint8Array(results[0].bytes)], {
          type: 'application/pdf',
        }),
        results[0].name
      );
    } else {
      const zip = new JSZip();
      for (const result of results) {
        zip.file(result.name, result.bytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'bates_numbered.zip');
    }

    showAlert(
      'Success',
      `Bates numbers applied successfully! (${batesStart} through ${batesCounter - 1})`,
      'success',
      () => {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to apply Bates numbers.');
  } finally {
    hideLoader();
  }
}
