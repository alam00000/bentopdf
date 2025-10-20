export const state = {
  activeTool: null,
  files: [],
  pdfDoc: null,
  pdfPages: [],
  currentPdfUrl: null,
};

// Resets the state when switching views or completing an operation.
export function resetState() {
  state.activeTool = null;
  state.files = [];
  state.pdfDoc = null;
  state.pdfPages = [];
  state.currentPdfUrl = null;
  document.getElementById('tool-content').innerHTML = '';
}

//  resetStateAfterProcess
// This function clears only the uploaded file and its related state after a PDF operation (like watermarking)
// without removing the entire tool content. It safely resets file input, display, and related UI elements.
export function resetStateAfterProcess() {
  try {
    // Clear state properties related to the uploaded PDF
    state.files = [];
    state.pdfDoc = null;

    if (state.currentPdfUrl) {
      URL.revokeObjectURL(state.currentPdfUrl);
      state.currentPdfUrl = null;
    }

    const fileInput = document.getElementById(
      'file-input'
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';

    const watermarkText = document.getElementById(
      'watermark-text'
    ) as HTMLInputElement;
    if (watermarkText) watermarkText.value = '';
    const fontSize = document.getElementById('font-size') as HTMLInputElement;
    if (fontSize) fontSize.value = '72';
    const textColor = document.getElementById('text-color') as HTMLInputElement;
    if (textColor) textColor.value = '#000000';
    const opacityText = document.getElementById(
      'opacity-text'
    ) as HTMLInputElement;
    if (opacityText) opacityText.value = '0.3';
    const angleText = document.getElementById('angle-text') as HTMLInputElement;
    if (angleText) angleText.value = '0';

    const imageInput = document.getElementById(
      'image-watermark-input'
    ) as HTMLInputElement;
    if (imageInput) imageInput.value = '';
    const opacityImage = document.getElementById(
      'opacity-image'
    ) as HTMLInputElement;
    if (opacityImage) opacityImage.value = '0.3';
    const angleImage = document.getElementById(
      'angle-image'
    ) as HTMLInputElement;
    if (angleImage) angleImage.value = '0';

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.textContent = '';

    const fileControls = document.getElementById('file-controls');
    if (fileControls) fileControls.classList.add('hidden');

    const optionsDivs = document.querySelector(
      '[id$="-options"], [id$="-preview"], [id$="-organizer"], [id$="-rotator"], [id$="-editor"]'
    ) as HTMLElement | null;
    if (optionsDivs) optionsDivs.classList.add('hidden');

    const processBtn = document.getElementById(
      'process-btn'
    ) as HTMLButtonElement | null;
    if (processBtn) {
      processBtn.disabled = true;
      processBtn.onclick = null;
    }
  } catch (error) {
    console.error('Error while resetting state after process:', error);
  }
}
