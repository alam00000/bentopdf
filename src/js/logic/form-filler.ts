import { showLoader, hideLoader, showAlert } from '../ui.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';

let viewerIframe: HTMLIFrameElement | null = null;
let viewerReady = false;


export async function setupFormFiller() {
  if (!state.files || !state.files[0]) return;

  showLoader('Loading PDF form...');
  const pdfViewerContainer = document.getElementById('pdf-viewer-container');

  if (!pdfViewerContainer) {
    console.error('PDF viewer container not found');
    hideLoader();
    return;
  }

  try {
    pdfViewerContainer.innerHTML = '';

    const file = state.files[0];
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    viewerIframe = document.createElement('iframe');
    viewerIframe.src = `${import.meta.env.BASE_URL || ''}/pdfjs-viewer/viewer.html?file=${encodeURIComponent(blobUrl)}`;
    viewerIframe.style.width = '100%';
    viewerIframe.style.height = '100%';
    viewerIframe.style.border = 'none';

    viewerIframe.onload = () => {
      viewerReady = true;
      hideLoader();
    };

    pdfViewerContainer.appendChild(viewerIframe);

    const formFillerOptions = document.getElementById('form-filler-options');
    if (formFillerOptions) formFillerOptions.classList.remove('hidden');
  } catch (e) {
    console.error('Critical error setting up form filler:', e);
    showAlert(
      'Error',
      'Failed to load PDF form viewer.'
    );
    hideLoader();
  }
}

export async function processAndDownloadForm() {
  if (!viewerIframe || !viewerReady) {
    showAlert('Viewer not ready', 'Please wait for the form to finish loading.');
    return;
  }

  try {
    const viewerWindow = viewerIframe.contentWindow;
    if (!viewerWindow) {
      console.error('Cannot access iframe window');
      showAlert(
        'Download',
        'Please use the Download button in the PDF viewer toolbar above.'
      );
      return;
    }

    const viewerDoc = viewerWindow.document;
    if (!viewerDoc) {
      console.error('Cannot access iframe document');
      showAlert(
        'Download',
        'Please use the Download button in the PDF viewer toolbar above.'
      );
      return;
    }

    const downloadBtn = viewerDoc.getElementById('downloadButton') as HTMLButtonElement | null;

    if (downloadBtn) {
      console.log('Clicking download button...');
      downloadBtn.click();
    } else {
      console.error('Download button not found in viewer');
      const secondaryDownload = viewerDoc.getElementById('secondaryDownload') as HTMLButtonElement | null;
      if (secondaryDownload) {
        console.log('Clicking secondary download button...');
        secondaryDownload.click();
      } else {
        showAlert(
          'Download',
          'Please use the Download button in the PDF viewer toolbar above.'
        );
      }
    }
  } catch (e) {
    console.error('Failed to trigger download:', e);
    showAlert(
      'Download',
      'Cannot access viewer controls. Please use the Download button in the PDF viewer toolbar above.'
    );
  }
}
