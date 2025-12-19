import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes, downloadFile, getPDFDocument } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';

interface SignState {
    file: File | null;
    pdfDoc: any;
    viewerIframe: HTMLIFrameElement | null;
    viewerReady: boolean;
    blobUrl: string | null;
}

const signState: SignState = {
    file: null,
    pdfDoc: null,
    viewerIframe: null,
    viewerReady: false,
    blobUrl: null,
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    createIcons({ icons });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) {
                handleFile(droppedFiles[0]);
            }
        });

        // Clear value on click to allow re-selecting the same file
        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', applyAndSaveSignatures);
    }

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        cleanup();
        window.location.href = import.meta.env.BASE_URL;
    });
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleFile(input.files[0]);
    }
}

function handleFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Invalid File', 'Please select a PDF file.');
        return;
    }

    signState.file = file;
    updateFileDisplay();
    setupSignTool();
}

async function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');

    if (!fileDisplayArea || !signState.file) return;

    fileDisplayArea.innerHTML = '';

    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = signState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(signState.file.size)} • Loading pages...`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide=\"trash-2\" class=\"w-4 h-4\"></i>';
    removeBtn.onclick = () => {
        signState.file = null;
        signState.pdfDoc = null;
        fileDisplayArea.innerHTML = '';
        document.getElementById('signature-editor')?.classList.add('hidden');
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    // Load page count
    try {
        const arrayBuffer = await readFileAsArrayBuffer(signState.file);
        const pdfDoc = await getPDFDocument({ data: arrayBuffer }).promise;
        metaSpan.textContent = `${formatBytes(signState.file.size)} • ${pdfDoc.numPages} pages`;
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

async function setupSignTool() {
    const signatureEditor = document.getElementById('signature-editor');
    if (signatureEditor) {
        signatureEditor.classList.remove('hidden');
    }

    showLoader('Loading PDF viewer...');

    const container = document.getElementById('canvas-container-sign');
    if (!container) {
        console.error('Sign tool canvas container not found');
        hideLoader();
        return;
    }

    if (!signState.file) {
        console.error('No file loaded for signing');
        hideLoader();
        return;
    }

    container.textContent = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    container.appendChild(iframe);
    signState.viewerIframe = iframe;

    const pdfBytes = await readFileAsArrayBuffer(signState.file);
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    signState.blobUrl = URL.createObjectURL(blob);

    try {
        const existingPrefsRaw = localStorage.getItem('pdfjs.preferences');
        const existingPrefs = existingPrefsRaw ? JSON.parse(existingPrefsRaw) : {};
        delete (existingPrefs as any).annotationEditorMode;
        const newPrefs = {
            ...existingPrefs,
            enableSignatureEditor: true,
            enablePermissions: false,
        };
        localStorage.setItem('pdfjs.preferences', JSON.stringify(newPrefs));
    } catch { }

    const viewerUrl = new URL(`${import.meta.env.BASE_URL}pdfjs-viewer/viewer.html`, window.location.origin);
    const query = new URLSearchParams({ file: signState.blobUrl });
    iframe.src = `${viewerUrl.toString()}?${query.toString()}`;

    iframe.onload = () => {
        hideLoader();
        signState.viewerReady = true;
        try {
            const viewerWindow: any = iframe.contentWindow;
            if (viewerWindow && viewerWindow.PDFViewerApplication) {
                const app = viewerWindow.PDFViewerApplication;
                const doc = viewerWindow.document;
                const eventBus = app.eventBus;
                eventBus?._on('annotationeditoruimanager', () => {
                    const editorModeButtons = doc.getElementById('editorModeButtons');
                    editorModeButtons?.classList.remove('hidden');
                    const editorSignature = doc.getElementById('editorSignature');
                    editorSignature?.removeAttribute('hidden');
                    const editorSignatureButton = doc.getElementById('editorSignatureButton') as HTMLButtonElement | null;
                    if (editorSignatureButton) {
                        editorSignatureButton.disabled = false;
                    }
                    const editorStamp = doc.getElementById('editorStamp');
                    editorStamp?.removeAttribute('hidden');
                    const editorStampButton = doc.getElementById('editorStampButton') as HTMLButtonElement | null;
                    if (editorStampButton) {
                        editorStampButton.disabled = false;
                    }
                    try {
                        const highlightBtn = doc.getElementById('editorHighlightButton') as HTMLButtonElement | null;
                        highlightBtn?.click();
                    } catch { }
                });
            }
        } catch (e) {
            console.error('Could not initialize PDF.js viewer for signing:', e);
        }

        const saveBtn = document.getElementById('process-btn') as HTMLButtonElement | null;
        if (saveBtn) {
            saveBtn.style.display = '';
        }
    };
}

async function applyAndSaveSignatures() {
    if (!signState.viewerReady || !signState.viewerIframe) {
        showAlert('Viewer not ready', 'Please wait for the PDF viewer to load.');
        return;
    }

    try {
        const viewerWindow: any = signState.viewerIframe.contentWindow;
        if (!viewerWindow || !viewerWindow.PDFViewerApplication) {
            showAlert('Viewer not ready', 'The PDF viewer is still initializing.');
            return;
        }

        const app = viewerWindow.PDFViewerApplication;
        const flattenCheckbox = document.getElementById('flatten-signature-toggle') as HTMLInputElement | null;
        const shouldFlatten = flattenCheckbox?.checked;

        if (shouldFlatten) {
            showLoader('Flattening and saving PDF...');

            const rawPdfBytes = await app.pdfDocument.saveDocument(app.pdfDocument.annotationStorage);
            const pdfBytes = new Uint8Array(rawPdfBytes);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            pdfDoc.getForm().flatten();
            const flattenedPdfBytes = await pdfDoc.save();

            const blob = new Blob([flattenedPdfBytes as BlobPart], { type: 'application/pdf' });
            downloadFile(blob, `signed_flattened_${signState.file?.name || 'document.pdf'}`);

            hideLoader();
            showAlert('Success', 'Signed PDF saved successfully!', 'success', () => {
                resetState();
            });
        } else {
            app.eventBus?.dispatch('download', { source: app });
            showAlert('Success', 'Signed PDF downloaded successfully!', 'success', () => {
                resetState();
            });
        }
    } catch (error) {
        console.error('Failed to export the signed PDF:', error);
        hideLoader();
        showAlert('Export failed', 'Could not export the signed PDF. Please try again.');
    }
}

function resetState() {
    cleanup();
    signState.file = null;
    signState.viewerIframe = null;
    signState.viewerReady = false;

    const signatureEditor = document.getElementById('signature-editor');
    if (signatureEditor) {
        signatureEditor.classList.add('hidden');
    }

    const container = document.getElementById('canvas-container-sign');
    if (container) {
        container.textContent = '';
    }

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';
    }

    const processBtn = document.getElementById('process-btn') as HTMLButtonElement | null;
    if (processBtn) {
        processBtn.style.display = 'none';
    }

    const flattenCheckbox = document.getElementById('flatten-signature-toggle') as HTMLInputElement | null;
    if (flattenCheckbox) {
        flattenCheckbox.checked = false;
    }
}

function cleanup() {
    if (signState.blobUrl) {
        URL.revokeObjectURL(signState.blobUrl);
        signState.blobUrl = null;
    }
}
