import type { PDFDocument } from 'pdf-lib';

export const state: {
  activeTool: string | null;
  files: File[];
  pdfDoc: PDFDocument | null;
  pdfPages: unknown[];
  currentPdfUrl: string | null;
} = {
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
