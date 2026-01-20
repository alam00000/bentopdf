import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { state } from '../state.js';
import { createIcons, icons } from 'lucide';
import { parseEmailFile, renderEmailToHtml } from './email-to-pdf.js';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

const EXTENSIONS = ['.eml', '.msg'];
const TOOL_NAME = 'Email';

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  const convertOptions = document.getElementById('convert-options');

  const updateUI = async () => {
    if (!fileDisplayArea || !processBtn || !fileControls) return;

    if (state.files.length > 0) {
      fileDisplayArea.innerHTML = '';

      for (let index = 0; index < state.files.length; index++) {
        const file = state.files[index];
        const fileDiv = document.createElement('div');
        fileDiv.className =
          'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
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
      fileControls.classList.remove('hidden');
      if (convertOptions) convertOptions.classList.remove('hidden');
      (processBtn as HTMLButtonElement).disabled = false;
    } else {
      fileDisplayArea.innerHTML = '';
      fileControls.classList.add('hidden');
      if (convertOptions) convertOptions.classList.add('hidden');
      (processBtn as HTMLButtonElement).disabled = true;
    }
  };

  const resetState = () => {
    state.files = [];
    state.pdfDoc = null;
    updateUI();
  };

  const convertToPdf = async () => {
    try {
      if (state.files.length === 0) {
        showAlert(
          'No Files',
          `Please select at least one ${TOOL_NAME} file (.eml or .msg).`
        );
        return;
      }

      const pageSizeSelect = document.getElementById(
        'page-size'
      ) as HTMLSelectElement;
      const includeCcBccCheckbox = document.getElementById(
        'include-cc-bcc'
      ) as HTMLInputElement;
      const includeAttachmentsCheckbox = document.getElementById(
        'include-attachments'
      ) as HTMLInputElement;

      const pageSize =
        (pageSizeSelect?.value as 'a4' | 'letter' | 'legal') || 'a4';
      const includeCcBcc = includeCcBccCheckbox?.checked ?? true;
      const includeAttachments = includeAttachmentsCheckbox?.checked ?? true;

      showLoader('Loading PDF engine...');
      const pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
      await pymupdf.load();

      if (state.files.length === 1) {
        const originalFile = state.files[0];
        showLoader(`Parsing ${originalFile.name}...`);

        const email = await parseEmailFile(originalFile);

        showLoader('Generating PDF...');
        const htmlContent = renderEmailToHtml(email, {
          includeCcBcc,
          includeAttachments,
          pageSize,
        });

        const pdfBlob = await (pymupdf as any).htmlToPdf(htmlContent, {
          pageSize,
          margins: { top: 50, right: 50, bottom: 50, left: 50 },
          attachments: email.attachments
            .filter((a) => a.content)
            .map((a) => ({
              filename: a.filename,
              content: a.content!,
            })),
        });
        const fileName = originalFile.name.replace(/\.[^.]+$/, '') + '.pdf';

        downloadFile(pdfBlob, fileName);
        hideLoader();

        showAlert(
          'Conversion Complete',
          `Successfully converted ${originalFile.name} to PDF.`,
          'success',
          () => resetState()
        );
      } else {
        showLoader('Converting emails...');
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        for (let i = 0; i < state.files.length; i++) {
          const file = state.files[i];
          showLoader(
            `Converting ${i + 1}/${state.files.length}: ${file.name}...`
          );

          try {
            const email = await parseEmailFile(file);

            const htmlContent = renderEmailToHtml(email, {
              includeCcBcc,
              includeAttachments,
              pageSize,
            });

            const pdfBlob = await (pymupdf as any).htmlToPdf(htmlContent, {
              pageSize,
              margins: { top: 50, right: 50, bottom: 50, left: 50 },
              attachments: email.attachments
                .filter((a) => a.content)
                .map((a) => ({
                  filename: a.filename,
                  content: a.content!,
                })),
            });
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const pdfBuffer = await pdfBlob.arrayBuffer();
            zip.file(`${baseName}.pdf`, pdfBuffer);
          } catch (e: any) {
            console.error(`Failed to convert ${file.name}:`, e);
          }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, 'emails-converted.zip');

        hideLoader();

        showAlert(
          'Conversion Complete',
          `Successfully converted ${state.files.length} ${TOOL_NAME} file(s) to PDF.`,
          'success',
          () => resetState()
        );
      }
    } catch (e: any) {
      console.error(`[${TOOL_NAME}2PDF] ERROR:`, e);
      hideLoader();
      showAlert(
        'Error',
        `An error occurred during conversion. Error: ${e.message}`
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
        const validFiles = Array.from(files).filter((f) => {
          const name = f.name.toLowerCase();
          return EXTENSIONS.some((ext) => name.endsWith(ext));
        });
        if (validFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((f) => dataTransfer.items.add(f));
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
    processBtn.addEventListener('click', convertToPdf);
  }
});
