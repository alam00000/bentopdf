import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import {
  createDragHandle,
  enableFileListReorder,
  moveItem,
} from '../utils/sortable-file-list.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

import { trText, onPageReady } from '../i18n/i18n.js';

let files: File[] = [];

async function convertImageToPngBytes(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error(trText("تعذر الحصول على سياق Canvas")));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, 'image/png')
        );
        if (!pngBlob) {
          reject(new Error(trText("تعذر إنشاء كائن PNG blob")));
          return;
        }
        const pngBytes = await pngBlob.arrayBuffer();
        resolve(pngBytes);
      };
      img.onerror = () => reject(new Error(trText("تعذر تحميل الصورة.")));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error(trText("تعذرت قراءة الملف.")));
    reader.readAsDataURL(file);
  });
}

const updateUI = () => {
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const processBtn = document.getElementById('process-btn');

  if (!fileDisplayArea || !fileControls || !processBtn) return;

  fileDisplayArea.innerHTML = '';

  if (files.length > 0) {
    fileControls.classList.remove('hidden');
    processBtn.classList.remove('hidden');

    files.forEach((file, index) => {
      const fileDiv = document.createElement('div');
      fileDiv.className =
        'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

      const infoContainer = document.createElement('div');
      infoContainer.className = 'flex items-center gap-2 overflow-hidden';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'truncate font-medium text-gray-200';
      nameSpan.textContent = file.name;

      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'flex-shrink-0 text-gray-400 text-xs';
      sizeSpan.textContent = trText('({{size}})', {
        size: formatBytes(file.size),
      });

      infoContainer.append(createDragHandle(), nameSpan, sizeSpan);

      const removeBtn = document.createElement('button');
      removeBtn.className =
        'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
      removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      removeBtn.onclick = () => {
        files = files.filter((_, i) => i !== index);
        updateUI();
      };

      fileDiv.append(infoContainer, removeBtn);
      fileDisplayArea.appendChild(fileDiv);
    });
    enableFileListReorder(fileDisplayArea, (oldIndex, newIndex) => {
      files = moveItem(files, oldIndex, newIndex);
      updateUI();
    });
    createIcons({ icons });
  } else {
    fileControls.classList.add('hidden');
    processBtn.classList.add('hidden');
  }
};

const resetState = () => {
  files = [];
  updateUI();
};

async function convert() {
  if (files.length === 0) {
    showAlert("لا توجد ملفات", "يرجى اختيار ملف BMP واحد على الأقل.");
    return;
  }
  showLoader("جارٍ تحويل BMP إلى PDF...");
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of files) {
      const pngBytes = await convertImageToPngBytes(file);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    }
    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_bmps.pdf'
    );
    showAlert("تم بنجاح", "تم إنشاء PDF بنجاح!", 'success', () => {
      resetState();
    });
  } catch (e) {
    console.error(e);
    showAlert(
      "خطأ",
      "تعذر تحويل BMP إلى PDF. قد يكون أحد الملفات غير صالح."
    );
  } finally {
    hideLoader();
  }
}

onPageReady(() => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const validFiles = Array.from(newFiles).filter(
      (file) =>
        file.type === 'image/bmp' || file.name.toLowerCase().endsWith('.bmp')
    );

    if (validFiles.length < newFiles.length) {
      showAlert(
        "ملفات غير صالحة",
        "تم تخطي بعض الملفات. يُسمح بملفات BMP فقط."
      );
    }

    if (validFiles.length > 0) {
      files = [...files, ...validFiles];
      updateUI();
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
      handleFileSelect(e.dataTransfer?.files ?? null);
    });

    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      fileInput?.click();
    });
  }

  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', () => {
      resetState();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', convert);
  }
});
