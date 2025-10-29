import { showLoader, hideLoader, showAlert } from '../ui';
import { readFileAsArrayBuffer, downloadFile } from '../utils/helpers';
import { state } from '../state';
import { t } from '../i18n/index.js';
let attachments: File[] = [];

export async function addAttachments() {
  if (!state.pdfDoc) {
    showAlert(String(t('alerts.error')), String(t('alerts.mainPdfNotLoaded')));
    return;
  }
  if (attachments.length === 0) {
    showAlert(String(t('alerts.noFiles')), String(t('alerts.selectFilesToAttach')));
    return;
  }

  showLoader(String(t('alerts.embeddingFiles')));
  try {
    const pdfDoc = state.pdfDoc;

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      showLoader(String(t('alerts.attachingFile', { fileName: file.name, current: i + 1, total: attachments.length })));

      const fileBytes = await readFileAsArrayBuffer(file);

      await pdfDoc.attach(fileBytes as ArrayBuffer, file.name, {
        mimeType: file.type || 'application/octet-stream',
        description: `Attached file: ${file.name}`,
        creationDate: new Date(),
        modificationDate: new Date(file.lastModified),
      });
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([pdfBytes], { type: 'application/pdf' }),
      `attached-${state.files[0].name}`
    );

    showAlert(
      String(t('alerts.success')),
      String(t('alerts.filesAttachedSuccessfully', { count: attachments.length }))
    );
  } catch (error: any) {
    console.error('Error attaching files:', error);
    showAlert(String(t('alerts.error')), String(t('alerts.failedAttachFiles')) + ` ${error.message}`);
  } finally {
    hideLoader();
    clearAttachments();
  }
}

function clearAttachments() {
  attachments = [];
  const fileListDiv = document.getElementById('attachment-file-list');
  const attachmentInput = document.getElementById(
    'attachment-files-input'
  ) as HTMLInputElement;
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;

  if (fileListDiv) fileListDiv.innerHTML = '';
  if (attachmentInput) attachmentInput.value = '';
  if (processBtn) {
    processBtn.disabled = true;
    processBtn.classList.add('hidden');
  }
}

let isSetup = false; // Prevent duplicate setup

export function setupAddAttachmentsTool() {
  if (isSetup) return; // Already set up
  isSetup = true;

  const optionsDiv = document.getElementById('attachment-options');
  const attachmentInput = document.getElementById(
    'attachment-files-input'
  ) as HTMLInputElement;
  const fileListDiv = document.getElementById('attachment-file-list');
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;

  if (!optionsDiv || !attachmentInput || !fileListDiv || !processBtn) {
    console.error('Attachment tool UI elements not found.');
    return;
  }

  optionsDiv.classList.remove('hidden');

  attachmentInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      attachments = Array.from(files);

      fileListDiv.innerHTML = '';
      attachments.forEach((file) => {
        const div = document.createElement('div');
        div.className =
          'flex justify-between items-center p-2 bg-gray-800 rounded-md text-white';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate text-sm';
        nameSpan.textContent = file.name;

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'text-xs text-gray-400';
        sizeSpan.textContent = `${Math.round(file.size / 1024)} KB`;

        div.appendChild(nameSpan);
        div.appendChild(sizeSpan);
        fileListDiv.appendChild(div);
      });

      processBtn.disabled = false;
      processBtn.classList.remove('hidden');
    } else {
      clearAttachments();
    }
  });

  processBtn.onclick = addAttachments;
}
