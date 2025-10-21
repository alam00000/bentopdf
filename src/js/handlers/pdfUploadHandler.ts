import { state } from '../state.js';
import {
  showLoader,
  hideLoader,
  showAlert,
  renderPageThumbnails,
} from '../ui.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { setupCanvasEditor } from '../canvasEditor.js';
import { toolLogic } from '../logic/index.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export async function handleSinglePdfUpload(toolId, file) {
  showLoader('Loading PDF...');
  try {
    const pdfBytes = await readFileAsArrayBuffer(file);
    state.pdfDoc = await PDFLibDocument.load(pdfBytes as ArrayBuffer, {
      ignoreEncryption: true,
    });
    hideLoader();

    if (
      state.pdfDoc.isEncrypted &&
      toolId !== 'decrypt' &&
      toolId !== 'change-permissions'
    ) {
      showAlert(
        'Protected PDF',
        'This PDF is password-protected. Please use the Decrypt or Change Permissions tool first.'
      );
      return;
    }

    const optionsDiv = document.querySelector(
      '[id$="-options"], [id$="-preview"], [id$="-organizer"], [id$="-rotator"], [id$="-editor"]'
    );
    if (optionsDiv) optionsDiv.classList.remove('hidden');

    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
      (processBtn as HTMLButtonElement).disabled = false;
      processBtn.classList.remove('hidden');
      const logic = toolLogic[toolId];
      if (logic) {
        const func =
          typeof logic.process === 'function' ? logic.process : logic;
        processBtn.onclick = func;
      }
    }

    if (
      [
        'split',
        'delete-pages',
        'add-blank-page',
        'extract-pages',
        'add-header-footer',
      ].includes(toolId)
    ) {
      document.getElementById('total-pages').textContent = state.pdfDoc
        .getPageCount()
        .toString();
    }

    if (toolId === 'organize' || toolId === 'rotate') {
      await renderPageThumbnails(toolId, state.pdfDoc);
    }

    if (['crop', 'redact'].includes(toolId)) {
      await setupCanvasEditor(toolId);
    }

    if (toolId === 'create-form') {
      document.getElementById('create-form-editor').classList.remove('hidden');
    }

    if (toolLogic[toolId] && typeof toolLogic[toolId].setup === 'function') {
      toolLogic[toolId].setup();
    }
  } catch (e) {
    hideLoader();
    showAlert(
      'Error',
      'Could not load PDF. The file may be invalid, corrupted, or password-protected.'
    );
    console.error(e);
  }
}
