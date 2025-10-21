import { state } from '../state.js';
import {
  showLoader,
  hideLoader,
  showAlert,
  renderPageThumbnails,
  renderFileDisplay,
  switchView,
} from '../ui.js';
import { formatIsoDate, readFileAsArrayBuffer } from '../utils/helpers.js';
import { setupCanvasEditor } from '../canvasEditor.js';
import { toolLogic } from '../logic/index.js';
import { renderDuplicateOrganizeThumbnails } from '../logic/duplicate-organize.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import Sortable from 'sortablejs';
import {
  multiFileTools,
  simpleTools,
  singlePdfLoadTools,
} from '../config/pdf-tools.js';
import * as pdfjsLib from 'pdfjs-dist';
import { handleSinglePdfUpload } from './pdfUploadHandler.js';

async function handleMultiFileUpload(toolId) {
  if (
    toolId === 'merge' ||
    toolId === 'alternate-merge' ||
    toolId === 'reverse-pages'
  ) {
    const pdfFilesUnloaded: File[] = [];

    state.files.forEach((file) => {
      if (file.type === 'application/pdf') {
        pdfFilesUnloaded.push(file);
      }
    });

    const pdfFilesLoaded = await Promise.all(
      pdfFilesUnloaded.map(async (file) => {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFLibDocument.load(pdfBytes as ArrayBuffer, {
          ignoreEncryption: true,
        });

        return {
          file,
          pdfDoc,
        };
      })
    );

    const foundEncryptedPDFs = pdfFilesLoaded.filter(
      (pdf) => pdf.pdfDoc.isEncrypted
    );

    if (foundEncryptedPDFs.length > 0) {
      const encryptedPDFFileNames = [];
      foundEncryptedPDFs.forEach((encryptedPDF) => {
        encryptedPDFFileNames.push(encryptedPDF.file.name);
      });

      const errorMessage = `PDFs found that are password-protected\n\nPlease use the Decrypt or Change Permissions tool on these files first:\n\n${encryptedPDFFileNames.join('\n')}`;

      showAlert('Protected PDFs', errorMessage);

      switchView('grid');

      return;
    }
  }

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    (processBtn as HTMLButtonElement).disabled = false;
    const logic = toolLogic[toolId];
    if (logic) {
      const func = typeof logic.process === 'function' ? logic.process : logic;
      processBtn.onclick = func;
    }
  }

  if (toolId === 'merge') {
    toolLogic.merge.setup();
  } else if (toolId === 'alternate-merge') {
    toolLogic['alternate-merge'].setup();
  } else if (toolId === 'image-to-pdf') {
    const imageList = document.getElementById('image-list');
    imageList.textContent = ''; // Clear safely

    state.files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const li = document.createElement('li');
      li.className = 'relative group cursor-move';
      li.dataset.fileName = file.name;

      const img = document.createElement('img');
      img.src = url;
      img.className =
        'w-full h-full object-cover rounded-md border-2 border-gray-600';

      const p = document.createElement('p');
      p.className =
        'absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center truncate p-1';
      p.textContent = file.name; // Safe insertion

      li.append(img, p);
      imageList.appendChild(li);
    });

    Sortable.create(imageList);
  }
}

export function setupFileInputHandler(toolId) {
  const fileInput = document.getElementById('file-input');
  const isMultiFileTool = multiFileTools.includes(toolId);
  let isFirstUpload = true;

  const processFiles = async (newFiles) => {
    if (newFiles.length === 0) return;

    if (!isMultiFileTool || isFirstUpload) {
      state.files = newFiles;
    } else {
      state.files = [...state.files, ...newFiles];
    }
    isFirstUpload = false;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) {
      renderFileDisplay(fileDisplayArea, state.files);
    }

    const fileControls = document.getElementById('file-controls');
    if (fileControls) {
      fileControls.classList.remove('hidden');
      createIcons({ icons });
    }

    if (isMultiFileTool) {
      await handleMultiFileUpload(toolId);
    } else if (singlePdfLoadTools.includes(toolId)) {
      await handleSinglePdfUpload(toolId, state.files[0]);
    } else if (simpleTools.includes(toolId)) {
      const optionsDivId =
        toolId === 'change-permissions'
          ? 'permissions-options'
          : `${toolId}-options`;
      const optionsDiv = document.getElementById(optionsDivId);
      if (optionsDiv) optionsDiv.classList.remove('hidden');
      const processBtn = document.getElementById('process-btn');
      if (processBtn) {
        (processBtn as HTMLButtonElement).disabled = false;
        processBtn.onclick = () => {
          const logic = toolLogic[toolId];
          if (logic) {
            const func =
              typeof logic.process === 'function' ? logic.process : logic;
            func();
          }
        };
      }
    } else if (toolId === 'edit') {
      const file = state.files[0];
      if (!file) return;

      const pdfWrapper = document.getElementById('embed-pdf-wrapper');
      const pdfContainer = document.getElementById('embed-pdf-container');

      pdfContainer.textContent = ''; // Clear safely

      if (state.currentPdfUrl) {
        URL.revokeObjectURL(state.currentPdfUrl);
      }
      pdfWrapper.classList.remove('hidden');
      const fileURL = URL.createObjectURL(file);
      state.currentPdfUrl = fileURL;

      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
                import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';
                EmbedPDF.init({
                    type: 'container',
                    target: document.getElementById('embed-pdf-container'),
                    src: '${fileURL}',
                    theme: 'dark',
                });
            `;
      document.head.appendChild(script);

      const backBtn = document.getElementById('back-to-grid');
      const urlRevoker = () => {
        URL.revokeObjectURL(fileURL);
        state.currentPdfUrl = null;
        backBtn.removeEventListener('click', urlRevoker);
      };
      backBtn.addEventListener('click', urlRevoker);
    }
  };

  fileInput.addEventListener('change', (e) =>
    processFiles(Array.from((e.target as HTMLInputElement).files || []))
  );

  const dropZone = document.getElementById('drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-600');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-600');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-600');
      const files = Array.from(e.dataTransfer.files);
      (fileInput as HTMLInputElement).files = e.dataTransfer.files;
      processFiles(files);
    });
  }

  const setupAddMoreButton = () => {
    const addMoreBtn = document.getElementById('add-more-btn');
    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => fileInput.click());
    }
  };

  const setupClearButton = () => {
    const clearBtn = document.getElementById('clear-files-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.files = [];
        isFirstUpload = true;
        (fileInput as HTMLInputElement).value = '';

        const fileDisplayArea = document.getElementById('file-display-area');
        if (fileDisplayArea) fileDisplayArea.textContent = '';

        const fileControls = document.getElementById('file-controls');
        if (fileControls) fileControls.classList.add('hidden');

        const toolSpecificUI = [
          'file-list',
          'page-merge-preview',
          'image-list',
          'alternate-file-list',
        ];
        toolSpecificUI.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = '';
        });

        const processBtn = document.getElementById('process-btn');
        if (processBtn) (processBtn as HTMLButtonElement).disabled = true;
      });
    }
  };

  setTimeout(() => {
    setupAddMoreButton();
    setupClearButton();
  }, 100);
}
