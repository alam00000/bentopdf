import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import {
  renderReorderableFileList,
  destroyReorderableFileList,
} from '../utils/reorderable-file-list.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import {
  getSelectedQuality,
  compressImageBytes,
} from '../utils/image-compress.js';

let files: File[] = [];

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const processBtn = document.getElementById('process-btn');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
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
        handleFiles(droppedFiles);
      }
    });

    // Clear value on click to allow re-selecting the same file
    fileInput?.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
    });
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => {
      fileInput?.click();
    });
  }

  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', () => {
      files = [];
      updateUI();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', convertToPdf);
  }

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFiles(input.files);
  }
}

function handleFiles(newFiles: FileList) {
  const validFiles = Array.from(newFiles).filter(
    (file) =>
      file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
  );

  if (validFiles.length < newFiles.length) {
    showAlert(
      'Invalid Files',
      'Some files were skipped. Only PNG images are allowed.'
    );
  }

  if (validFiles.length > 0) {
    files = [...files, ...validFiles];
    updateUI();
  }
}

const resetState = () => {
  files = [];
  updateUI();
};

function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const optionsDiv = document.getElementById('jpg-to-pdf-options');

  if (!fileDisplayArea || !fileControls || !optionsDiv) return;

  fileDisplayArea.innerHTML = '';

  if (files.length > 0) {
    fileControls.classList.remove('hidden');
    optionsDiv.classList.remove('hidden');

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
    optionsDiv.classList.add('hidden');
  }
}

function sanitizeImageAsJpeg(imageBytes: Uint8Array | ArrayBuffer) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([
      imageBytes instanceof Uint8Array
        ? new Uint8Array(imageBytes)
        : imageBytes,
    ]);
    const imageUrl = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        async (jpegBlob) => {
          if (!jpegBlob) {
            return reject(new Error('Canvas toBlob conversion failed.'));
          }
          const arrayBuffer = await jpegBlob.arrayBuffer();
          resolve(new Uint8Array(arrayBuffer));
        },
        'image/jpeg',
        0.9
      );
      URL.revokeObjectURL(imageUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(
        new Error(
          'The provided file could not be loaded as an image. It may be corrupted.'
        )
      );
    };

    img.src = imageUrl;
  });
}

async function convertToPdf() {
  if (files.length === 0) {
    showAlert('No Files', 'Please select at least one JPG file.');
    return;
  }

  showLoader('Creating PDF from JPGs...');

  try {
    const pdfDoc = await PDFLibDocument.create();
    const quality = getSelectedQuality();

    for (const file of files) {
      const originalBytes = await readFileAsArrayBuffer(file);
      const compressed = await compressImageBytes(
        new Uint8Array(originalBytes as ArrayBuffer),
        quality
      );
      let embeddedImage;

      if (compressed.type === 'jpeg') {
        embeddedImage = await pdfDoc.embedJpg(compressed.bytes);
      } else {
        try {
          embeddedImage = await pdfDoc.embedPng(compressed.bytes);
        } catch {
          const fallback = await sanitizeImageAsJpeg(originalBytes);
          embeddedImage = await pdfDoc.embedJpg(fallback as Uint8Array);
        }
      }

      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_jpgs.pdf'
    );
    showAlert('Success', 'PDF created successfully!', 'success', () => {
      resetState();
    });
  } catch (e: unknown) {
    console.error(e);
    showAlert('Conversion Error', e instanceof Error ? e.message : String(e));
  } finally {
    hideLoader();
  }
}
