import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  readFileAsArrayBuffer,
  formatBytes,
  getPDFDocument,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument } from 'pdf-lib';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const CONDENSE_PRESETS = {
  light: {
    images: { quality: 90, dpiTarget: 150, dpiThreshold: 200 },
    scrub: { metadata: false, thumbnails: true },
    subsetFonts: true,
  },
  balanced: {
    images: { quality: 75, dpiTarget: 96, dpiThreshold: 150 },
    scrub: { metadata: true, thumbnails: true },
    subsetFonts: true,
  },
  aggressive: {
    images: { quality: 50, dpiTarget: 72, dpiThreshold: 100 },
    scrub: { metadata: true, thumbnails: true, xmlMetadata: true },
    subsetFonts: true,
  },
  extreme: {
    images: { quality: 30, dpiTarget: 60, dpiThreshold: 96 },
    scrub: { metadata: true, thumbnails: true, xmlMetadata: true },
    subsetFonts: true,
  },
};

const PHOTON_PRESETS = {
  light: { scale: 2.0, quality: 0.85 },
  balanced: { scale: 1.5, quality: 0.65 },
  aggressive: { scale: 1.2, quality: 0.45 },
  extreme: { scale: 1.0, quality: 0.25 },
};

async function performCondenseCompression(
  fileBlob: Blob,
  level: string,
  customSettings?: {
    imageQuality?: number;
    dpiTarget?: number;
    dpiThreshold?: number;
    removeMetadata?: boolean;
    subsetFonts?: boolean;
    convertToGrayscale?: boolean;
    removeThumbnails?: boolean;
  }
) {
  const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
  await pymupdf.load();

  const preset =
    CONDENSE_PRESETS[level as keyof typeof CONDENSE_PRESETS] ||
    CONDENSE_PRESETS.balanced;

  const dpiTarget = customSettings?.dpiTarget ?? preset.images.dpiTarget;
  const userThreshold =
    customSettings?.dpiThreshold ?? preset.images.dpiThreshold;
  const dpiThreshold = Math.max(userThreshold, dpiTarget + 10);

  const options = {
    images: {
      enabled: true,
      quality: customSettings?.imageQuality ?? preset.images.quality,
      dpiTarget,
      dpiThreshold,
      convertToGray: customSettings?.convertToGrayscale ?? false,
    },
    scrub: {
      metadata: customSettings?.removeMetadata ?? preset.scrub.metadata,
      thumbnails: customSettings?.removeThumbnails ?? preset.scrub.thumbnails,
      xmlMetadata: (preset.scrub as any).xmlMetadata ?? false,
    },
    subsetFonts: customSettings?.subsetFonts ?? preset.subsetFonts,
    save: {
      garbage: 4 as const,
      deflate: true,
      clean: true,
      useObjstms: true,
    },
  };

  try {
    const result = await pymupdf.compressPdf(fileBlob, options);
    return result;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    if (
      errorMessage.includes('PatternType') ||
      errorMessage.includes('pattern')
    ) {
      console.warn(
        '[CompressPDF] Pattern error detected, retrying without image rewriting:',
        errorMessage
      );

      const fallbackOptions = {
        ...options,
        images: {
          ...options.images,
          enabled: false,
        },
      };

      const result = await pymupdf.compressPdf(fileBlob, fallbackOptions);
      return { ...result, usedFallback: true };
    }

    throw new Error(`PDF compression failed: ${errorMessage}`);
  }
}

async function performPhotonCompression(
  arrayBuffer: ArrayBuffer,
  level: string
) {
  const pdfJsDoc = await getPDFDocument({ data: arrayBuffer }).promise;
  const newPdfDoc = await PDFDocument.create();
  const settings =
    PHOTON_PRESETS[level as keyof typeof PHOTON_PRESETS] ||
    PHOTON_PRESETS.balanced;

  for (let i = 1; i <= pdfJsDoc.numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale: settings.scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport, canvas: canvas })
      .promise;

    const jpegBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(
        (blob) => resolve(blob as Blob),
        'image/jpeg',
        settings.quality
      )
    );
    const jpegBytes = await jpegBlob.arrayBuffer();
    const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
  return await newPdfDoc.save();
}

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const compressOptions = document.getElementById('compress-options');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const algorithmSelect = document.getElementById(
    'compression-algorithm'
  ) as HTMLSelectElement;
  const condenseInfo = document.getElementById('condense-info');
  const photonInfo = document.getElementById('photon-info');
  const toggleCustomSettings = document.getElementById(
    'toggle-custom-settings'
  );
  const customSettingsPanel = document.getElementById('custom-settings-panel');
  const customSettingsChevron = document.getElementById(
    'custom-settings-chevron'
  );

  let useCustomSettings = false;

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  // Toggle algorithm info
  if (algorithmSelect && condenseInfo && photonInfo) {
    algorithmSelect.addEventListener('change', () => {
      if (algorithmSelect.value === 'condense') {
        condenseInfo.classList.remove('hidden');
        photonInfo.classList.add('hidden');
      } else {
        condenseInfo.classList.add('hidden');
        photonInfo.classList.remove('hidden');
      }
    });
  }

  // Toggle custom settings panel
  if (toggleCustomSettings && customSettingsPanel && customSettingsChevron) {
    toggleCustomSettings.addEventListener('click', () => {
      customSettingsPanel.classList.toggle('hidden');
      customSettingsChevron.style.transform =
        customSettingsPanel.classList.contains('hidden')
          ? 'rotate(0deg)'
          : 'rotate(180deg)';
      // Mark that user wants to use custom settings
      if (!customSettingsPanel.classList.contains('hidden')) {
        useCustomSettings = true;
      }
    });
  }

  const updateUI = async () => {
    if (!compressOptions) return;

    if (state.files.length > 0) {
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';

        for (let index = 0; index < state.files.length; index++) {
          const file = state.files[index];
          const fileDiv = document.createElement('div');
          fileDiv.className =
            'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

          const infoContainer = document.createElement('div');
          infoContainer.className = 'flex flex-col overflow-hidden';

          const nameSpan = document.createElement('div');
          nameSpan.className =
            'truncate font-medium text-gray-200 text-sm mb-1';
          nameSpan.textContent = file.name;

          const metaSpan = document.createElement('div');
          metaSpan.className = 'text-xs text-gray-400';
          metaSpan.textContent = formatBytes(file.size);

          infoContainer.append(nameSpan, metaSpan);

          const removeBtn = document.createElement('button');
          removeBtn.className =
            'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
          removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
          removeBtn.onclick = () => {
            state.files = state.files.filter((_, i) => i !== index);
            updateUI();
          };

          fileDiv.append(infoContainer, removeBtn);
          fileDisplayArea.appendChild(fileDiv);
        }

        createIcons({ icons });
      }
      compressOptions.classList.remove('hidden');
    } else {
      compressOptions.classList.add('hidden');
      // Clear file display area
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) fileDisplayArea.innerHTML = '';
    }
  };

  const resetState = () => {
    state.files = [];
    state.pdfDoc = null;

    const compressionLevel = document.getElementById(
      'compression-level'
    ) as HTMLSelectElement;
    if (compressionLevel) compressionLevel.value = 'balanced';

    if (algorithmSelect) algorithmSelect.value = 'condense';

    useCustomSettings = false;
    if (customSettingsPanel) customSettingsPanel.classList.add('hidden');
    if (customSettingsChevron)
      customSettingsChevron.style.transform = 'rotate(0deg)';

    const imageQuality = document.getElementById(
      'image-quality'
    ) as HTMLInputElement;
    const dpiTarget = document.getElementById('dpi-target') as HTMLInputElement;
    const dpiThreshold = document.getElementById(
      'dpi-threshold'
    ) as HTMLInputElement;
    const removeMetadata = document.getElementById(
      'remove-metadata'
    ) as HTMLInputElement;
    const subsetFonts = document.getElementById(
      'subset-fonts'
    ) as HTMLInputElement;
    const convertToGrayscale = document.getElementById(
      'convert-to-grayscale'
    ) as HTMLInputElement;
    const removeThumbnails = document.getElementById(
      'remove-thumbnails'
    ) as HTMLInputElement;

    if (imageQuality) imageQuality.value = '75';
    if (dpiTarget) dpiTarget.value = '96';
    if (dpiThreshold) dpiThreshold.value = '150';
    if (removeMetadata) removeMetadata.checked = true;
    if (subsetFonts) subsetFonts.checked = true;
    if (convertToGrayscale) convertToGrayscale.checked = false;
    if (removeThumbnails) removeThumbnails.checked = true;

    if (condenseInfo) condenseInfo.classList.remove('hidden');
    if (photonInfo) photonInfo.classList.add('hidden');

    updateUI();
  };

  const compress = async () => {
    const level = (
      document.getElementById('compression-level') as HTMLSelectElement
    ).value;
    const algorithm = (
      document.getElementById('compression-algorithm') as HTMLSelectElement
    ).value;
    const convertToGrayscale =
      (document.getElementById('convert-to-grayscale') as HTMLInputElement)
        ?.checked ?? false;

    let customSettings:
      | {
          imageQuality?: number;
          dpiTarget?: number;
          dpiThreshold?: number;
          removeMetadata?: boolean;
          subsetFonts?: boolean;
          convertToGrayscale?: boolean;
          removeThumbnails?: boolean;
        }
      | undefined;

    if (useCustomSettings) {
      const imageQuality =
        parseInt(
          (document.getElementById('image-quality') as HTMLInputElement)?.value
        ) || 75;
      const dpiTarget =
        parseInt(
          (document.getElementById('dpi-target') as HTMLInputElement)?.value
        ) || 96;
      const dpiThreshold =
        parseInt(
          (document.getElementById('dpi-threshold') as HTMLInputElement)?.value
        ) || 150;
      const removeMetadata =
        (document.getElementById('remove-metadata') as HTMLInputElement)
          ?.checked ?? true;
      const subsetFonts =
        (document.getElementById('subset-fonts') as HTMLInputElement)
          ?.checked ?? true;
      const removeThumbnails =
        (document.getElementById('remove-thumbnails') as HTMLInputElement)
          ?.checked ?? true;

      customSettings = {
        imageQuality,
        dpiTarget,
        dpiThreshold,
        removeMetadata,
        subsetFonts,
        convertToGrayscale,
        removeThumbnails,
      };
    } else {
      customSettings = convertToGrayscale ? { convertToGrayscale } : undefined;
    }

    try {
      if (state.files.length === 0) {
        showAlert('No Files', 'Please select at least one PDF file.');
        hideLoader();
        return;
      }

      if (state.files.length === 1) {
        const originalFile = state.files[0];

        let resultBlob: Blob;
        let resultSize: number;
        let usedMethod: string;

        if (algorithm === 'condense') {
          showLoader('Running Condense compression...');
          const result = await performCondenseCompression(
            originalFile,
            level,
            customSettings
          );
          resultBlob = result.blob;
          resultSize = result.compressedSize;
          usedMethod = 'Condense';

          // Check if fallback was used
          if ((result as any).usedFallback) {
            usedMethod +=
              ' (without image optimization due to unsupported patterns)';
          }
        } else {
          showLoader('Running Photon compression...');
          const arrayBuffer = (await readFileAsArrayBuffer(
            originalFile
          )) as ArrayBuffer;
          const resultBytes = await performPhotonCompression(
            arrayBuffer,
            level
          );
          const buffer = resultBytes.buffer.slice(
            resultBytes.byteOffset,
            resultBytes.byteOffset + resultBytes.byteLength
          ) as ArrayBuffer;
          resultBlob = new Blob([buffer], { type: 'application/pdf' });
          resultSize = resultBytes.length;
          usedMethod = 'Photon';
        }

        const originalSize = formatBytes(originalFile.size);
        const compressedSize = formatBytes(resultSize);
        const savings = originalFile.size - resultSize;
        const savingsPercent =
          savings > 0 ? ((savings / originalFile.size) * 100).toFixed(1) : 0;

        downloadFile(
          resultBlob,
          originalFile.name.replace(/\.pdf$/i, '') + '_compressed.pdf'
        );

        hideLoader();

        if (savings > 0) {
          showAlert(
            'Compression Complete',
            `Method: ${usedMethod}. File size reduced from ${originalSize} to ${compressedSize} (Saved ${savingsPercent}%).`,
            'success',
            () => resetState()
          );
        } else {
          showAlert(
            'Compression Finished',
            `Method: ${usedMethod}. Could not reduce file size further. Original: ${originalSize}, New: ${compressedSize}.`,
            'warning',
            () => resetState()
          );
        }
      } else {
        showLoader('Compressing multiple PDFs...');
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;

        for (let i = 0; i < state.files.length; i++) {
          const file = state.files[i];
          showLoader(
            `Compressing ${i + 1}/${state.files.length}: ${file.name}...`
          );
          totalOriginalSize += file.size;

          let resultBytes: Uint8Array;
          if (algorithm === 'condense') {
            const result = await performCondenseCompression(
              file,
              level,
              customSettings
            );
            resultBytes = new Uint8Array(await result.blob.arrayBuffer());
          } else {
            const arrayBuffer = (await readFileAsArrayBuffer(
              file
            )) as ArrayBuffer;
            resultBytes = await performPhotonCompression(arrayBuffer, level);
          }

          totalCompressedSize += resultBytes.length;
          const baseName = file.name.replace(/\.pdf$/i, '');
          zip.file(`${baseName}_compressed.pdf`, resultBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const totalSavings = totalOriginalSize - totalCompressedSize;
        const totalSavingsPercent =
          totalSavings > 0
            ? ((totalSavings / totalOriginalSize) * 100).toFixed(1)
            : 0;

        downloadFile(zipBlob, 'compressed-pdfs.zip');

        hideLoader();

        if (totalSavings > 0) {
          showAlert(
            'Compression Complete',
            `Compressed ${state.files.length} PDF(s). Total size reduced from ${formatBytes(totalOriginalSize)} to ${formatBytes(totalCompressedSize)} (Saved ${totalSavingsPercent}%).`,
            'success',
            () => resetState()
          );
        } else {
          showAlert(
            'Compression Finished',
            `Compressed ${state.files.length} PDF(s). Total size: ${formatBytes(totalCompressedSize)}.`,
            'info',
            () => resetState()
          );
        }
      }
    } catch (e: any) {
      hideLoader();
      console.error('[CompressPDF] Error:', e);
      showAlert(
        'Error',
        `An error occurred during compression. Error: ${e.message}`
      );
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      state.files = [...state.files, ...Array.from(files)];
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
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(
          (f) => f.type === 'application/pdf'
        );
        if (pdfFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          pdfFiles.forEach((f) => dataTransfer.items.add(f));
          handleFileSelect(dataTransfer.files);
        }
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
});
