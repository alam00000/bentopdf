import { decryptPdfBytes } from './pdf-decrypt.js';
import { readFileAsArrayBuffer, getPDFDocument } from './helpers.js';
import { createIcons, icons } from 'lucide';
import { PasswordResponses } from 'pdfjs-dist';
import type { LoadedPdf } from '@/types';

let cachedPassword: string | null = null;
let activeModalPromise: Promise<unknown> | null = null;

function getEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ensureSingleModal(): HTMLDivElement {
  let modal = getEl<HTMLDivElement>('password-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'password-modal';
  modal.className =
    'fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] hidden items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
      <div class="p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500/10 flex-shrink-0">
            <i data-lucide="lock" class="w-6 h-6 text-indigo-400"></i>
          </div>
          <div class="flex-1">
            <h3 id="password-modal-title" class="text-xl font-bold text-white mb-1">Password Required</h3>
            <p id="password-modal-subtitle" class="text-gray-400 text-sm truncate"></p>
          </div>
        </div>
        <div class="mt-4">
          <div class="relative">
            <input type="password" id="password-modal-input"
              class="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter password" autocomplete="off" />
            <button id="password-modal-toggle" type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
          <p id="password-modal-error" class="text-xs text-red-400 mt-2 hidden"></p>
          <p id="password-modal-progress" class="text-xs text-gray-400 mt-2 hidden"></p>
        </div>
      </div>
      <div class="flex gap-3 p-4 border-t border-gray-700">
        <button id="password-modal-cancel"
          class="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
          Skip
        </button>
        <button id="password-modal-submit"
          class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Unlock
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function ensureBatchModal(): HTMLDivElement {
  let modal = getEl<HTMLDivElement>('password-batch-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'password-batch-modal';
  modal.className =
    'fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] hidden items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
      <div class="p-6 overflow-y-auto flex-1 min-h-0">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500/10 flex-shrink-0">
            <i data-lucide="lock" class="w-6 h-6 text-indigo-400"></i>
          </div>
          <div class="flex-1">
            <h3 id="batch-modal-title" class="text-xl font-bold text-white mb-1"></h3>
            <p class="text-gray-400 text-sm">Enter passwords for each encrypted file</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-3 mb-3">
          <input type="checkbox" id="batch-modal-same-pw" checked
            class="w-4 h-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer" />
          <label for="batch-modal-same-pw" class="text-sm text-gray-300 cursor-pointer select-none">Use same password for all files</label>
        </div>
        <div id="batch-modal-shared" class="mb-3">
          <div class="relative">
            <input type="password" id="batch-modal-shared-input"
              class="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Password for all files" autocomplete="off" />
            <button id="batch-modal-shared-toggle" type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <div id="batch-modal-filelist" class="space-y-2 hidden"></div>
        <p id="batch-modal-error" class="text-xs text-red-400 mt-2 hidden"></p>
        <p id="batch-modal-progress" class="text-xs text-gray-400 mt-2 hidden"></p>
      </div>
      <div class="flex gap-3 p-4 border-t border-gray-700 flex-shrink-0">
        <button id="batch-modal-cancel"
          class="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
          Skip All
        </button>
        <button id="batch-modal-submit"
          class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Unlock All
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function validatePasswordWithPdfjs(
  pdfBytes: ArrayBuffer,
  password: string
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;

    const task = getPDFDocument({
      data: pdfBytes.slice(0),
      password,
    });

    task.onPassword = (
      _callback: (password: string) => void,
      reason: number
    ) => {
      if (settled) return;
      settled = true;
      resolve(reason !== PasswordResponses.INCORRECT_PASSWORD);
      task.destroy().catch(() => {});
    };

    task.promise
      .then((doc) => {
        doc.destroy();
        if (!settled) {
          settled = true;
          resolve(true);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      });
  });
}

async function isFileEncrypted(file: File): Promise<boolean> {
  const bytes = (await readFileAsArrayBuffer(file)) as ArrayBuffer;
  return new Promise((resolve) => {
    let settled = false;
    const task = getPDFDocument({ data: bytes.slice(0) });

    task.onPassword = () => {
      if (!settled) {
        settled = true;
        resolve(true);
        task.destroy().catch(() => {});
      }
    };

    task.promise
      .then((doc) => {
        doc.destroy();
        if (!settled) {
          settled = true;
          resolve(false);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      });
  });
}

async function decryptFileWithPassword(
  file: File,
  password: string
): Promise<File> {
  const fileBytes = (await readFileAsArrayBuffer(file)) as ArrayBuffer;
  const inputBytes = new Uint8Array(fileBytes);
  const result = await decryptPdfBytes(inputBytes, password);
  return new File([new Uint8Array(result.bytes)], file.name, {
    type: 'application/pdf',
  });
}

export async function promptAndDecryptFile(file: File): Promise<File | null> {
  if (activeModalPromise) {
    await activeModalPromise;
  }

  const fileBytes = (await readFileAsArrayBuffer(file)) as ArrayBuffer;

  if (cachedPassword) {
    const valid = await validatePasswordWithPdfjs(fileBytes, cachedPassword);
    if (valid) {
      try {
        return await decryptFileWithPassword(file, cachedPassword);
      } catch {
        cachedPassword = null;
      }
    } else {
      cachedPassword = null;
    }
  }

  const modal = ensureSingleModal();
  const input = getEl<HTMLInputElement>('password-modal-input');
  const titleEl = getEl<HTMLHeadingElement>('password-modal-title');
  const subtitleEl = getEl<HTMLParagraphElement>('password-modal-subtitle');
  const errorEl = getEl<HTMLParagraphElement>('password-modal-error');
  const progressEl = getEl<HTMLParagraphElement>('password-modal-progress');
  const submitBtn = getEl<HTMLButtonElement>('password-modal-submit');
  const cancelBtn = getEl<HTMLButtonElement>('password-modal-cancel');
  const toggleBtn = getEl<HTMLButtonElement>('password-modal-toggle');

  if (!input || !submitBtn || !cancelBtn) return null;

  if (titleEl) titleEl.textContent = 'Password Required';
  if (subtitleEl) subtitleEl.textContent = file.name;
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (progressEl) {
    progressEl.textContent = '';
    progressEl.classList.add('hidden');
  }
  input.value = '';
  input.type = 'password';
  submitBtn.disabled = false;
  submitBtn.textContent = 'Unlock';
  submitBtn.dataset.originalText = 'Unlock';
  cancelBtn.disabled = false;
  cancelBtn.textContent = 'Skip';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  createIcons({ icons });
  setTimeout(() => input.focus(), 100);

  const modalPromise = new Promise<File | null>((resolve) => {
    let resolved = false;
    let busy = false;

    function cleanup() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      submitBtn.removeEventListener('click', onSubmit);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeydown);
      if (toggleBtn) toggleBtn.removeEventListener('click', onToggle);
    }

    function finish(result: File | null) {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    }

    async function onSubmit() {
      if (busy) return;
      const password = input.value;
      if (!password) {
        if (errorEl) {
          errorEl.textContent = 'Please enter a password';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      if (errorEl) errorEl.classList.add('hidden');
      busy = true;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;
      if (progressEl) {
        progressEl.textContent = 'Validating...';
        progressEl.classList.remove('hidden');
      }

      const valid = await validatePasswordWithPdfjs(fileBytes, password);

      if (!valid) {
        busy = false;
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
        if (progressEl) progressEl.classList.add('hidden');
        input.value = '';
        input.focus();
        if (errorEl) {
          errorEl.textContent = 'Incorrect password. Please try again.';
          errorEl.classList.remove('hidden');
        }
        return;
      }

      if (progressEl) progressEl.textContent = 'Decrypting...';

      try {
        const decrypted = await decryptFileWithPassword(file, password);
        cachedPassword = password;
        if (progressEl) progressEl.classList.add('hidden');
        finish(decrypted);
      } catch {
        busy = false;
        submitBtn.disabled = false;
        cancelBtn.disabled = false;
        if (progressEl) progressEl.classList.add('hidden');
        if (errorEl) {
          errorEl.textContent =
            'Failed to decrypt. Try the Decrypt tool instead.';
          errorEl.classList.remove('hidden');
        }
      }
    }

    function onCancel() {
      if (busy) return;
      finish(null);
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }

    function onToggle() {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = toggleBtn?.querySelector('i[data-lucide]');
      if (icon)
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      createIcons({ icons });
    }

    submitBtn.addEventListener('click', onSubmit);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeydown);
    if (toggleBtn) toggleBtn.addEventListener('click', onToggle);
  });

  activeModalPromise = modalPromise;
  modalPromise.finally(() => {
    if (activeModalPromise === modalPromise) activeModalPromise = null;
  });
  return modalPromise;
}

export async function promptAndDecryptBatch(
  files: File[],
  encryptedIndices: number[]
): Promise<Map<number, File>> {
  if (activeModalPromise) {
    await activeModalPromise;
  }

  const decryptedFiles = new Map<number, File>();
  if (encryptedIndices.length === 0) return decryptedFiles;

  if (encryptedIndices.length === 1) {
    const idx = encryptedIndices[0];
    const decrypted = await promptAndDecryptFile(files[idx]);
    if (decrypted) decryptedFiles.set(idx, decrypted);
    return decryptedFiles;
  }

  if (cachedPassword) {
    let allValid = true;
    for (const idx of encryptedIndices) {
      const bytes = (await readFileAsArrayBuffer(files[idx])) as ArrayBuffer;
      const valid = await validatePasswordWithPdfjs(bytes, cachedPassword);
      if (!valid) {
        allValid = false;
        cachedPassword = null;
        break;
      }
    }

    if (allValid && cachedPassword) {
      const tempMap = new Map<number, File>();
      let allDecrypted = true;
      for (const idx of encryptedIndices) {
        try {
          tempMap.set(
            idx,
            await decryptFileWithPassword(files[idx], cachedPassword)
          );
        } catch {
          cachedPassword = null;
          allDecrypted = false;
          break;
        }
      }
      if (allDecrypted && tempMap.size === encryptedIndices.length) {
        for (const [k, v] of tempMap) decryptedFiles.set(k, v);
        return decryptedFiles;
      }
    }
  }

  const fileNames = encryptedIndices.map((i) => files[i].name);

  const modal = ensureBatchModal();
  const titleEl = getEl<HTMLHeadingElement>('batch-modal-title');
  const samePwCheckbox = getEl<HTMLInputElement>('batch-modal-same-pw');
  const sharedSection = getEl<HTMLDivElement>('batch-modal-shared');
  const sharedInput = getEl<HTMLInputElement>('batch-modal-shared-input');
  const sharedToggle = getEl<HTMLButtonElement>('batch-modal-shared-toggle');
  const filelistEl = getEl<HTMLDivElement>('batch-modal-filelist');
  const errorEl = getEl<HTMLParagraphElement>('batch-modal-error');
  const progressEl = getEl<HTMLParagraphElement>('batch-modal-progress');
  const submitBtn = getEl<HTMLButtonElement>('batch-modal-submit');
  const cancelBtn = getEl<HTMLButtonElement>('batch-modal-cancel');

  if (
    !submitBtn ||
    !cancelBtn ||
    !samePwCheckbox ||
    !sharedInput ||
    !filelistEl
  ) {
    return decryptedFiles;
  }

  if (titleEl)
    titleEl.textContent = `${fileNames.length} Files Need a Password`;

  samePwCheckbox.checked = true;
  sharedInput.value = '';
  sharedInput.type = 'password';
  if (sharedSection) sharedSection.classList.remove('hidden');
  filelistEl.classList.add('hidden');

  filelistEl.innerHTML = fileNames
    .map(
      (name, i) =>
        `<div class="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg transition-all" data-file-idx="${i}">
          <i data-lucide="file-lock" class="w-4 h-4 text-indigo-400 flex-shrink-0" data-icon-idx="${i}"></i>
          <span class="text-sm text-gray-300 truncate flex-1" title="${esc(name)}">${esc(name)}</span>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <input type="password" data-pw-idx="${i}" placeholder="Password"
              class="w-32 bg-gray-600 border border-gray-500 text-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent" autocomplete="off" />
            <button type="button" data-skip-idx="${i}" title="Skip this file"
              class="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-600 transition-colors">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>`
    )
    .join('');

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (progressEl) {
    progressEl.textContent = '';
    progressEl.classList.add('hidden');
  }
  submitBtn.disabled = false;
  submitBtn.textContent = 'Unlock All';
  submitBtn.dataset.originalText = 'Unlock All';
  cancelBtn.disabled = false;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  createIcons({ icons });
  setTimeout(() => sharedInput.focus(), 100);

  const batchPromise = new Promise<Map<number, File>>((resolve) => {
    let resolved = false;
    let busy = false;
    const skippedSet = new Set<number>();
    const succeededSet = new Set<number>();

    function getRemainingCount(): number {
      let count = 0;
      for (let i = 0; i < fileNames.length; i++) {
        if (!skippedSet.has(i) && !succeededSet.has(i)) count++;
      }
      return count;
    }

    function updateButtons(autoClose = false) {
      const hasSucceeded = succeededSet.size > 0;
      cancelBtn.textContent = hasSucceeded ? 'Skip Remaining' : 'Skip All';

      const remaining = getRemainingCount();
      if (autoClose && remaining === 0) {
        finish(decryptedFiles);
        return;
      }

      if (hasSucceeded) {
        submitBtn.textContent = `Unlock Remaining (${remaining})`;
        submitBtn.dataset.originalText = submitBtn.textContent;
      }
    }

    function toggleMode() {
      const useSame = samePwCheckbox.checked;
      if (sharedSection) sharedSection.classList.toggle('hidden', !useSame);
      filelistEl.classList.toggle('hidden', useSame);
      if (useSame) {
        setTimeout(() => sharedInput.focus(), 50);
      } else {
        const firstInput = filelistEl.querySelector<HTMLInputElement>(
          'input[data-pw-idx]:not(:disabled)'
        );
        if (firstInput) setTimeout(() => firstInput.focus(), 50);
      }
    }

    function markRowSuccess(localIdx: number) {
      succeededSet.add(localIdx);
      const row = filelistEl.querySelector<HTMLDivElement>(
        `[data-file-idx="${localIdx}"]`
      );
      if (!row) return;
      row.classList.remove('border', 'border-red-500/50');
      row.classList.add('opacity-50', 'border', 'border-green-500/50');
      const pwInput = row.querySelector<HTMLInputElement>('input[data-pw-idx]');
      if (pwInput) pwInput.disabled = true;
      const skipBtn = row.querySelector<HTMLButtonElement>('[data-skip-idx]');
      if (skipBtn) skipBtn.classList.add('hidden');
      const iconEl = row.querySelector<HTMLElement>(
        `[data-icon-idx="${localIdx}"]`
      );
      if (iconEl) {
        iconEl.setAttribute('data-lucide', 'check-circle');
        iconEl.classList.remove('text-indigo-400');
        iconEl.classList.add('text-green-400');
      }
      createIcons({ icons });
    }

    function markRowFailed(localIdx: number) {
      const row = filelistEl.querySelector<HTMLDivElement>(
        `[data-file-idx="${localIdx}"]`
      );
      if (!row) return;
      row.classList.remove('border-green-500/50');
      row.classList.add('border', 'border-red-500/50');
      const pwInput = row.querySelector<HTMLInputElement>('input[data-pw-idx]');
      if (pwInput) {
        pwInput.value = '';
        pwInput.focus();
        pwInput.classList.add('border-red-500');
        setTimeout(() => pwInput.classList.remove('border-red-500'), 2000);
      }
    }

    function onSkipFile(e: Event) {
      if (busy) return;
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-skip-idx]'
      );
      if (!btn || btn.dataset.skipIdx === undefined) return;
      const idx = parseInt(btn.dataset.skipIdx, 10);
      if (isNaN(idx) || succeededSet.has(idx)) return;
      const row = filelistEl.querySelector<HTMLDivElement>(
        `[data-file-idx="${idx}"]`
      );
      if (!row) return;

      if (skippedSet.has(idx)) {
        skippedSet.delete(idx);
        row.classList.remove('opacity-40');
        const pwInput =
          row.querySelector<HTMLInputElement>('input[data-pw-idx]');
        if (pwInput) pwInput.disabled = false;
        btn.title = 'Skip this file';
      } else {
        skippedSet.add(idx);
        row.classList.add('opacity-40');
        row.classList.remove('border', 'border-red-500/50');
        const pwInput =
          row.querySelector<HTMLInputElement>('input[data-pw-idx]');
        if (pwInput) pwInput.disabled = true;
        btn.title = 'Include this file';
      }
      updateButtons(true);
    }

    function cleanup() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      submitBtn.removeEventListener('click', onSubmit);
      cancelBtn.removeEventListener('click', onCancel);
      samePwCheckbox.removeEventListener('change', toggleMode);
      filelistEl.removeEventListener('click', onSkipFile);
      if (sharedToggle)
        sharedToggle.removeEventListener('click', onSharedToggle);
      sharedInput.removeEventListener('keydown', onKeydown);
    }

    function finish(result: Map<number, File>) {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    }

    async function onSubmit() {
      if (busy) return;
      const useSame = samePwCheckbox.checked;

      const toProcess: { localIdx: number; password: string }[] = [];

      for (let i = 0; i < fileNames.length; i++) {
        if (skippedSet.has(i) || succeededSet.has(i)) continue;

        let password: string;
        if (useSame) {
          password = sharedInput.value;
        } else {
          const pwInput = filelistEl.querySelector<HTMLInputElement>(
            `input[data-pw-idx="${i}"]`
          );
          password = pwInput?.value || '';
        }

        if (!password) {
          if (errorEl) {
            const msg = useSame
              ? 'Please enter a password'
              : `Please enter a password for ${fileNames[i]} or skip it`;
            errorEl.textContent = msg;
            errorEl.classList.remove('hidden');
          }
          return;
        }

        toProcess.push({ localIdx: i, password });
      }

      if (toProcess.length === 0) {
        finish(decryptedFiles);
        return;
      }

      if (errorEl) errorEl.classList.add('hidden');
      busy = true;
      submitBtn.disabled = true;
      cancelBtn.disabled = true;

      const failedNames: string[] = [];

      for (let i = 0; i < toProcess.length; i++) {
        const { localIdx, password } = toProcess[i];
        const realIdx = encryptedIndices[localIdx];

        if (progressEl) {
          progressEl.textContent = `Validating ${i + 1} of ${toProcess.length}: ${files[realIdx].name}`;
          progressEl.classList.remove('hidden');
        }

        const bytes = (await readFileAsArrayBuffer(
          files[realIdx]
        )) as ArrayBuffer;
        const valid = await validatePasswordWithPdfjs(bytes, password);

        if (!valid) {
          failedNames.push(files[realIdx].name);
          markRowFailed(localIdx);
          continue;
        }

        if (progressEl) {
          progressEl.textContent = `Decrypting ${i + 1} of ${toProcess.length}: ${files[realIdx].name}`;
        }

        try {
          const decrypted = await decryptFileWithPassword(
            files[realIdx],
            password
          );
          decryptedFiles.set(realIdx, decrypted);
          markRowSuccess(localIdx);
        } catch {
          failedNames.push(files[realIdx].name);
          markRowFailed(localIdx);
        }
      }

      if (progressEl) progressEl.classList.add('hidden');
      busy = false;
      submitBtn.disabled = false;
      cancelBtn.disabled = false;

      if (failedNames.length > 0) {
        if (errorEl) {
          errorEl.textContent = `Wrong password for: ${failedNames.join(', ')}`;
          errorEl.classList.remove('hidden');
        }
        if (!samePwCheckbox.checked) {
          const firstFailed = filelistEl.querySelector<HTMLInputElement>(
            'input[data-pw-idx]:not(:disabled)'
          );
          if (firstFailed) firstFailed.focus();
        } else {
          sharedInput.value = '';
          sharedInput.focus();
        }
        updateButtons();
        submitBtn.textContent = 'Retry Failed';
        return;
      }

      if (useSame && toProcess.length > 0) {
        cachedPassword = toProcess[0].password;
      }

      updateButtons();
      if (!resolved) finish(decryptedFiles);
    }

    function onCancel() {
      if (busy) return;
      finish(decryptedFiles);
    }

    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }

    function onSharedToggle() {
      const isPassword = sharedInput.type === 'password';
      sharedInput.type = isPassword ? 'text' : 'password';
      const icon = sharedToggle?.querySelector('i[data-lucide]');
      if (icon)
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      createIcons({ icons });
    }

    samePwCheckbox.addEventListener('change', toggleMode);
    submitBtn.addEventListener('click', onSubmit);
    cancelBtn.addEventListener('click', onCancel);
    filelistEl.addEventListener('click', onSkipFile);
    sharedInput.addEventListener('keydown', onKeydown);
    if (sharedToggle) sharedToggle.addEventListener('click', onSharedToggle);
  });

  activeModalPromise = batchPromise;
  batchPromise.finally(() => {
    if (activeModalPromise === batchPromise) activeModalPromise = null;
  });
  return batchPromise;
}

export type { LoadedPdf };

export async function loadPdfWithPasswordPrompt(
  file: File,
  files?: File[],
  index?: number
): Promise<LoadedPdf | null> {
  let bytes = (await readFileAsArrayBuffer(file)) as ArrayBuffer;
  let currentFile = file;

  try {
    const pdf = await getPDFDocument(bytes.slice(0)).promise;
    return { pdf, bytes, file: currentFile };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      (err as { name: string }).name === 'PasswordException'
    ) {
      const decryptedFile = await promptAndDecryptFile(currentFile);
      if (!decryptedFile) return null;
      currentFile = decryptedFile;
      if (files && index !== undefined) {
        files[index] = decryptedFile;
      }
      bytes = (await readFileAsArrayBuffer(decryptedFile)) as ArrayBuffer;
      const pdf = await getPDFDocument(bytes.slice(0)).promise;
      return { pdf, bytes, file: currentFile };
    }
    throw err;
  }
}

export async function batchDecryptIfNeeded(files: File[]): Promise<File[]> {
  const encryptedIndices: number[] = [];

  for (let i = 0; i < files.length; i++) {
    const encrypted = await isFileEncrypted(files[i]);
    if (encrypted) encryptedIndices.push(i);
  }

  if (encryptedIndices.length === 0) return [...files];

  const decryptedMap = await promptAndDecryptBatch(files, encryptedIndices);
  const skippedSet = new Set(
    encryptedIndices.filter((idx) => !decryptedMap.has(idx))
  );

  const result: File[] = [];
  for (let i = 0; i < files.length; i++) {
    if (skippedSet.has(i)) continue;
    result.push(decryptedMap.get(i) ?? files[i]);
  }

  return result;
}

export async function handleEncryptedFiles(
  files: File[],
  encryptedIndices: number[]
): Promise<Map<number, File>> {
  return promptAndDecryptBatch(files, encryptedIndices);
}
