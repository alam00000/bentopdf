import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { deduplicateFileName } from '../utils/deduplicate-filename.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import {
  HYPER_PRESETS,
  HyperError,
  normalizeHyperOptions,
} from 'hyper-compress-wasm';
import type {
  HyperCompressOptions,
  HyperWasmResult,
} from 'hyper-compress-wasm';
import type {
  CompressFileLock,
  CompressPasswordField,
  HyperOptionField,
  HyperOptionSection,
} from '@/types';
import {
  applyHyperPreset,
  compressWithHyper,
  hasPdfHeader,
  matchHyperPreset,
  resolveCompressLevel,
  targetSizeToBytes,
  verifyHyperPassword,
} from '../utils/compress.js';
import { t } from '../i18n/i18n';

type OptionChangeHandler = (
  key: keyof HyperCompressOptions,
  value: number | boolean | null
) => void;

const LOCK_MESSAGES = {
  locked: {
    text: 'Password protected',
    color: 'text-gray-400',
    field: 'border-gray-600 focus:ring-indigo-500',
  },
  wrong: {
    text: 'Wrong password',
    color: 'text-red-400',
    field: 'border-red-500 focus:ring-red-500',
  },
  unlocked: {
    text: 'Unlocked',
    color: 'text-green-400',
    field: 'border-green-500 focus:ring-green-500',
  },
} as const;

const PASSWORD_INPUT_CLASS =
  'w-full bg-gray-800 border text-gray-200 placeholder:text-gray-500 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent';

const DPI_CHOICES = [
  { value: 0, label: 'None' },
  { value: 72, label: '72 DPI' },
  { value: 96, label: '96 DPI' },
  { value: 144, label: '144 DPI' },
  { value: 150, label: '150 DPI' },
  { value: 200, label: '200 DPI' },
  { value: 300, label: '300 DPI' },
];

const HYPER_OPTION_SECTIONS: HyperOptionSection[] = [
  {
    title: 'Images',
    open: true,
    fields: [
      {
        key: 'imageQuality',
        type: 'number',
        label: 'Image quality',
        min: 20,
        max: 100,
        help: 'JPEG quality for re-encoded images, 20 to 100. Lower means smaller files and more visible artifacts.',
      },
      {
        key: 'maxDpi',
        type: 'dpi',
        label: 'Maximum resolution',
        help: 'Images above this are resampled down. None leaves resolution alone.',
      },
      {
        key: 'forceDownsample',
        type: 'bool',
        label: 'Always resample to that resolution',
        help: 'Resamples even when an image is only slightly above the limit.',
      },
      {
        key: 'grayscale',
        type: 'bool',
        label: 'Convert to grayscale',
        help: 'Reduces file size by removing color information.',
      },
      {
        key: 'reduceColor',
        type: 'bool',
        label: 'Reduce color complexity',
        help: 'Only where it does not change how the image looks.',
      },
      {
        key: 'clipImages',
        type: 'bool',
        label: 'Clip invisible parts of images',
      },
      {
        key: 'removeAlternates',
        type: 'bool',
        label: 'Remove alternate images',
      },
      {
        key: 'flattenIcc',
        type: 'bool',
        label: 'Simplify large color profiles',
      },
      {
        key: 'preferJpx',
        type: 'bool',
        label: 'Prefer JPEG 2000 for photos',
        help: 'Tries JPEG 2000 against JPEG for each image and keeps the smaller one.',
      },
      {
        key: 'lossless',
        type: 'bool',
        label: 'Lossless (no image re-encoding)',
        help: 'Turns off quality, resolution and every other lossy image step.',
      },
    ],
  },
  {
    title: 'Fonts',
    fields: [
      {
        key: 'subsetFonts',
        type: 'bool',
        label: 'Subset embedded fonts',
        help: 'Keeps only the characters the document uses.',
      },
      { key: 'mergeFonts', type: 'bool', label: 'Merge duplicate fonts' },
      {
        key: 'removeStandardFonts',
        type: 'bool',
        label: 'Unembed standard fonts',
        help: 'PDF readers supply the 14 standard PDF fonts themselves.',
      },
      {
        key: 'unembedAliasedFonts',
        type: 'bool',
        label: 'Unembed standard-font look-alikes',
        help: 'Arial, Times New Roman and Courier New map to the built-in equivalents. Only applied when safe.',
      },
    ],
  },
  {
    title: 'Content',
    fields: [
      {
        key: 'removeAnnots',
        type: 'bool',
        label: 'Flatten annotations',
        help: 'Comments and markup become part of the page. Form fields and links keep working.',
      },
      {
        key: 'flattenForms',
        type: 'bool',
        label: 'Flatten form fields',
        help: 'Form fields stop being fillable.',
      },
      {
        key: 'flattenLinks',
        type: 'bool',
        label: 'Flatten links',
        help: 'Links stop being clickable.',
      },
    ],
  },
  {
    title: 'Cleanup',
    fields: [
      {
        key: 'removeThumbnails',
        type: 'bool',
        label: 'Remove page thumbnails',
      },
      {
        key: 'removeAppData',
        type: 'bool',
        label: 'Remove application data',
        help: 'Private data that editing apps store inside the PDF.',
      },
      { key: 'removeThreads', type: 'bool', label: 'Remove article threads' },
      {
        key: 'removeSpiderInfo',
        type: 'bool',
        label: 'Remove web capture information',
      },
      {
        key: 'removeStructTree',
        type: 'bool',
        label: 'Remove document structure tree',
        help: 'Drops tagging, which screen readers rely on.',
      },
      {
        key: 'removeOutputIntents',
        type: 'bool',
        label: 'Remove output intents',
      },
    ],
  },
  {
    title: 'Rasterize',
    fields: [
      {
        key: 'rasterizePages',
        type: 'bool',
        label: 'Rasterize pages to images',
        help: 'For image-only PDFs such as scans. Skipped when the document has selectable text, unless Override content protection is on.',
      },
      {
        key: 'rasterizeDpi',
        type: 'number',
        label: 'Rasterize resolution (DPI)',
        min: 36,
        max: 600,
      },
      {
        key: 'rasterizeQuality',
        type: 'number',
        label: 'Rasterize quality',
        min: 1,
        max: 100,
      },
    ],
  },
  {
    title: 'Output',
    fields: [
      {
        key: 'preserveConformance',
        type: 'bool',
        label: 'Preserve PDF/A',
        help: 'Keeps a PDF/A file conformant. Brotli and rasterizing are skipped while this is on.',
      },
      {
        key: 'brotli',
        type: 'bool',
        label: 'Brotli compression (PDF 2.0)',
        help: 'Smaller files, but only readers with Brotli support can open them, such as Firefox, MuPDF 1.26+ and Ghostscript 10.06+.',
      },
    ],
  },
];

// The panel can be built before initI18n() resolves; data-i18n lets
// applyTranslations() in main.ts relabel it once the language is loaded.
const setHyperOptionText = (
  element: HTMLElement,
  id: string,
  english: string
): void => {
  const key = `tools:compressPdf.hyperOptions.${id}`;
  element.dataset.i18n = key;
  element.textContent = t(key, { defaultValue: english });
};

function buildOptionField(
  field: HyperOptionField,
  onChange: OptionChangeHandler
): { element: HTMLElement; sync: (options: HyperCompressOptions) => void } {
  const id = `hyper-opt-${field.key}`;
  const wrapper = document.createElement('div');
  let help: HTMLParagraphElement | null = null;
  if (field.help) {
    help = document.createElement('p');
    help.className = 'text-xs text-gray-500 mt-0.5';
    setHyperOptionText(help, `${field.key}Help`, field.help);
  }

  if (field.type === 'bool') {
    const label = document.createElement('label');
    label.className = 'flex items-start gap-2 cursor-pointer';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.className = 'w-4 h-4 mt-0.5 rounded flex-shrink-0';
    input.addEventListener('change', () => onChange(field.key, input.checked));
    const text = document.createElement('span');
    const title = document.createElement('span');
    title.className = 'block text-sm text-gray-300';
    setHyperOptionText(title, field.key, field.label);
    text.append(title);
    if (help) text.append(help);
    label.append(input, text);
    wrapper.append(label);
    return {
      element: wrapper,
      sync: (options) => {
        input.checked = Boolean(options[field.key]);
      },
    };
  }

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'block mb-1 text-xs font-medium text-gray-400';
  setHyperOptionText(label, field.key, field.label);
  wrapper.append(label);
  const controlClass =
    'w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm';

  if (field.type === 'dpi') {
    const select = document.createElement('select');
    select.id = id;
    select.className = controlClass;
    for (const choice of DPI_CHOICES) {
      const option = document.createElement('option');
      option.value = String(choice.value);
      if (choice.value === 0) {
        setHyperOptionText(option, 'dpiNone', choice.label);
      } else {
        option.textContent = choice.label;
      }
      select.append(option);
    }
    select.addEventListener('change', () =>
      onChange(field.key, Number(select.value))
    );
    wrapper.append(select);
    if (help) wrapper.append(help);
    return {
      element: wrapper,
      sync: (options) => {
        select.value = String(options[field.key]);
      },
    };
  }

  const input = document.createElement('input');
  input.type = 'number';
  input.id = id;
  input.min = String(field.min);
  input.max = String(field.max);
  input.step = '1';
  input.className = controlClass;
  input.addEventListener('change', () => {
    const value = Number(input.value);
    if (input.value.trim() === '' || !Number.isFinite(value)) {
      onChange(field.key, null);
      return;
    }
    onChange(
      field.key,
      Math.min(field.max, Math.max(field.min, Math.round(value)))
    );
  });
  wrapper.append(input);
  if (help) wrapper.append(help);
  return {
    element: wrapper,
    sync: (options) => {
      input.value = String(options[field.key]);
    },
  };
}

function renderHyperOptions(
  root: HTMLElement,
  onChange: OptionChangeHandler
): (options: HyperCompressOptions) => void {
  const syncs: ((options: HyperCompressOptions) => void)[] = [];
  for (const section of HYPER_OPTION_SECTIONS) {
    const details = document.createElement('details');
    details.className = 'group rounded-lg border border-gray-700';
    details.open = Boolean(section.open);
    const summary = document.createElement('summary');
    summary.className =
      'flex items-center justify-between cursor-pointer select-none list-none px-3 py-2 text-sm font-medium text-gray-200 [&::-webkit-details-marker]:hidden';
    const summaryText = document.createElement('span');
    setHyperOptionText(
      summaryText,
      `sections.${section.title.toLowerCase()}`,
      section.title
    );
    summary.append(summaryText);
    const chevron = document.createElement('i');
    chevron.setAttribute('data-lucide', 'chevron-down');
    chevron.className =
      'w-4 h-4 text-gray-400 transition-transform group-open:rotate-180';
    summary.append(chevron);
    const body = document.createElement('div');
    body.className = 'space-y-3 px-3 pb-3';
    for (const field of section.fields) {
      const { element, sync } = buildOptionField(field, onChange);
      body.append(element);
      syncs.push(sync);
    }
    details.append(summary, body);
    root.append(details);
  }
  return (options) => {
    for (const sync of syncs) sync(options);
  };
}

function describeCompressResult(
  result: HyperWasmResult,
  options: HyperCompressOptions,
  targetBytes: number | undefined
): { title: string; message: string; type: string } {
  const saved = result.originalSize - result.compressedSize;
  const parts: string[] = [];
  if (saved > 0) {
    const percent = ((saved / result.originalSize) * 100).toFixed(1);
    parts.push(
      `File size reduced from ${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)} (Saved ${percent}%).`
    );
  } else {
    parts.push(
      `Could not reduce file size further. Original: ${formatBytes(result.originalSize)}, New: ${formatBytes(result.compressedSize)}.`
    );
  }

  const preservingPdfa = options.preserveConformance && result.pdfa !== null;
  if (targetBytes !== undefined) {
    if (result.metTarget) {
      parts.push(`It fits the ${formatBytes(targetBytes)} target.`);
    } else if (preservingPdfa) {
      parts.push(
        `It is still above the ${formatBytes(targetBytes)} target because Preserve PDF/A limits how far it can be compressed.`
      );
    } else {
      parts.push(
        `It is still above the ${formatBytes(targetBytes)} target. This is the smallest these settings allow; for image-only scans, turn on Rasterize pages under Custom Settings.`
      );
    }
  }

  if (result.signaturesRemoved) {
    parts.push(
      'Its digital signatures were removed so it could be compressed. Sign it again if needed.'
    );
  }

  if (result.pdfaOutcome === 'claim-withdrawn') {
    parts.push(
      'It no longer claims PDF/A conformance. Turn on Preserve PDF/A under Custom Settings to keep it.'
    );
  } else if (preservingPdfa && (options.brotli || options.rasterizePages)) {
    parts.push('Brotli and rasterizing were skipped to keep it PDF/A.');
  }

  if (saved <= 0) {
    return {
      title: 'Compression Finished',
      message: parts.join(' '),
      type: 'warning',
    };
  }
  if (result.metTarget === false) {
    return {
      title: 'Target Not Reached',
      message: parts.join(' '),
      type: 'warning',
    };
  }
  return {
    title: 'Compression Complete',
    message: parts.join(' '),
    type: 'success',
  };
}

function describeCompressionError(err: unknown, hadPassword: boolean): string {
  if (err instanceof HyperError && err.code === 'decrypt_failed') {
    return hadPassword ? 'wrong password' : 'password protected';
  }
  return err instanceof Error ? err.message : String(err);
}

function createPasswordField(
  label: string,
  value: string,
  onInput: (value: string) => void
): CompressPasswordField {
  const root = document.createElement('div');
  root.className = 'relative w-full sm:max-w-sm';

  const lockIcon = createIcon(
    'lock',
    'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
  );
  const unlockIcon = createIcon(
    'lock-open',
    'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-400 hidden'
  );

  const input = document.createElement('input');
  input.type = 'password';
  input.placeholder = 'Enter password';
  input.autocomplete = 'off';
  input.value = value;
  input.setAttribute('aria-label', label);
  input.className = `${PASSWORD_INPUT_CLASS} ${LOCK_MESSAGES.locked.field}`;
  input.addEventListener('input', () => onInput(input.value));

  const showIcon = createIcon('eye', '');
  const hideIcon = createIcon('eye-slash', 'hidden');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className =
    'absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200';
  toggle.setAttribute('aria-label', 'Show password');
  toggle.append(showIcon, hideIcon);
  toggle.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    toggle.setAttribute(
      'aria-label',
      reveal ? 'Hide password' : 'Show password'
    );
    showIcon.classList.toggle('hidden', reveal);
    hideIcon.classList.toggle('hidden', !reveal);
  });

  root.append(lockIcon, unlockIcon, input, toggle);

  const status = document.createElement('p');
  status.className = 'text-xs mt-1 text-gray-400';
  status.setAttribute('aria-live', 'polite');
  return { root, input, status, lockIcon, unlockIcon };
}

function createIcon(name: string, className: string): HTMLElement {
  const icon = document.createElement('i');
  icon.className = `ph ph-${name} text-base ${className}`;
  return icon;
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const compressOptions = document.getElementById('compress-options');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const levelSelect = document.getElementById(
    'compression-level'
  ) as HTMLSelectElement;
  const targetSizeInput = document.getElementById(
    'target-size'
  ) as HTMLInputElement;
  const targetSizeUnit = document.getElementById(
    'target-size-unit'
  ) as HTMLSelectElement;
  const overrideInput = document.getElementById(
    'override-protection'
  ) as HTMLInputElement;
  const toggleCustomSettings = document.getElementById(
    'toggle-custom-settings'
  );
  const customSettingsPanel = document.getElementById('custom-settings-panel');
  const customSettingsChevron = document.getElementById(
    'custom-settings-chevron'
  );
  const hyperOptionsRoot = document.getElementById('hyper-options');

  const defaultTargetUnit =
    targetSizeUnit?.dataset.defaultUnit === 'kb' ? 'kb' : 'mb';
  let options: HyperCompressOptions = normalizeHyperOptions(
    HYPER_PRESETS.medium
  );

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const setCustomSettingsOpen = (open: boolean) => {
    if (!customSettingsPanel || !customSettingsChevron) return;
    customSettingsPanel.classList.toggle('hidden', !open);
    customSettingsChevron.style.transform = open
      ? 'rotate(180deg)'
      : 'rotate(0deg)';
  };

  const syncLevel = () => {
    if (levelSelect) levelSelect.value = matchHyperPreset(options) ?? 'custom';
  };

  const syncOptionControls: (options: HyperCompressOptions) => void =
    hyperOptionsRoot
      ? renderHyperOptions(hyperOptionsRoot, (key, value) => {
          if (value !== null) {
            options = normalizeHyperOptions({ ...options, [key]: value });
          }
          syncOptionControls(options);
          syncLevel();
        })
      : () => {};

  levelSelect?.addEventListener('change', () => {
    if (levelSelect.value === 'custom') {
      setCustomSettingsOpen(true);
      return;
    }
    options = applyHyperPreset(
      resolveCompressLevel(levelSelect.value),
      options
    );
    syncOptionControls(options);
  });

  overrideInput?.addEventListener('change', () => {
    options = {
      ...options,
      rasterizeText: overrideInput.checked,
      removeSignatures: overrideInput.checked,
    };
  });

  // Toggle custom settings panel
  toggleCustomSettings?.addEventListener('click', () => {
    setCustomSettingsOpen(
      customSettingsPanel?.classList.contains('hidden') ?? false
    );
  });

  const applyDefaults = () => {
    options = normalizeHyperOptions(HYPER_PRESETS.medium);
    if (overrideInput) overrideInput.checked = false;
    if (targetSizeInput) targetSizeInput.value = targetSizeInput.defaultValue;
    if (targetSizeUnit) targetSizeUnit.value = defaultTargetUnit;
    setCustomSettingsOpen(false);
    syncOptionControls(options);
    syncLevel();
  };

  const fileLocks = new Map<File, CompressFileLock>();
  const lockViews = new Map<File, CompressPasswordField>();
  let sharedView: CompressPasswordField | null = null;
  let sharedPassword = '';
  let sharedAttempt = 0;
  let sharedMissed = false;

  const isProtected = (
    lock: CompressFileLock | undefined
  ): lock is CompressFileLock =>
    lock !== undefined && lock.status !== 'checking' && lock.status !== 'open';

  const protectedFiles = () =>
    state.files.filter((file) => isProtected(fileLocks.get(file)));

  const tryPassword = async (
    file: File,
    password: string
  ): Promise<boolean | null> => {
    try {
      return await verifyHyperPassword(await file.arrayBuffer(), password);
    } catch (err) {
      console.error('[CompressPDF] Password check failed:', err);
      return null;
    }
  };

  const paintShared = () => {
    if (!sharedView) return;
    const files = protectedFiles();
    const unlocked = files.filter(
      (file) => fileLocks.get(file)?.status === 'unlocked'
    ).length;
    if (sharedMissed && unlocked < files.length) {
      sharedView.status.textContent =
        'That password did not open any of the remaining files.';
      sharedView.status.className = 'text-xs mt-1 text-red-400';
      return;
    }
    sharedView.status.textContent = `Unlocked ${unlocked} of ${files.length} files.`;
    sharedView.status.className = `text-xs mt-1 ${unlocked === files.length ? 'text-green-400' : 'text-gray-400'}`;
  };

  const paintLock = (file: File) => {
    const lock = fileLocks.get(file);
    const view = lockViews.get(file);
    if (lock && view && lock.status !== 'checking' && lock.status !== 'open') {
      const { text, color, field } = LOCK_MESSAGES[lock.status];
      if (view.input.value !== lock.password) view.input.value = lock.password;
      view.status.textContent = text;
      view.status.className = `truncate ${color}`;
      view.input.className = `${PASSWORD_INPUT_CLASS} ${field}`;
      view.lockIcon.classList.toggle('hidden', lock.status === 'unlocked');
      view.unlockIcon.classList.toggle('hidden', lock.status !== 'unlocked');
    }
    paintShared();
  };

  const checkCardPassword = (file: File, lock: CompressFileLock) => {
    const attempt = ++lock.attempt;
    lock.status = 'locked';
    paintLock(file);
    if (!lock.password) return;
    window.setTimeout(async () => {
      if (lock.attempt !== attempt) return;
      const valid = await tryPassword(file, lock.password);
      if (lock.attempt !== attempt || valid === null) return;
      lock.status = valid ? 'unlocked' : 'wrong';
      paintLock(file);
    }, 400);
  };

  const applySharedPassword = (password: string) => {
    const attempt = ++sharedAttempt;
    sharedPassword = password;
    sharedMissed = false;
    paintShared();
    if (!password) return;
    window.setTimeout(async () => {
      if (attempt !== sharedAttempt) return;
      let matched = 0;
      for (const file of protectedFiles()) {
        const lock = fileLocks.get(file);
        if (!lock || lock.status === 'unlocked') continue;
        const before = lock.attempt;
        const valid = await tryPassword(file, password);
        if (attempt !== sharedAttempt) return;
        if (!valid || lock.attempt !== before) continue;
        lock.attempt++;
        lock.password = password;
        lock.status = 'unlocked';
        matched++;
        paintLock(file);
      }
      sharedMissed = matched === 0;
      paintShared();
    }, 400);
  };

  const updateUI = async () => {
    if (!compressOptions) return;

    if (state.files.length > 0) {
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) {
        const focusedFile = [...lockViews].find(
          ([, view]) => view.input === document.activeElement
        )?.[0];
        const sharedFocused = sharedView?.input === document.activeElement;
        lockViews.clear();
        sharedView = null;
        fileDisplayArea.replaceChildren();

        if (protectedFiles().length > 1) {
          const sharedDiv = document.createElement('div');
          sharedDiv.className = 'bg-gray-700 p-3 rounded-lg text-sm';
          const sharedLabel = document.createElement('div');
          sharedLabel.className = 'font-medium text-gray-200 text-sm';
          sharedLabel.textContent = 'Password for all locked files';
          sharedView = createPasswordField(
            'Password for all locked files',
            sharedPassword,
            applySharedPassword
          );
          sharedView.root.classList.add('mt-2');
          sharedDiv.append(sharedLabel, sharedView.root, sharedView.status);
          fileDisplayArea.appendChild(sharedDiv);
        }

        for (const file of state.files) {
          const lock = fileLocks.get(file);
          const locked = isProtected(lock);
          const fileDiv = document.createElement('div');
          fileDiv.className = 'bg-gray-700 p-3 rounded-lg text-sm';

          const headerRow = document.createElement('div');
          headerRow.className = 'flex items-center justify-between';

          const infoContainer = document.createElement('div');
          infoContainer.className = 'flex flex-col flex-1 min-w-0';

          const nameSpan = document.createElement('div');
          nameSpan.className =
            'truncate font-medium text-gray-200 text-sm mb-1';
          nameSpan.textContent = file.name;

          const metaSpan = document.createElement('div');
          metaSpan.className = 'text-xs text-gray-400';
          metaSpan.textContent = formatBytes(file.size);

          infoContainer.append(nameSpan, metaSpan);
          headerRow.append(infoContainer);
          fileDiv.append(headerRow);

          if (locked) {
            const view = createPasswordField(
              `Password for ${file.name}`,
              lock.password,
              (value) => {
                lock.password = value;
                checkCardPassword(file, lock);
              }
            );
            lockViews.set(file, view);
            view.root.classList.add('mt-3');
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'flex-shrink-0 whitespace-nowrap';
            sizeSpan.textContent = `${formatBytes(file.size)} ·`;
            metaSpan.className = 'flex gap-1 min-w-0 text-xs text-gray-400';
            metaSpan.replaceChildren(sizeSpan, view.status);
            fileDiv.append(view.root);
          }

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className =
            'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
          removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
          removeBtn.append(createIcon('trash', ''));
          removeBtn.onclick = () => {
            state.files = state.files.filter((f) => f !== file);
            fileLocks.delete(file);
            updateUI();
          };

          headerRow.append(removeBtn);
          fileDisplayArea.appendChild(fileDiv);
        }

        for (const file of lockViews.keys()) paintLock(file);
        paintShared();
        if (focusedFile) lockViews.get(focusedFile)?.input.focus();
        if (sharedFocused) sharedView?.input.focus();
      }
      compressOptions.classList.remove('hidden');
    } else {
      compressOptions.classList.add('hidden');
      // Clear file display area
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) fileDisplayArea.replaceChildren();
    }
  };

  const resetState = () => {
    state.files = [];
    state.pdfDoc = null;
    fileLocks.clear();
    sharedPassword = '';
    sharedAttempt++;
    sharedMissed = false;
    applyDefaults();
    updateUI();
  };

  const compressSingle = async (
    file: File,
    runOptions: HyperCompressOptions,
    targetBytes: number | undefined
  ) => {
    const lock = fileLocks.get(file);
    const password = isProtected(lock) ? lock.password : '';
    showLoader(
      targetBytes === undefined
        ? t('tools:compressPdf.loader.compressing')
        : `Compressing to ${formatBytes(targetBytes)}...`
    );
    const result = await compressWithHyper(await file.arrayBuffer(), {
      options: runOptions,
      targetSizeBytes: targetBytes,
      password,
    });
    hideLoader();

    if (result.signed) {
      showAlert(
        t('tools:compressPdf.alert.signedPdfNotChanged'),
        `${file.name} is digitally signed, so it was left as it is. Compressing it would break the signature. To compress it anyway, turn on Override content protection under Custom Settings; its signatures will be removed.`,
        'warning',
        () => resetState()
      );
      return;
    }

    downloadFile(
      new Blob([new Uint8Array(result.data)], { type: 'application/pdf' }),
      file.name
    );
    const { title, message, type } = describeCompressResult(
      result,
      runOptions,
      targetBytes
    );
    showAlert(
      title,
      password
        ? `${message} It was password protected, so the compressed copy has no password. Use Protect PDF to add one again.`
        : message,
      type,
      () => resetState()
    );
  };

  const compressBatch = async (
    files: File[],
    runOptions: HyperCompressOptions,
    targetBytes: number | undefined
  ) => {
    showLoader(t('tools:compressPdf.loader.compressingMultiplePdfs'));
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let compressedCount = 0;
    let signedCount = 0;
    let signaturesRemovedCount = 0;
    let missedTargetCount = 0;
    let withdrawnPdfaCount = 0;
    let unlockedCount = 0;
    const failures: string[] = [];
    const zipNames = new Set<string>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      showLoader(`Compressing ${i + 1}/${files.length}: ${file.name}...`);
      const lock = fileLocks.get(file);
      const password = isProtected(lock) ? lock.password : '';
      try {
        const result = await compressWithHyper(await file.arrayBuffer(), {
          options: runOptions,
          targetSizeBytes: targetBytes,
          password,
        });
        if (password) unlockedCount++;
        if (result.signed) signedCount++;
        if (result.signaturesRemoved) signaturesRemovedCount++;
        if (result.metTarget === false) missedTargetCount++;
        if (result.pdfaOutcome === 'claim-withdrawn') withdrawnPdfaCount++;
        zip.file(deduplicateFileName(file.name, zipNames), result.data);
        totalOriginalSize += file.size;
        totalCompressedSize += result.data.length;
        compressedCount++;
      } catch (err) {
        console.error('[CompressPDF] Error:', err);
        failures.push(
          `${file.name} (${describeCompressionError(err, password !== '')})`
        );
      }
    }

    if (compressedCount === 0) {
      hideLoader();
      showAlert(
        t('common.error'),
        `None of the files could be compressed: ${failures.join(', ')}.`
      );
      return;
    }

    showLoader(t('tools:compressPdf.loader.creatingZip'));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'compressed-pdfs.zip');
    hideLoader();

    const totalSavings = totalOriginalSize - totalCompressedSize;
    const parts = [
      totalSavings > 0
        ? `Compressed ${compressedCount} PDF(s). Total size reduced from ${formatBytes(totalOriginalSize)} to ${formatBytes(totalCompressedSize)} (Saved ${((totalSavings / totalOriginalSize) * 100).toFixed(1)}%).`
        : `Compressed ${compressedCount} PDF(s). Total size: ${formatBytes(totalCompressedSize)}.`,
    ];
    if (signedCount > 0) {
      parts.push(
        `${signedCount} digitally signed PDF(s) were left as they are to keep their signatures valid. Turn on Override content protection under Custom Settings to compress them anyway.`
      );
    }
    if (signaturesRemovedCount > 0) {
      parts.push(
        `${signaturesRemovedCount} had their digital signatures removed so they could be compressed.`
      );
    }
    if (unlockedCount > 0) {
      parts.push(
        `${unlockedCount} password-protected PDF(s) were unlocked, so their compressed copies have no password. Use Protect PDF to add one again.`
      );
    }
    if (missedTargetCount > 0 && targetBytes !== undefined) {
      parts.push(
        `${missedTargetCount} could not get under the ${formatBytes(targetBytes)} target.`
      );
    }
    if (withdrawnPdfaCount > 0) {
      parts.push(
        `${withdrawnPdfaCount} no longer claim PDF/A conformance. Turn on Preserve PDF/A under Custom Settings to keep it.`
      );
    }
    if (failures.length > 0) {
      parts.push(`Skipped: ${failures.join(', ')}.`);
    }

    const hasProblems = failures.length > 0 || missedTargetCount > 0;
    showAlert(
      hasProblems
        ? t('tools:compressPdf.alert.compressionFinished')
        : t('tools:compressPdf.alert.compressionComplete'),
      parts.join(' '),
      hasProblems ? 'warning' : totalSavings > 0 ? 'success' : 'info',
      () => resetState()
    );
  };

  const compress = async () => {
    if (state.files.length === 0) {
      showAlert(t('alert.noFiles'), t('alert.selectLeastOnePdf'));
      return;
    }

    const needPassword = state.files.filter((file) => {
      const lock = fileLocks.get(file);
      return isProtected(lock) && (lock.status === 'wrong' || !lock.password);
    });
    if (needPassword.length > 0) {
      showAlert(
        t('tools:compressPdf.alert.passwordNeeded'),
        needPassword.length === 1
          ? `${needPassword[0].name} is password protected. Enter its password on the file card, then compress again.`
          : `These files are password protected: ${needPassword.map((file) => file.name).join(', ')}. Enter their passwords on the file cards, or remove them, then compress again.`,
        'warning',
        () => lockViews.get(needPassword[0])?.input.focus()
      );
      return;
    }

    const runOptions = { ...options };
    const targetBytes =
      targetSizeInput && targetSizeUnit
        ? targetSizeToBytes(Number(targetSizeInput.value), targetSizeUnit.value)
        : undefined;
    const files = [...state.files];

    try {
      if (files.length === 1) {
        await compressSingle(files[0], runOptions, targetBytes);
      } else {
        await compressBatch(files, runOptions, targetBytes);
      }
    } catch (e: unknown) {
      hideLoader();
      if (e instanceof HyperError && e.code === 'decrypt_failed') {
        const file = files[0];
        const lock = fileLocks.get(file);
        if (lock) {
          lock.attempt++;
          lock.status = lock.password ? 'wrong' : 'locked';
        }
        updateUI();
        showAlert(
          t('tools:compressPdf.alert.passwordNeeded'),
          `${file.name} is password protected. Enter its password on the file card, then compress again.`,
          'warning',
          () => lockViews.get(file)?.input.focus()
        );
        return;
      }
      console.error('[CompressPDF] Error:', e);
      showAlert(
        t('common.error'),
        `An error occurred during compression. Error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  };

  const handleFileSelect = async (files: ArrayLike<File> | null) => {
    if (files && files.length > 0) {
      const added: File[] = [];
      const rejected: string[] = [];
      for (const file of Array.from(files)) {
        if (hasPdfHeader(await file.slice(0, 1024).arrayBuffer())) {
          added.push(file);
        } else {
          rejected.push(file.name);
        }
      }
      if (rejected.length > 0) {
        showAlert(
          t('tools:compressPdf.alert.notPdf'),
          rejected.length === 1
            ? `${rejected[0]} is not a valid PDF, so it was not added.`
            : `These files are not valid PDFs, so they were not added: ${rejected.join(', ')}.`,
          'warning'
        );
      }
      if (added.length === 0) return;
      for (const file of added) {
        fileLocks.set(file, { status: 'checking', password: '', attempt: 0 });
      }
      state.files = [...state.files, ...added];
      updateUI();

      for (const file of added) {
        const lock = fileLocks.get(file);
        if (!lock) continue;
        const opens = await tryPassword(file, '');
        if (fileLocks.get(file) !== lock || lock.status !== 'checking')
          continue;
        lock.status = opens === false ? 'locked' : 'open';
        if (lock.status === 'locked') updateUI();
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
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(
          (f) =>
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
        );
        handleFileSelect(pdfFiles);
      }
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
    clearFilesBtn.addEventListener('click', () => {
      resetState();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', compress);
  }

  applyDefaults();
  createIcons({ icons });
});
