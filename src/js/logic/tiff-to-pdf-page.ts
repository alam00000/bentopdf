import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import {
  renderReorderableFileList,
  destroyReorderableFileList,
} from '../utils/reorderable-file-list.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { decode } from 'tiff';
import { tiffIfdToRgba } from '../utils/tiff-utils.js';

let files: File[] = [];

const updateUI = () => {
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const processBtn = document.getElementById('process-btn');

  const optionsPanel = document.getElementById('tiff-options');

  if (!fileDisplayArea || !fileControls || !processBtn) return;

  fileDisplayArea.innerHTML = '';

  if (files.length > 0) {
    fileControls.classList.remove('hidden');
    processBtn.classList.remove('hidden');
    optionsPanel?.classList.remove('hidden');

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
    optionsPanel?.classList.add('hidden');
  }
};

const resetState = () => {
  files = [];
  updateUI();
};

async function convert() {
  if (files.length === 0) {
    showAlert('No Files', 'Please select at least one TIFF file.');
    return;
  }
  const qualitySelect = document.getElementById(
    'tiff-pdf-quality'
  ) as HTMLSelectElement;
  const quality = qualitySelect?.value || 'medium';
  const jpegQualityMap: Record<string, number> = {
    high: 0.92,
    medium: 0.75,
    low: 0.5,
  };
  const useJpeg = quality !== 'high';
  const jpegQuality = jpegQualityMap[quality] || 0.75;

  showLoader('Converting TIFF to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of files) {
      const tiffBytes = await readFileAsArrayBuffer(file);
      const ifds = decode(tiffBytes as ArrayBuffer);

      for (const ifd of ifds) {
        const width = ifd.width;
        const height = ifd.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const rgba = tiffIfdToRgba(
          ifd.data,
          width,
          height,
          ifd.samplesPerPixel || 1,
          ifd.type
        );
        const imageData = ctx.createImageData(width, height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(
            res,
            useJpeg ? 'image/jpeg' : 'image/png',
            useJpeg ? jpegQuality : undefined
          )
        );
        if (!blob) continue;

        canvas.width = 0;
        canvas.height = 0;

        const imgBytes = await blob.arrayBuffer();
        const image = useJpeg
          ? await pdfDoc.embedJpg(imgBytes)
          : await pdfDoc.embedPng(imgBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
    }
    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_tiff.pdf'
    );
    showAlert('Success', 'PDF created successfully!', 'success', () => {
      resetState();
    });
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert TIFF to PDF. One of the files may be invalid.'
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
        file.type === 'image/tiff' ||
        file.name.toLowerCase().endsWith('.tiff') ||
        file.name.toLowerCase().endsWith('.tif')
    );

    if (validFiles.length < newFiles.length) {
      showAlert(
        'Invalid Files',
        'Some files were skipped. Only TIFF files are allowed.'
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
