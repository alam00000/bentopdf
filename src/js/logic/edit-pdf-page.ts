// Logic for PDF Editor Page
import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { formatBytes, downloadFile } from '../utils/helpers.js';

const embedPdfWasmUrl = new URL(
  'embedpdf-snippet/dist/pdfium.wasm',
  import.meta.url
).href;

let viewerInstance: any = null;
let docManagerPlugin: any = null;
let isViewerInitialized = false;
const fileEntryMap = new Map<string, HTMLElement>();

function resetViewer() {
  const pdfWrapper = document.getElementById('embed-pdf-wrapper');
  const pdfContainer = document.getElementById('embed-pdf-container');
  const downloadBtn = document.getElementById('download-edited-pdf');
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (pdfContainer) pdfContainer.textContent = '';
  if (pdfWrapper) pdfWrapper.classList.add('hidden');
  if (downloadBtn) downloadBtn.classList.add('hidden');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';
  if (fileInput) fileInput.value = '';
  viewerInstance = null;
  docManagerPlugin = null;
  isViewerInitialized = false;
  fileEntryMap.clear();
}

function removeFileEntry(documentId: string) {
  const entry = fileEntryMap.get(documentId);
  if (entry) {
    entry.remove();
    fileEntryMap.delete(documentId);
  }
  if (fileEntryMap.size === 0) {
    resetViewer();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-lime-500');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-lime-500');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-lime-500');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    });

    fileInput?.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
    });
  }

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

async function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    await handleFiles(input.files);
  }
}

async function handleFiles(files: FileList) {
  const pdfFiles = Array.from(files).filter(
    (f) => f.type === 'application/pdf'
  );
  if (pdfFiles.length === 0) {
    showAlert('Invalid File', 'Please upload a valid PDF file.');
    return;
  }

  showLoader('Loading PDF Editor...');

  try {
    const pdfWrapper = document.getElementById('embed-pdf-wrapper');
    const pdfContainer = document.getElementById('embed-pdf-container');
    const fileDisplayArea = document.getElementById('file-display-area');

    if (!pdfWrapper || !pdfContainer || !fileDisplayArea) return;

    if (!isViewerInitialized) {
      const firstFile = pdfFiles[0];
      const firstBuffer = await firstFile.arrayBuffer();

      pdfContainer.textContent = '';
      pdfWrapper.classList.remove('hidden');

      const { default: EmbedPDF } = await import('embedpdf-snippet');
      viewerInstance = EmbedPDF.init({
        type: 'container',
        target: pdfContainer,
        worker: true,
        wasmUrl: embedPdfWasmUrl,
        export: {
          defaultFileName: firstFile.name,
        },
        documentManager: {
          maxDocuments: 10,
        },
        tabBar: 'always',
      });

      const registry = await viewerInstance.registry;
      docManagerPlugin = registry.getPlugin('document-manager').provides();

      docManagerPlugin.onDocumentClosed((data: any) => {
        const docId = data?.id || data;
        removeFileEntry(docId);
      });

      docManagerPlugin.onDocumentOpened((data: any) => {
        const docId = data?.id;
        const docName = data?.name;
        if (!docId) return;
        const pendingEntry = fileDisplayArea.querySelector(
          `[data-pending-name="${CSS.escape(docName)}"]`
        ) as HTMLElement;
        if (pendingEntry) {
          pendingEntry.removeAttribute('data-pending-name');
          fileEntryMap.set(docId, pendingEntry);
          const removeBtn = pendingEntry.querySelector(
            '[data-remove-btn]'
          ) as HTMLElement;
          if (removeBtn) {
            removeBtn.onclick = () => {
              docManagerPlugin.closeDocument(docId);
            };
          }
        }
      });

      addFileEntries(fileDisplayArea, pdfFiles);

      docManagerPlugin.openDocumentBuffer({
        buffer: firstBuffer,
        name: firstFile.name,
        autoActivate: true,
      });

      for (let i = 1; i < pdfFiles.length; i++) {
        const buffer = await pdfFiles[i].arrayBuffer();
        docManagerPlugin.openDocumentBuffer({
          buffer,
          name: pdfFiles[i].name,
          autoActivate: false,
        });
      }

      isViewerInitialized = true;

      let downloadBtn = document.getElementById('download-edited-pdf');
      if (!downloadBtn) {
        downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-edited-pdf';
        downloadBtn.className = 'btn-gradient w-full mt-6';
        downloadBtn.textContent = 'Download Edited PDF';
        pdfWrapper.appendChild(downloadBtn);
      }
      downloadBtn.classList.remove('hidden');

      downloadBtn.onclick = async () => {
        try {
          const exportPlugin = registry.getPlugin('export').provides();
          const arrayBuffer = await exportPlugin.saveAsCopy().toPromise();
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          downloadFile(blob, 'edited-document.pdf');
        } catch (err) {
          console.error('Error downloading PDF:', err);
          showAlert('Error', 'Failed to download the edited PDF.');
        }
      };

      const backBtn = document.getElementById('back-to-tools');
      if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode?.replaceChild(newBackBtn, backBtn);

        newBackBtn.addEventListener('click', () => {
          window.location.href = import.meta.env.BASE_URL;
        });
      }
    } else {
      addFileEntries(fileDisplayArea, pdfFiles);

      for (const file of pdfFiles) {
        const buffer = await file.arrayBuffer();
        docManagerPlugin.openDocumentBuffer({
          buffer,
          name: file.name,
          autoActivate: true,
        });
      }
    }
  } catch (error) {
    console.error('Error loading PDF Editor:', error);
    showAlert('Error', 'Failed to load the PDF Editor.');
  } finally {
    hideLoader();
  }
}

function addFileEntries(fileDisplayArea: HTMLElement, files: File[]) {
  for (const file of files) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg';
    fileDiv.setAttribute('data-pending-name', file.name);

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = formatBytes(file.size);

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.setAttribute('data-remove-btn', 'true');
    removeBtn.onclick = () => {
      fileDiv.remove();
      if (fileDisplayArea.children.length === 0) {
        resetViewer();
      }
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
  }

  createIcons({ icons });
}
