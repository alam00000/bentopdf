import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import {
  renderReorderableFileList,
  destroyReorderableFileList,
} from '../utils/reorderable-file-list.js';
import heic2any from 'heic2any';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

let files: File[] = [];

const updateUI = () => {
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const processBtn = document.getElementById('process-btn');

  if (!fileDisplayArea || !fileControls || !processBtn) return;

  fileDisplayArea.innerHTML = '';

  if (files.length > 0) {
    fileControls.classList.remove('hidden');
    processBtn.classList.remove('hidden');

    renderReorderableFileList({
      container: fileDisplayArea,
      files,
      onReorder: (reordered) => {
        files = reordered;
      },
      onRemove: (index) => {
        files = files.filter((_, i) => i !== index);
        updateUI();
      },
    });
  } else {
    destroyReorderableFileList(fileDisplayArea);
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
    showAlert('No Files', 'Please select at least one HEIC file.');
    return;
  }
  showLoader('Converting HEIC to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of files) {
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.92,
      });
      const pngBlob = Array.isArray(conversionResult)
        ? conversionResult[0]
        : conversionResult;
      const pngBytes = await pngBlob.arrayBuffer();
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
      'from_heic.pdf'
    );
    showAlert('Success', 'PDF created successfully!', 'success', () => {
      resetState();
    });
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert HEIC to PDF. One of the files may be invalid.'
    );
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
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
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
    );

    if (validFiles.length < newFiles.length) {
      showAlert(
        'Invalid Files',
        'Some files were skipped. Only HEIC/HEIF files are allowed.'
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
