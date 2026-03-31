import { createIcons, icons } from 'lucide';
import type {
  AddPageLabelsState,
  LabelRule,
  PageLabelStyleName,
  CpdfInstance,
} from '@/types';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { t } from '../i18n/index.js';
import {
  downloadFile,
  formatBytes,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { getCpdf, isCpdfAvailable } from '../utils/cpdf-helper.js';
import { showWasmRequiredDialog } from '../utils/wasm-provider.js';
import {
  PAGE_LABEL_STYLE_OPTIONS,
  normalizePageLabelStartValue,
  resolvePageLabelStyle,
} from '../utils/page-labels.js';
import { loadPdfDocument } from '../utils/load-pdf-document.js';

let labelRuleCounter = 0;

const translate = (
  key: string,
  fallback: string,
  options?: Record<string, unknown>
) => {
  const translation = t(key, options);
  return translation && translation !== key ? translation : fallback;
};

const STYLE_LABEL_FALLBACKS: Record<PageLabelStyleName, string> = {
  DecimalArabic: 'Decimal Arabic',
  LowercaseRoman: 'Lowercase Roman',
  UppercaseRoman: 'Uppercase Roman',
  LowercaseLetters: 'Lowercase Letters',
  UppercaseLetters: 'Uppercase Letters',
  NoLabelPrefixOnly: 'No Label Prefix Only',
};

const pageState: AddPageLabelsState = {
  file: null,
  pageCount: 0,
  rules: [createLabelRule()],
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function createLabelRule(overrides: Partial<LabelRule> = {}): LabelRule {
  labelRuleCounter += 1;

  return {
    id: `label-rule-${labelRuleCounter}`,
    pageRange: '',
    style: 'DecimalArabic',
    prefix: '',
    startValue: 1,
    progress: false,
    ...overrides,
  };
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById(
    'drop-zone'
  ) as HTMLDivElement | null;
  const backBtn = document.getElementById('back-to-tools');
  const processBtn = document.getElementById('process-btn');
  const addRuleBtn = document.getElementById('add-rule-btn');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });

    dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      if (event.dataTransfer?.files.length) {
        handleFiles(event.dataTransfer.files);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      pageState.rules.push(createLabelRule());
      renderRules();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', addPageLabels);
  }

  renderRules();
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    handleFiles(input.files);
  }
}

async function handleFiles(files: FileList) {
  const file = files[0];
  if (
    !file ||
    (file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf'))
  ) {
    showAlert(
      translate('tools:addPageLabels.invalidFileTitle', 'Invalid File'),
      translate(
        'tools:addPageLabels.invalidFileMessage',
        'Please upload a valid PDF file.'
      )
    );
    return;
  }

  showLoader(translate('tools:addPageLabels.loadingPdf', 'Loading PDF...'));
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdfDoc = await loadPdfDocument(arrayBuffer as ArrayBuffer);

    if (pdfDoc.isEncrypted) {
      showAlert(
        translate('tools:addPageLabels.protectedPdfTitle', 'Protected PDF'),
        translate(
          'tools:addPageLabels.protectedPdfMessage',
          'This PDF is password-protected. Please use the Decrypt or Change Permissions tool first.'
        )
      );
      resetState();
      return;
    }

    pageState.file = file;
    pageState.pageCount = pdfDoc.getPageCount();

    updateFileDisplay();
    document.getElementById('options-panel')?.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    showAlert(
      translate('common.error', 'Error'),
      translate(
        'tools:addPageLabels.loadErrorMessage',
        'Failed to load PDF file. The file may be invalid, corrupted, or password-protected.'
      )
    );
  } finally {
    hideLoader();
  }
}

function updateFileDisplay() {
  const fileDisplayArea = document.getElementById('file-display-area');
  if (!fileDisplayArea || !pageState.file) return;

  fileDisplayArea.innerHTML = '';

  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'flex flex-col flex-1 min-w-0';

  const nameSpan = document.createElement('div');
  nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
  nameSpan.textContent = pageState.file.name;

  const metaSpan = document.createElement('div');
  metaSpan.className = 'text-xs text-gray-400';
  metaSpan.textContent = translate(
    'tools:addPageLabels.fileMeta',
    `${formatBytes(pageState.file.size)} • ${pageState.pageCount} pages`,
    {
      size: formatBytes(pageState.file.size),
      count: pageState.pageCount,
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

function resetState() {
  pageState.file = null;
  pageState.pageCount = 0;
  pageState.rules = [createLabelRule()];

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  document.getElementById('options-panel')?.classList.add('hidden');
  renderRules();
}

function renderRules() {
  const ruleList = document.getElementById('label-rules');
  if (!ruleList) return;

  ruleList.innerHTML = '';

  pageState.rules.forEach((rule, index) => {
    const card = document.createElement('div');
    card.className =
      'rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-4';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between gap-4';

    const title = document.createElement('div');
    title.className = 'text-sm font-semibold text-white';
    title.textContent = translate(
      'tools:addPageLabels.ruleTitle',
      `Label Rule ${index + 1}`,
      { number: index + 1 }
    );

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className =
      'text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed';
    removeBtn.disabled = pageState.rules.length === 1;
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.addEventListener('click', () => {
      if (pageState.rules.length === 1) {
        return;
      }
      pageState.rules = pageState.rules.filter((entry) => entry.id !== rule.id);
      renderRules();
    });

    header.append(title, removeBtn);

    const rangeGroup = document.createElement('div');
    const rangeLabel = document.createElement('label');
    rangeLabel.className = 'block mb-2 text-sm font-medium text-gray-300';
    rangeLabel.textContent = translate(
      'tools:addPageLabels.pageRangeLabel',
      'Page Range'
    );
    const rangeInput = document.createElement('input');
    rangeInput.type = 'text';
    rangeInput.value = rule.pageRange;
    rangeInput.placeholder = translate(
      'tools:addPageLabels.pageRangePlaceholder',
      'All pages, or e.g. 1-4, 7, odd'
    );
    rangeInput.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500';
    rangeInput.addEventListener('input', (event) => {
      rule.pageRange = (event.target as HTMLInputElement).value;
    });
    rangeGroup.append(rangeLabel, rangeInput);

    const styleGrid = document.createElement('div');
    styleGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    const styleGroup = document.createElement('div');
    const styleLabel = document.createElement('label');
    styleLabel.className = 'block mb-2 text-sm font-medium text-gray-300';
    styleLabel.textContent = translate(
      'tools:addPageLabels.labelStyleLabel',
      'Label Style'
    );
    const styleSelect = document.createElement('select');
    styleSelect.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500';

    PAGE_LABEL_STYLE_OPTIONS.forEach((styleName) => {
      const option = document.createElement('option');
      option.value = styleName;
      option.textContent = translate(
        `tools:addPageLabels.styleOptions.${styleName}`,
        STYLE_LABEL_FALLBACKS[styleName]
      );
      option.selected = styleName === rule.style;
      styleSelect.appendChild(option);
    });

    styleSelect.addEventListener('change', (event) => {
      rule.style = (event.target as HTMLSelectElement)
        .value as PageLabelStyleName;
    });
    styleGroup.append(styleLabel, styleSelect);

    const prefixGroup = document.createElement('div');
    const prefixLabel = document.createElement('label');
    prefixLabel.className = 'block mb-2 text-sm font-medium text-gray-300';
    prefixLabel.textContent = translate(
      'tools:addPageLabels.labelPrefixLabel',
      'Label Prefix'
    );
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.value = rule.prefix;
    prefixInput.placeholder = translate(
      'tools:addPageLabels.labelPrefixPlaceholder',
      'Optional prefix, e.g. A-'
    );
    prefixInput.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500';
    prefixInput.addEventListener('input', (event) => {
      rule.prefix = (event.target as HTMLInputElement).value;
    });
    prefixGroup.append(prefixLabel, prefixInput);

    styleGrid.append(styleGroup, prefixGroup);

    const startGrid = document.createElement('div');
    startGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    const startGroup = document.createElement('div');
    const startLabel = document.createElement('label');
    startLabel.className = 'block mb-2 text-sm font-medium text-gray-300';
    startLabel.textContent = translate(
      'tools:addPageLabels.startValueLabel',
      'Start Value'
    );
    const startInput = document.createElement('input');
    startInput.type = 'number';
    startInput.min = '0';
    startInput.step = '1';
    startInput.value = String(rule.startValue);
    startInput.className =
      'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500';
    startInput.addEventListener('input', (event) => {
      rule.startValue = normalizePageLabelStartValue(
        parseInt((event.target as HTMLInputElement).value, 10)
      );
    });
    startGroup.append(startLabel, startInput);

    const progressGroup = document.createElement('div');
    progressGroup.className = 'flex items-end';
    const progressLabel = document.createElement('label');
    progressLabel.className =
      'flex w-full items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300';
    const progressInput = document.createElement('input');
    progressInput.type = 'checkbox';
    progressInput.checked = rule.progress;
    progressInput.className =
      'h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500';
    progressInput.addEventListener('change', (event) => {
      rule.progress = (event.target as HTMLInputElement).checked;
    });
    const progressText = document.createElement('span');
    progressText.textContent = translate(
      'tools:addPageLabels.continueNumbering',
      'Continue numbering across disjoint ranges'
    );
    progressLabel.append(progressInput, progressText);
    progressGroup.appendChild(progressLabel);

    startGrid.append(startGroup, progressGroup);

    const note = document.createElement('p');
    note.className = 'text-xs text-gray-500';
    note.textContent = translate(
      'tools:addPageLabels.examplesNote',
      'Examples: 1-4 for Roman front matter, 15-20 with prefix A- and start value 0, or odd with progress enabled.'
    );

    card.append(header, rangeGroup, styleGrid, startGrid, note);
    ruleList.appendChild(card);
  });

  createIcons({ icons });
}

async function addPageLabels() {
  if (!pageState.file) {
    showAlert(
      translate('common.error', 'Error'),
      translate(
        'tools:addPageLabels.uploadFirstMessage',
        'Please upload a PDF file first.'
      )
    );
    return;
  }

  if (!isCpdfAvailable()) {
    showWasmRequiredDialog('cpdf');
    return;
  }

  showLoader(
    translate('tools:addPageLabels.applyingLabels', 'Applying page labels...')
  );

  const removeExistingLabels =
    (
      document.getElementById(
        'remove-existing-labels'
      ) as HTMLInputElement | null
    )?.checked ?? true;

  let cpdf: CpdfInstance | null = null;
  let pdf: unknown = null;

  try {
    cpdf = await getCpdf();
    cpdf.setSlow?.();

    const inputBytes = new Uint8Array(await pageState.file.arrayBuffer());
    pdf = cpdf.fromMemory(inputBytes, '');

    if (removeExistingLabels) {
      cpdf.removePageLabels(pdf);
    }

    for (let index = 0; index < pageState.rules.length; index += 1) {
      const rule = pageState.rules[index];
      const trimmedRange = rule.pageRange.trim();

      let range: unknown;
      try {
        range = trimmedRange
          ? cpdf.parsePagespec(pdf, trimmedRange)
          : cpdf.all(pdf);
      } catch (error) {
        throw new Error(
          translate(
            'tools:addPageLabels.invalidRangeMessage',
            `Rule ${index + 1} has an invalid page range: ${trimmedRange || 'all pages'}`,
            {
              number: index + 1,
              range:
                trimmedRange ||
                translate('tools:addPageLabels.allPages', 'all pages'),
            }
          ),
          { cause: error }
        );
      }

      cpdf.addPageLabels(
        pdf,
        resolvePageLabelStyle(cpdf, rule.style),
        rule.prefix.trim(),
        normalizePageLabelStartValue(rule.startValue),
        range,
        rule.progress
      );
    }

    const outputBytes = new Uint8Array(cpdf.toMemory(pdf, false, false));
    if (!outputBytes || outputBytes.length === 0) {
      throw new Error(
        translate(
          'tools:addPageLabels.emptyOutputMessage',
          'CoherentPDF produced an empty file.'
        )
      );
    }

    downloadFile(
      new Blob([outputBytes], { type: 'application/pdf' }),
      'page-labels-added.pdf'
    );
    showAlert(
      translate('common.success', 'Success'),
      translate(
        'tools:addPageLabels.successMessage',
        'Page labels added successfully!'
      ),
      'success',
      () => {
        resetState();
      }
    );
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error
        ? error.message
        : translate(
            'tools:addPageLabels.processErrorMessage',
            'Could not add page labels.'
          );
    showAlert(translate('common.error', 'Error'), message);
  } finally {
    if (cpdf && pdf) {
      try {
        cpdf.deletePdf(pdf);
      } catch (cleanupError) {
        console.warn('Failed to cleanup CoherentPDF document:', cleanupError);
      }
    }

    hideLoader();
  }
}
