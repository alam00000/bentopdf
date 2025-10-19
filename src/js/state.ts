export const state = {
  activeTool: null,
  files: [],
  pdfDocs: [],
  pdfDoc: null,
  pdfPages: [],
  currentPdfUrl: null,
};

// Resets the state when switching views or completing an operation.
export function resetState() {
  state.activeTool = null;
  state.files = [];
  state.pdfDocs = [];
  state.pdfDoc = null;
  state.pdfPages = [];
  state.currentPdfUrl = null;
  document.getElementById('tool-content').innerHTML = '';
}
