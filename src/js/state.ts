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

    const imageInput = document.getElementById('image-watermark-input') as HTMLInputElement | null;
    if (imageInput) imageInput.value = '';

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
