import { showAlert } from '../ui.js';
import {
  downloadFile,
  formatBytes,
  initializeQpdf,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import { EncryptPdfState, QpdfInstanceExtended } from '@/types';

import { trText, onPageReady } from '../i18n/i18n.js';

const pageState: EncryptPdfState = {
  file: null,
};

function resetState() {
  pageState.file = null;

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  const userPasswordInput = document.getElementById(
    'user-password-input'
  ) as HTMLInputElement;
  if (userPasswordInput) userPasswordInput.value = '';

  const ownerPasswordInput = document.getElementById(
    'owner-password-input'
  ) as HTMLInputElement;
  if (ownerPasswordInput) ownerPasswordInput.value = '';
}

async function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (pageState.file) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col overflow-hidden';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = pageState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = formatBytes(pageState.file.size);

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = function () {
      resetState();
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    if (toolOptions) toolOptions.classList.remove('hidden');
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      pageState.file = file;
      updateUI();
    }
  }
}

async function encryptPdf() {
  if (!pageState.file) {
    showAlert("لا يوجد ملف", "يرجى رفع ملف PDF أولًا.");
    return;
  }

  const userPassword =
    (document.getElementById('user-password-input') as HTMLInputElement)
      ?.value || '';
  const ownerPasswordInput =
    (document.getElementById('owner-password-input') as HTMLInputElement)
      ?.value || '';

  if (!userPassword) {
    showAlert("إدخال مطلوب", "يرجى إدخال كلمة مرور المستخدم.");
    return;
  }

  const ownerPassword = ownerPasswordInput || userPassword;
  const hasDistinctOwnerPassword = ownerPasswordInput !== '';

  const inputPath = '/input.pdf';
  const outputPath = '/output.pdf';
  let qpdf: QpdfInstanceExtended;

  const loaderModal = document.getElementById('loader-modal');
  const loaderText = document.getElementById('loader-text');

  try {
    if (loaderModal) loaderModal.classList.remove('hidden');
    if (loaderText)
      loaderText.textContent = trText("جارٍ تهيئة التشفير...");

    qpdf = await initializeQpdf();

    if (loaderText) loaderText.textContent = trText("جارٍ قراءة PDF...");
    const fileBuffer = await readFileAsArrayBuffer(pageState.file);
    const uint8Array = new Uint8Array(fileBuffer as ArrayBuffer);

    qpdf.FS.writeFile(inputPath, uint8Array);

    if (loaderText)
      loaderText.textContent = trText("جارٍ تشفير PDF باستخدام AES بطول 256 بت...");

    const args = [inputPath, '--encrypt', userPassword, ownerPassword, '256'];

    // Only add restrictions if a distinct owner password was provided
    if (hasDistinctOwnerPassword) {
      args.push(
        '--modify=none',
        '--extract=n',
        '--print=none',
        '--accessibility=n',
        '--annotate=n',
        '--assemble=n',
        '--form=n',
        '--modify-other=n'
      );
    }

    args.push('--', outputPath);

    try {
      qpdf.callMain(args);
    } catch (qpdfError: unknown) {
      console.error('qpdf execution error:', qpdfError);
      throw new Error(
        'Encryption failed: ' +
          (qpdfError instanceof Error ? qpdfError.message : "خطأ غير معروف"),
        { cause: qpdfError }
      );
    }

    if (loaderText) loaderText.textContent = trText("جارٍ تجهيز التنزيل...");
    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });

    if (!outputFile || outputFile.length === 0) {
      throw new Error(trText("أدى التشفير إلى ملف فارغ."));
    }

    const blob = new Blob([new Uint8Array(outputFile)], {
      type: 'application/pdf',
    });
    downloadFile(blob, pageState.file.name);

    if (loaderModal) loaderModal.classList.add('hidden');

    let successMessage = trText("تم تشفير PDF بنجاح باستخدام AES بطول 256 بت!");
    if (!hasDistinctOwnerPassword) {
      successMessage += ` ${trText(
        "ملاحظة: بدون كلمة مرور مالك منفصلة، لا تكون لملف PDF أي قيود استخدام."
      )}`;
    }

    showAlert("تم بنجاح", successMessage, 'success', () => {
      resetState();
    });
  } catch (error: unknown) {
    console.error('Error during PDF encryption:', error);
    if (loaderModal) loaderModal.classList.add('hidden');
    showAlert(
      "فشل التشفير",
      trText("حدث خطأ: {{error}}", {
        error:
          error instanceof Error
            ? error.message
            : trText("قد يكون PDF تالفًا."),
      })
    );
  } finally {
    try {
      if (qpdf?.FS) {
        try {
          qpdf.FS.unlink(inputPath);
        } catch (e) {
          console.warn('Failed to unlink input file:', e);
        }
        try {
          qpdf.FS.unlink(outputPath);
        } catch (e) {
          console.warn('Failed to unlink output file:', e);
        }
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup WASM FS:', cleanupError);
    }
  }
}

onPageReady(function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', function (e) {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(function (f) {
          return (
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
          );
        });
        if (pdfFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFiles[0]);
          handleFileSelect(dataTransfer.files);
        }
      }
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', encryptPdf);
  }
});
