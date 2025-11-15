import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';

const worker = new Worker('/workers/edit-attachments.worker.js');

let allAttachments: Array<{ index: number; name: string; page: number; data: Uint8Array }> = [];
let attachmentsToRemove: Set<number> = new Set();

export async function setupEditAttachmentsTool() {
  const optionsDiv = document.getElementById('edit-attachments-options');
  if (!optionsDiv || !state.files || state.files.length === 0) return;

  optionsDiv.classList.remove('hidden');
  await loadAttachmentsList();
}

async function loadAttachmentsList() {
  const attachmentsList = document.getElementById('attachments-list');
  if (!attachmentsList || !state.files || state.files.length === 0) return;

  attachmentsList.innerHTML = '';
  attachmentsToRemove.clear();
  allAttachments = [];

  try {
    showLoader('Loading attachments...');

    const file = state.files[0];
    const fileBuffer = await readFileAsArrayBuffer(file);

    const message = {
      command: 'get-attachments',
      fileBuffer: fileBuffer,
      fileName: file.name
    };

    worker.postMessage(message, [fileBuffer]);
  } catch (error) {
    console.error('Error loading attachments:', error);
    hideLoader();
    showAlert('Error', 'Failed to load attachments from PDF.');
  }
}


worker.onmessage = (e) => {
  const data = e.data;

  if (data.status === 'success' && data.attachments !== undefined) {
    const attachments = data.attachments;
    allAttachments = attachments.map(att => ({
      ...att,
      data: new Uint8Array(att.data)
    }));

    displayAttachments(attachments);
    hideLoader();
  } else if (data.status === 'success' && data.modifiedPDF !== undefined) {
    hideLoader();

    downloadFile(
      new Blob([new Uint8Array(data.modifiedPDF)], { type: 'application/pdf' }),
      `edited-attachments-${data.fileName}`
    );

    showAlert('Success', 'Attachments updated successfully!');
  } else if (data.status === 'error') {
    hideLoader();
    showAlert('Error', data.message || 'Unknown error occurred.');
  }
};

worker.onerror = (error) => {
  hideLoader();
  console.error('Worker error:', error);
  showAlert('Error', 'Worker error occurred. Check console for details.');
};

function displayAttachments(attachments) {
  const attachmentsList = document.getElementById('attachments-list');
  if (!attachmentsList) return;

  const existingControls = attachmentsList.querySelector('.attachments-controls');
  attachmentsList.innerHTML = '';
  if (existingControls) {
    attachmentsList.appendChild(existingControls);
  }

  if (attachments.length === 0) {
    const noAttachments = document.createElement('p');
    noAttachments.className = 'text-gray-400 text-center py-4';
    noAttachments.textContent = 'No attachments found in this PDF.';
    attachmentsList.appendChild(noAttachments);
    return;
  }

  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'attachments-controls mb-4 flex justify-end';
  const removeAllBtn = document.createElement('button');
  removeAllBtn.className = 'btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm';
  removeAllBtn.textContent = 'Remove All Attachments';
  removeAllBtn.onclick = () => {
    if (allAttachments.length === 0) return;

    const allSelected = allAttachments.every(attachment => attachmentsToRemove.has(attachment.index));

    if (allSelected) {
      allAttachments.forEach(attachment => {
        attachmentsToRemove.delete(attachment.index);
        const element = document.querySelector(`[data-attachment-index="${attachment.index}"]`);
        if (element) {
          element.classList.remove('opacity-50', 'line-through');
          const removeBtn = element.querySelector('button');
          if (removeBtn) {
            removeBtn.classList.remove('bg-gray-600');
            removeBtn.classList.add('bg-red-600');
          }
        }
      });
      removeAllBtn.textContent = 'Remove All Attachments';
    } else {
      allAttachments.forEach(attachment => {
        attachmentsToRemove.add(attachment.index);
        const element = document.querySelector(`[data-attachment-index="${attachment.index}"]`);
        if (element) {
          element.classList.add('opacity-50', 'line-through');
          const removeBtn = element.querySelector('button');
          if (removeBtn) {
            removeBtn.classList.add('bg-gray-600');
            removeBtn.classList.remove('bg-red-600');
          }
        }
      });
      removeAllBtn.textContent = 'Deselect All';
    }
  };

  controlsContainer.appendChild(removeAllBtn);
  attachmentsList.appendChild(controlsContainer);

  for (const attachment of attachments) {
    const attachmentDiv = document.createElement('div');
    attachmentDiv.className = 'flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700';
    attachmentDiv.dataset.attachmentIndex = attachment.index.toString();

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'text-white font-medium block';
    nameSpan.textContent = attachment.name;

    const levelSpan = document.createElement('span');
    levelSpan.className = 'text-gray-400 text-sm block';
    if (attachment.page === 0) {
      levelSpan.textContent = 'Document-level attachment';
    } else {
      levelSpan.textContent = `Page ${attachment.page} attachment`;
    }

    infoDiv.append(nameSpan, levelSpan);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex items-center gap-2';

    const removeBtn = document.createElement('button');
    removeBtn.className = `btn ${attachmentsToRemove.has(attachment.index) ? 'bg-gray-600' : 'bg-red-600'} hover:bg-red-700 text-white px-3 py-1 rounded text-sm`;
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.title = 'Remove attachment';
    removeBtn.onclick = () => {
      if (attachmentsToRemove.has(attachment.index)) {
        attachmentsToRemove.delete(attachment.index);
        attachmentDiv.classList.remove('opacity-50', 'line-through');
        removeBtn.classList.remove('bg-gray-600');
        removeBtn.classList.add('bg-red-600');
      } else {
        attachmentsToRemove.add(attachment.index);
        attachmentDiv.classList.add('opacity-50', 'line-through');
        removeBtn.classList.add('bg-gray-600');
        removeBtn.classList.remove('bg-red-600');
      }
      const allSelected = allAttachments.every(attachment => attachmentsToRemove.has(attachment.index));
      removeAllBtn.textContent = allSelected ? 'Deselect All' : 'Remove All Attachments';
    };

    actionsDiv.append(removeBtn);
    attachmentDiv.append(infoDiv, actionsDiv);
    attachmentsList.appendChild(attachmentDiv);
  }
}

export async function editAttachments() {
  if (!state.files || state.files.length === 0) {
    showAlert('Error', 'No PDF file loaded.');
    return;
  }

  showLoader('Processing attachments...');

  try {
    const file = state.files[0];
    const fileBuffer = await readFileAsArrayBuffer(file);

    const message = {
      command: 'edit-attachments',
      fileBuffer: fileBuffer,
      fileName: file.name,
      attachmentsToRemove: Array.from(attachmentsToRemove)
    };

    worker.postMessage(message, [fileBuffer]);
  } catch (error) {
    console.error('Error editing attachments:', error);
    hideLoader();
    showAlert('Error', 'Failed to edit attachments.');
  }
}